import rateLimit from 'express-rate-limit';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Specific rate limiter for OTP login / request endpoints.
 * Production: 5 requests per 10 minutes per IP (Prevents Twilio SMS/WhatsApp toll fraud).
 * Development: 50 requests per 10 minutes.
 */
export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: isProduction ? 5 : 50,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many OTP requests from this IP. Please wait 10 minutes before requesting again.',
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * Specific rate limiter for OTP verification endpoints.
 * Production: 20 verification attempts per 5 minutes per IP (Accommodates shared Wi-Fi / CGNAT IPs).
 * (Note: Per-user brute-force is also strictly prevented by 3-attempt OTP invalidation in auth.controller.js)
 * Development: 60 verification attempts per 5 minutes.
 */
export const verifyOtpRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: isProduction ? 20 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many OTP verification attempts from this IP. Please try again after 5 minutes.',
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * Dedicated rate limiter for Admin Login endpoints.
 * Production: 5 attempts per 15 minutes per IP (OWASP standard for password brute-force prevention).
 * Development: 30 attempts per 15 minutes.
 */
export const adminLoginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 5 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many failed admin login attempts. Please try again after 15 minutes.',
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * General API rate limiter (optional but recommended for global protection)
 * Production: 350 requests per 15 minutes per IP.
 * Development: 1000 requests per 15 minutes.
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 350 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * Specific rate limiter for generating presigned upload URLs.
 * Production: 25 upload requests per 15 minutes per IP (Allows connection drop retries).
 * Development: 120 requests per 15 minutes.
 */
export const presignedUrlRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 25 : 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many upload requests. Please wait 15 minutes before uploading more.',
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * Specific rate limiter for Citizen Violation Reports.
 * Production: 15 reports per 30 minutes per IP.
 * Development: 60 reports per 30 minutes.
 */
export const reportRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: isProduction ? 15 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'You have reached the maximum number of violation reports allowed. Please try again after 30 minutes.',
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * Specific rate limiter for Citizen Feedback.
 * Production: 5 feedbacks per hour per IP.
 * Development: 50 feedbacks per hour.
 */
export const feedbackRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isProduction ? 5 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'You have reached the maximum number of feedbacks allowed per hour to prevent spam. Please try again later.',
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});
