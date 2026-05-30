import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as UserModel from "../models/user.model.js";
import { sendWhatsAppOTP } from "../utils/twilio.js";

// Simple in-memory cache for development (use Redis in production)
const otpCache = new Map();

export const citizenRequestOtp = async (req, res) => {
  try {
    const { phone_number } = req.body;

    // Check if citizen is deactivated
    const existingUser = await UserModel.findUserByPhone(phone_number);
    if (existingUser && existingUser.is_active === false) {
      return res.status(403).json({
        status: "error",
        message:
          "Your account has been disabled. Please contact the administrator.",
      });
    }

    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[Twilio SMS] Sending OTP ${mockOtp} to ${phone_number}`);

    // DEMO ACCOUNT BYPASS FOR GOOGLE PLAY REVIEW
    if (phone_number === "6000026296") {
      otpCache.set(phone_number, {
        otp: "123456",
        expiresAt: Date.now() + 5 * 60 * 1000,
      });
      return res
        .status(200)
        .json({ status: "success", message: "Demo OTP bypassed" });
    }

    // Save to in-memory cache with 5 minutes expiration
    otpCache.set(phone_number, {
      otp: mockOtp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // Send actual OTP via Twilio WhatsApp Sandbox
    await sendWhatsAppOTP(phone_number, mockOtp);

    res.status(200).json({
      status: "success",
      message: "OTP sent successfully via WhatsApp",
    });
  } catch (error) {
    console.error("[citizenRequestOtp Error]", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const citizenVerifyOtp = async (req, res) => {
  try {
    const { phone_number, otp } = req.body;

    const cached = otpCache.get(phone_number);

    if (!cached) {
      return res.status(400).json({
        error: "OTP expired or not requested. Please request a new one.",
      });
    }

    if (Date.now() > cached.expiresAt) {
      otpCache.delete(phone_number);
      return res
        .status(400)
        .json({ error: "OTP has expired. Please request a new one." });
    }

    if (cached.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP provided." });
    }

    // OTP matched, delete from cache
    otpCache.delete(phone_number);

    let user = await UserModel.findUserByPhone(phone_number);

    if (user && user.is_active === false) {
      return res.status(403).json({
        status: "error",
        message:
          "Your account has been disabled. Please contact the administrator.",
      });
    }

    if (!user) {
      // New user
      user = await UserModel.createIncompleteCitizen(phone_number);

      const token = jwt.sign(
        { id: user.id, role: user.role, status: user.profile_status },
        process.env.JWT_SECRET,
        { expiresIn: "15m" },
      );

      return res.status(200).json({
        status: "success",
        message: "OTP verified. Please complete your profile.",
        token,
        isNewUser: true,
      });
    }

    // Existing user
    if (user.profile_status === "incomplete") {
      const token = jwt.sign(
        { id: user.id, role: user.role, status: user.profile_status },
        process.env.JWT_SECRET,
        { expiresIn: "15m" },
      );

      return res.status(200).json({
        status: "success",
        message: "Please complete your profile.",
        token,
        isNewUser: true,
      });
    }

    // Complete profile user
    const token = jwt.sign(
      { id: user.id, role: user.role, status: user.profile_status },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      status: "success",
      message: "Login successful",
      token,
      isNewUser: false,
    });
  } catch (error) {
    console.error("[citizenVerifyOtp Error]", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const citizenCompleteProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from JWT middleware
    const { full_name, email, username } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    const updatedUser = await UserModel.completeCitizenProfile(
      userId,
      full_name,
      normalizedEmail,
      username,
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const token = jwt.sign(
      {
        id: updatedUser.id,
        role: updatedUser.role,
        status: updatedUser.profile_status,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      status: "success",
      message: "Profile completed successfully",
      token,
    });
  } catch (error) {
    console.error("[citizenCompleteProfile Error]", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const policeAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    const admin = await UserModel.findUserByEmail(normalizedEmail);

    if (!admin || !["police_admin", "super_admin"].includes(admin.role)) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    if (admin.is_active === false) {
      return res.status(403).json({
        error:
          "Your account has been disabled. Please contact the administrator.",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, role: admin.role, status: admin.profile_status },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }, // Shorter lived for admin
    );

    res.status(200).json({
      status: "success",
      message: "Admin login successful",
      token,
    });
  } catch (error) {
    console.error("[policeAdminLogin Error]", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const citizenLogout = async (req, res) => {
  try {
    // Save the token to the PostgreSQL invalidated_tokens table
    const token = req.token;
    // req.user.exp is in seconds, convert to JavaScript Date object
    const expiresAt = new Date(req.user.exp * 1000);

    await UserModel.invalidateToken(token, expiresAt);

    res.status(200).json({
      status: "success",
      message: "Logged out securely. Token has been permanently invalidated.",
    });
  } catch (error) {
    console.error("[citizenLogout Error]", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const adminLogout = async (req, res) => {
  try {
    const token = req.token;
    const expiresAt = new Date(req.user.exp * 1000);

    await UserModel.invalidateToken(token, expiresAt);

    res.status(200).json({
      status: "success",
      message:
        "Admin logged out securely. Token has been permanently invalidated.",
    });
  } catch (error) {
    console.error("[adminLogout Error]", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
