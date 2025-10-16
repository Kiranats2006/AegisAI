const EmergencyEvent = require("../Model/Emergency.model");
const Contact = require("../Model/Contact.model");
const { 
  sendSMSWithFallback, 
  sendPushWithFallback,
  initializeFirebase 
} = require("../services/notification.service");

// Initialize Firebase on startup
initializeFirebase();

// Task 6.1: SMS Notifications with Real Twilio
const sendSMSNotification = async (req, res) => {
  try {
    const { emergencyId, contactIds, customMessage } = req.body;

    if (!emergencyId) {
      return res.status(400).json({
        success: false,
        message: "Emergency ID is required"
      });
    }

    // Get emergency details
    const emergency = await EmergencyEvent.findById(emergencyId)
      .populate('userId', 'name');

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency event not found"
      });
    }

    // Get contacts to notify
    let contacts;
    if (contactIds && contactIds.length > 0) {
      contacts = await Contact.find({
        _id: { $in: contactIds },
        isActive: true
      });
    } else {
      contacts = await Contact.find({
        userId: emergency.userId,
        isActive: true
      }).sort({ priority: 1 });
    }

    if (contacts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No emergency contacts found"
      });
    }

    // Create notification message
    const userName = emergency.userId?.name || 'User';
    const defaultMessage = `🚨 EMERGENCY ALERT: ${userName} is experiencing a ${emergency.emergencyType} emergency. Please check on them immediately. Location: ${emergency.location?.address?.city || 'Unknown location'}. Severity: ${emergency.severity}.`;
    
    const message = customMessage || defaultMessage;

    // Send REAL SMS to each contact
    const results = [];
    for (const contact of contacts) {
      const smsResult = await sendSMSWithFallback(contact.phone, message);
      
      // Track notification
      const notificationRecord = {
        contactId: contact._id,
        method: 'sms',
        sentAt: new Date(),
        status: smsResult.status,
        messageId: smsResult.messageId,
        retryCount: 0,
        provider: process.env.TWILIO_ACCOUNT_SID ? 'twilio' : 'simulation'
      };

      emergency.notifications.push(notificationRecord);
      results.push({
        contact: {
          name: contact.name,
          phone: contact.phone,
          relationship: contact.relationship
        },
        ...smsResult
      });
    }

    await emergency.save();

    const provider = process.env.TWILIO_ACCOUNT_SID ? 'Twilio' : 'Simulation';
    
    res.json({
      success: true,
      message: `${provider} SMS notifications sent to ${results.length} contacts`,
      data: {
        emergencyId: emergency._id,
        provider: provider,
        results: results,
        summary: {
          total: results.length,
          delivered: results.filter(r => r.status === 'delivered' || r.status === 'sent').length,
          failed: results.filter(r => r.status === 'failed').length
        }
      }
    });

  } catch (error) {
    console.error("SMS notification error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending SMS notifications",
      error: error.message
    });
  }
};

// Task 6.2: Push Notifications with Real Firebase
const sendPushNotification = async (req, res) => {
  try {
    const { emergencyId, deviceTokens, title, body, data } = req.body;

    if (!emergencyId || !deviceTokens || deviceTokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Emergency ID and device tokens are required"
      });
    }

    // Get emergency details
    const emergency = await EmergencyEvent.findById(emergencyId)
      .populate('userId', 'name');

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency event not found"
      });
    }

    const userName = emergency.userId?.name || 'User';
    const defaultTitle = `🚨 Emergency Alert: ${userName}`;
    const defaultBody = `${userName} is experiencing a ${emergency.emergencyType} emergency. Location: ${emergency.location?.address?.city || 'Unknown location'}. Severity: ${emergency.severity.toUpperCase()}`;

    const notificationData = {
      emergencyType: emergency.emergencyType,
      emergencyId: emergency._id.toString(),
      severity: emergency.severity,
      userId: emergency.userId._id.toString(),
      ...data
    };

    // Send REAL push notifications
    const results = [];
    for (const deviceToken of deviceTokens) {
      const pushResult = await sendPushWithFallback(
        deviceToken, 
        title || defaultTitle, 
        body || defaultBody,
        notificationData
      );

      // Track notification
      const notificationRecord = {
        method: 'push',
        sentAt: new Date(),
        status: pushResult.status,
        messageId: pushResult.messageId,
        deviceToken: deviceToken,
        retryCount: 0,
        provider: process.env.FIREBASE_PROJECT_ID ? 'firebase' : 'simulation'
      };

      emergency.notifications.push(notificationRecord);
      results.push({
        deviceToken: deviceToken.substring(0, 10) + '...',
        ...pushResult
      });
    }

    await emergency.save();

    const provider = process.env.FIREBASE_PROJECT_ID ? 'Firebase' : 'Simulation';

    res.json({
      success: true,
      message: `${provider} push notifications sent to ${results.length} devices`,
      data: {
        emergencyId: emergency._id,
        provider: provider,
        results: results,
        summary: {
          total: results.length,
          delivered: results.filter(r => r.status === 'delivered' || r.status === 'sent').length,
          failed: results.filter(r => r.status === 'failed').length
        }
      }
    });

  } catch (error) {
    console.error("Push notification error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending push notifications",
      error: error.message
    });
  }
};

