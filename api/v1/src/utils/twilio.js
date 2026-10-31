import twilio from 'twilio';
import 'dotenv/config';

let twilioClient = null;

const getClient = () => {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN) are missing.');
    }
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
};

export const sendWhatsAppOTP = async (targetPhone, otpCode) => {
  try {
    const client = getClient();
    const sandboxNumber = process.env.TWILIO_SANDBOX_NUMBER || '+14155238886';

    const messagePayload = {
      body: `Your Axom Prahari verification code is: ${otpCode}. Valid for 5 minutes. Do not share this OTP with anyone.`,
      from: `whatsapp:${sandboxNumber.startsWith('+') ? sandboxNumber : '+' + sandboxNumber}`,
      to: `whatsapp:+91${targetPhone}`
    };

    // If an approved custom Content Template SID is provided, use it; otherwise send standard body
    if (process.env.TWILIO_CONTENT_SID) {
      messagePayload.contentSid = process.env.TWILIO_CONTENT_SID;
      messagePayload.contentVariables = JSON.stringify({ "1": otpCode });
      delete messagePayload.body;
    }

    const message = await client.messages.create(messagePayload);
    return message.sid;
  } catch (error) {
    console.error('[Twilio Error]:', error.message || error);
    throw new Error(error.message || 'Failed to send WhatsApp OTP');
  }
};
