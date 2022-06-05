const Twilio = require('twilio');
const {PhoneNumberFormat, PhoneNumberUtil} = require('google-libphonenumber');

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  TWILIO_STATUS_CALLBACK_URL
} = process.env;

const phoneUtil = PhoneNumberUtil.getInstance();
const client = Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
  lazyLoading: true
});

const normalizePhoneNumber = (phoneNumber) => {
  try {
    // return null if phoneNumber has letters
    if (/[a-z]/i.test(phoneNumber)) {
      return null;
    }

    return phoneUtil.format(
      // assume +1 country code if not specified
      phoneUtil.parse(phoneNumber, 'US'),
      PhoneNumberFormat.E164,
    );
  } catch (e) {
    return null;
  }
};

const sendMessage = async (phoneNumber, message) => {
  try {
    const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
    const response = await client.messages
      .create({
        body: message,
        from: TWILIO_PHONE_NUMBER,
        to: normalizedPhoneNumber,
        statusCallback: TWILIO_STATUS_CALLBACK_URL
      });
    return {success: true, response};
  } catch (e) {
    console.error(e);
    return {success: false, message: e.message};
  }
}

module.exports = {
  sendMessage
}