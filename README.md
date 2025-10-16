# AegisAI
Real-time AI protection when every second matters.

## Description
An AI-powered emergency response platform where users can store medical profiles, manage emergency contacts, and trigger smart emergency alerts. Built with React frontend, Node.js backend, and MongoDB database.

## Project Idea
AegisAI combines emergency contact management with AI-powered emergency classification. Users create medical profiles and emergency contacts, and during emergencies, the system intelligently classifies the situation and notifies the right contacts with relevant medical information.

## Deployed Links
- **Frontend**:
- **Backend**:

## Tech Stack
- **Frontend**: React, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **AI/ML**: Gemini API
- **Real-time**: Socket.io
- **Auth**: JWT
- **Notifications**: Twilio (SMS), Firebase (Push)
- **Voice**: Google Speech-to-Text

## Core Features
- User authentication & medical profiles
- Emergency contact management
- AI-powered emergency classification
- Real-time emergency triggering
- Multi-channel notifications (SMS, push)
- Voice command processing
- Emergency history & analytics


## Database Models
- **User**: Profiles, medical data, contacts
- **EmergencyEvent**: Emergency records, locations, AI analysis
- **Contact**: Emergency contact information

## API Structure

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Emergency Contacts
- `GET /api/contacts` - List contacts
- `POST /api/contacts` - Add contact
- `DELETE /api/contacts/:id` - Remove contact

### Emergency System
- `POST /api/emergency/trigger` - Start emergency
- `GET /api/emergency/history` - Get past emergencies
- `PUT /api/emergency/:id/resolve` - End emergency

### AI Services
- `POST /api/ai/classify` - Emergency type detection
- `POST /api/ai/guidance` - Get emergency instructions
- `POST /api/voice/transcribe` - Convert speech to text

### Notifications
- `POST /api/notify/sms` - Send SMS alerts
- `POST /api/notify/push` - Send push notifications


## MVP Priority
1. User auth & profiles
2. Emergency contacts
3. Basic emergency triggering
4. AI classification
5. SMS notifications
6. Voice commands

## Future Features
- Real-time location tracking
- Integration with emergency services
- Multi-language support
- Wearable device integration


