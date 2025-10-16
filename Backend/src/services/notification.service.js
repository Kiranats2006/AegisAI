const twilio = require('twilio');
const admin = require('firebase-admin');

// Initialize Twilio
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio initialized successfully');
  } catch (error) {
    console.error('❌ Twilio initialization failed:', error.message);
  }
} else {
  console.log('🔶 Twilio not configured - using simulation mode');
}

// Initialize Firebase Admin (we'll set this up properly next)
let firebaseInitialized = false;

const initializeFirebase = () => {
  if (!firebaseInitialized && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      firebaseInitialized = true;
      console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error.message);
    }
  }
};

// Real SMS sending with Twilio
const sendRealSMS = async (phoneNumber, message) => {
  try {
    if (!twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    if (!process.env.TWILIO_ACCOUNT_SID) {
      throw new Error('Twilio not configured - missing account SID');
    }

    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });

    return {
      success: true,
      messageId: result.sid,
      status: 'sent',
      timestamp: new Date(),
      twilioStatus: result.status
    };
  } catch (error) {
    console.error(`❌ Twilio SMS failed for ${phoneNumber}:`, error.message);
    return {
      success: false,
      messageId: `failed_${Date.now()}`,
      status: 'failed',
      timestamp: new Date(),
      error: error.message
    };
  }
};

// Real Push Notifications with Firebase
const sendRealPushNotification = async (deviceToken, title, body, data = {}) => {
  try {
    initializeFirebase();
    
    if (!firebaseInitialized) {
      throw new Error('Firebase not configured properly');
    }

    const message = {
      notification: {
        title: title,
        body: body
      },
      data: {
        emergencyType: data.emergencyType || 'general',
        emergencyId: data.emergencyId || '',
        timestamp: new Date().toISOString(),
        ...data
      },
      token: deviceToken,
      android: {
        priority: 'high'
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            'content-available': 1
          }
        }
      }
    };

    const result = await admin.messaging().send(message);
    
    return {
      success: true,
      messageId: result,
      status: 'sent',
      timestamp: new Date(),
      fcmMessageId: result
    };
  } catch (error) {
    console.error(`❌ FCM push failed for token ${deviceToken.substring(0, 10)}...:`, error.message);
    return {
      success: false,
      messageId: `failed_${Date.now()}`,
      status: 'failed',
      timestamp: new Date(),
      error: error.message
    };
  }
};

// Fallback to simulation if real services not configured
const sendSMSWithFallback = async (phoneNumber, message) => {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.SMS_ENABLED === 'true') {
    return await sendRealSMS(phoneNumber, message);
  } else {
    console.log(`📱 SMS SIMULATION to ${phoneNumber}: ${message}`);
    const success = Math.random() > 0.1;
    return {
      success,
      messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: success ? 'delivered' : 'failed',
      timestamp: new Date()
    };
  }
};

const sendPushWithFallback = async (deviceToken, title, body, data = {}) => {
  if (firebaseInitialized && process.env.PUSH_ENABLED === 'true') {
    return await sendRealPushNotification(deviceToken, title, body, data);
  } else {
    console.log(`📱 PUSH SIMULATION to ${deviceToken}: ${title} - ${body}`);
    const success = Math.random() > 0.15;
    return {
      success,
      messageId: `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: success ? 'delivered' : 'failed',
      timestamp: new Date()
    };
  }
};

module.exports = {
  sendSMSWithFallback,
  sendPushWithFallback,
  initializeFirebase
};