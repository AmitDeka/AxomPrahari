import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Initialize Twilio Client
const twilioClient = twilio(accountSid, authToken);

export const sendWhatsAppOTP = async (targetPhone, otpCode) => {
  try {
    // Twilio WhatsApp numbers must be prefixed with "whatsapp:"
    const message = await twilioClient.messages.create({
      contentSid: 'HX229f5a04fd0510ce1b071852155d3e75',
      contentVariables: JSON.stringify({ "1": otpCode }),
      from: `whatsapp:${process.env.TWILIO_SANDBOX_NUMBER}`, // e.g., '+14155238886'
      to: `whatsapp:+91${targetPhone}` // Assumes Indian number
    });
    return message.sid;
  } catch (error) {
    console.error('[Twilio Error]:', error.message || error);
    throw new Error('Failed to send WhatsApp OTP');
  }
};
