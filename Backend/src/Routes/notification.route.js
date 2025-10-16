const express = require("express");
const router = express.Router();
const {
  sendSMSNotification,
  sendPushNotification,
  getNotificationStatus,
  retryFailedNotifications
} = require("../Controllers/notification.controller");


router.post("/sms", sendSMSNotification);
router.post("/push", sendPushNotification);
router.get("/status/:emergencyId", getNotificationStatus);
router.post("/retry/:emergencyId", retryFailedNotifications);

module.exports = router;