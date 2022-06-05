const router = require("express-promise-router")();
const {authenticateToken} = require("../../services/authentication/token");
const twilio_service = require("../../services/twilio/twilio_service");

router.post("/webhook",
  async (req, res) => {
    const messageSid = req.body.MessageSid;
    const messageStatus = req.body.MessageStatus;

    console.log(req.body);
    console.log(`SID: ${messageSid}, Status: ${messageStatus}`);

    return res.sendStatus(200);
  })

module.exports = router;