// Task 6.3: Notification Tracking - Get Notification Status
const getNotificationStatus = async (req, res) => {
  try {
    const { emergencyId } = req.params;

    const emergency = await EmergencyEvent.findById(emergencyId)
      .populate('notifications.contactId', 'name phone relationship');

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency event not found"
      });
    }

    const notifications = emergency.notifications || [];
    
    // Summary statistics
    const summary = {
      total: notifications.length,
      byMethod: {
        sms: notifications.filter(n => n.method === 'sms').length,
        push: notifications.filter(n => n.method === 'push').length
      },
      byStatus: {
        sent: notifications.filter(n => n.status === 'sent').length,
        delivered: notifications.filter(n => n.status === 'delivered').length,
        failed: notifications.filter(n => n.status === 'failed').length,
        pending: notifications.filter(n => n.status === 'pending').length
      },
      byProvider: {
        twilio: notifications.filter(n => n.provider === 'twilio').length,
        firebase: notifications.filter(n => n.provider === 'firebase').length,
        simulation: notifications.filter(n => n.provider === 'simulation').length
      }
    };

    res.json({
      success: true,
      data: {
        emergencyId: emergency._id,
        emergencyType: emergency.emergencyType,
        emergencyStatus: emergency.status,
        notifications: notifications,
        summary: summary,
        lastUpdated: emergency.updatedAt
      }
    });

  } catch (error) {
    console.error("Get notification status error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notification status",
      error: error.message
    });
  }
};

// Task 6.3: Retry Failed Notifications
const retryFailedNotifications = async (req, res) => {
  try {
    const { emergencyId } = req.params;

    const emergency = await EmergencyEvent.findById(emergencyId)
      .populate('notifications.contactId');
    
    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency event not found"
      });
    }

    const failedNotifications = emergency.notifications.filter(
      n => (n.status === 'failed' || n.status === 'pending') && n.retryCount < 3
    );

    if (failedNotifications.length === 0) {
      return res.json({
        success: true,
        message: "No failed notifications to retry"
      });
    }

    const retryResults = [];
    
    for (const notification of failedNotifications) {
      try {
        notification.retryCount += 1;
        
        let retryResult;
        
        if (notification.method === 'sms' && notification.contactId) {
          const contact = notification.contactId;
          const message = `🚨 EMERGENCY RETRY: ${contact.name} is experiencing an emergency. Please check immediately.`;
          retryResult = await sendSMSWithFallback(contact.phone, message);
        } else if (notification.method === 'push') {
          const title = "🚨 Emergency Alert - Please Respond";
          const body = "This is a retry notification for an ongoing emergency.";
          retryResult = await sendPushWithFallback(
            notification.deviceToken, 
            title, 
            body
          );
        }
        
        if (retryResult && retryResult.success) {
          notification.status = retryResult.status;
          notification.messageId = retryResult.messageId;
        }
        
        notification.sentAt = new Date();
        
        retryResults.push({
          notificationId: notification._id,
          method: notification.method,
          retryCount: notification.retryCount,
          newStatus: notification.status,
          success: retryResult ? retryResult.success : false
        });
      } catch (retryError) {
        console.error(`Retry failed for notification ${notification._id}:`, retryError);
        retryResults.push({
          notificationId: notification._id,
          method: notification.method,
          retryCount: notification.retryCount,
          newStatus: 'failed',
          success: false,
          error: retryError.message
        });
      }
    }

    await emergency.save();

    res.json({
      success: true,
      message: `Retried ${retryResults.length} failed notifications`,
      data: {
        emergencyId: emergency._id,
        retryResults: retryResults,
        summary: {
          totalRetried: retryResults.length,
          successful: retryResults.filter(r => r.success).length,
          stillFailed: retryResults.filter(r => !r.success).length
        }
      }
    });

  } catch (error) {
    console.error("Retry notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrying failed notifications",
      error: error.message
    });
  }
};

// Auto-trigger notifications when emergency is created
const triggerEmergencyNotifications = async (emergencyId) => {
  try {
    console.log(`🔔 Auto-triggering REAL notifications for emergency ${emergencyId}`);
    
    const emergency = await EmergencyEvent.findById(emergencyId)
      .populate('userId', 'name');
    
    if (!emergency) {
      throw new Error('Emergency not found');
    }

    // Get user's emergency contacts
    const contacts = await Contact.find({
      userId: emergency.userId,
      isActive: true
    }).sort({ priority: 1 });

    // Send SMS to all contacts
    const smsResults = [];
    for (const contact of contacts) {
      const message = `🚨 EMERGENCY ALERT: ${emergency.userId.name} is experiencing a ${emergency.emergencyType} emergency. Severity: ${emergency.severity.toUpperCase()}. Please respond immediately.`;
      
      const smsResult = await sendSMSWithFallback(contact.phone, message);
      
      const notificationRecord = {
        contactId: contact._id,
        method: 'sms',
        sentAt: new Date(),
        status: smsResult.status,
        messageId: smsResult.messageId,
        retryCount: 0,
        provider: process.env.TWILIO_ACCOUNT_SID ? 'twilio' : 'simulation',
        autoTriggered: true
      };

      emergency.notifications.push(notificationRecord);
      smsResults.push({
        contact: contact.name,
        phone: contact.phone,
        ...smsResult
      });
    }

    await emergency.save();

    return {
      success: true,
      message: `Auto-triggered ${smsResults.length} SMS notifications`,
      emergencyId: emergencyId,
      smsResults: smsResults
    };
  } catch (error) {
    console.error("Auto-trigger notifications error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendSMSNotification,
  sendPushNotification,
  getNotificationStatus,
  retryFailedNotifications,
  triggerEmergencyNotifications
};