const EmergencyEvent = require("../Model/Emergency.model");
const Contact = require("../Model/Contact.model");
const { analyzeEmergency } = require("./aiClassification.controller");

// Create Emergency
const triggerEmergency = async (req, res) => {
  try {
    const { userId, text, location, userContext } = req.body;

    if (!userId || !text) {
      return res.status(400).json({
        success: false,
        message: "User ID and emergency text are required"
      });
    }

    // Trigger AI analysis
    let aiAnalysis;
    try {
      const analysisResponse = await analyzeEmergency(
        { body: { text, userContext } },
        { json: (data) => data }
      );
      aiAnalysis = analysisResponse.data;
    } catch (aiError) {
      console.error("AI analysis failed:", aiError);
      // Continue with basic emergency even if AI fails
      aiAnalysis = {
        classification: {
          emergencyType: "other",
          detectedEmergencyType: "emergency",
          confidenceScore: 0.5,
          reasoning: "AI analysis unavailable",
          riskAssessment: "medium",
          immediateActions: ["Call emergency services", "Ensure personal safety"]
        },
        guidance: {
          emergencyType: "other",
          detectedEmergencyType: "emergency",
          steps: [
            {
              stepNumber: 1,
              title: "Call Emergency Services",
              description: "Dial local emergency number (911/112/100)",
              estimatedTime: 30,
              priority: "critical",
              safetyNote: "Provide clear location and situation details"
            }
          ],
          precautions: ["Stay calm", "Ensure personal safety first"],
          monitoringInstructions: "Wait for professional help to arrive"
        }
      };
    }

    // Format location data to match model structure
    const formattedLocation = location ? {
      coordinates: location.coordinates || [],
      address: {
        street: location.address?.street || location.street || '',
        city: location.address?.city || location.city || '',
        state: location.address?.state || location.state || '',
        zipCode: location.address?.zipCode || location.zipCode || '',
        country: location.address?.country || location.country || ''
      },
      timestamp: new Date()
    } : {
      coordinates: [],
      address: {},
      timestamp: new Date()
    };

    // Create emergency event in database
    const emergencyEvent = new EmergencyEvent({
      userId: userId,
      emergencyType: aiAnalysis.classification.emergencyType,
      status: 'active',
      severity: aiAnalysis.classification.riskAssessment,
      
      // Location data - now properly formatted
      location: formattedLocation,
      
      // AI analysis results
      aiAnalysis: {
        confidenceScore: aiAnalysis.classification.confidenceScore,
        detectedEmergencyType: aiAnalysis.classification.detectedEmergencyType,
        riskAssessment: aiAnalysis.classification.riskAssessment,
        reasoning: aiAnalysis.classification.reasoning,
        timestamp: new Date()
      },

      // Instructions from AI guidance
      instructions: aiAnalysis.guidance.steps.map((step, index) => ({
        stepNumber: index + 1,
        title: step.title,
        description: step.description,
        estimatedTime: step.estimatedTime,
        priority: step.priority,
        safetyNote: step.safetyNote,
        completed: false,
        aiGenerated: true
      })),

      // Initialize empty notifications array
      notifications: []
    });

    await emergencyEvent.save();

    // Start notification process
    console.log(`Notification process triggered for emergency ${emergencyEvent._id}`);
    
    // Get user's emergency contacts
    const contacts = await Contact.find({
      userId: userId,
      isActive: true
    }).sort({ priority: 1 });

    res.status(201).json({
      success: true,
      message: "Emergency triggered successfully",
      data: {
        emergency: emergencyEvent,
        aiAnalysis: aiAnalysis,
        contactsCount: contacts.length,
        nextSteps: [
          "Notifications queued for emergency contacts",
          "Follow the provided instructions",
          "Update status when situation changes"
        ]
      }
    });

  } catch (error) {
    console.error("Emergency trigger error:", error);
    res.status(500).json({
      success: false,
      message: "Error triggering emergency response",
      error: error.message
    });
  }
};

// Get Emergency Status
const getEmergencyStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const emergency = await EmergencyEvent.findById(id)
      .populate('userId', 'name email phone')
      .populate('notifications.contactId', 'name phone relationship');

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency event not found"
      });
    }

    res.json({
      success: true,
      data: emergency
    });

  } catch (error) {
    console.error("Get emergency status error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching emergency status",
      error: error.message
    });
  }
};

// Resolve Emergency
const resolveEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;

    const emergency = await EmergencyEvent.findById(id);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency event not found"
      });
    }

    if (emergency.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: "Emergency is already resolved"
      });
    }

    // Calculate response time in seconds
    const responseTime = Math.floor((new Date() - emergency.createdAt) / 1000);

    emergency.status = 'resolved';
    emergency.resolvedAt = new Date();
    emergency.resolutionNotes = resolutionNotes || "Emergency resolved by user";
    emergency.responseTime = responseTime;

    await emergency.save();

    res.json({
      success: true,
      message: "Emergency resolved successfully",
      data: {
        emergency: emergency,
        responseTime: `${responseTime} seconds`,
        duration: `${Math.floor(responseTime / 60)} minutes ${responseTime % 60} seconds`
      }
    });

  } catch (error) {
    console.error("Resolve emergency error:", error);
    res.status(500).json({
      success: false,
      message: "Error resolving emergency",
      error: error.message
    });
  }
};

// Mark Step Complete
const completeStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { stepNumber } = req.body;

    if (!stepNumber) {
      return res.status(400).json({
        success: false,
        message: "Step number is required"
      });
    }

    const emergency = await EmergencyEvent.findById(id);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: "Emergency event not found"
      });
    }

    // Find the step and mark as completed
    const step = emergency.instructions.find(instruction => 
      instruction.stepNumber === parseInt(stepNumber)
    );

    if (!step) {
      return res.status(404).json({
        success: false,
        message: "Step not found"
      });
    }

    step.completed = true;
    step.completedAt = new Date();

    await emergency.save();

    // Check if all steps are completed
    const allStepsCompleted = emergency.instructions.every(instruction => instruction.completed);
    const completionStatus = allStepsCompleted ? "All steps completed!" : "Step completed successfully";

    res.json({
      success: true,
      message: completionStatus,
      data: {
        step: step,
        completedSteps: emergency.instructions.filter(i => i.completed).length,
        totalSteps: emergency.instructions.length,
        allStepsCompleted: allStepsCompleted
      }
    });

  } catch (error) {
    console.error("Complete step error:", error);
    res.status(500).json({
      success: false,
      message: "Error completing step",
      error: error.message
    });
  }
};

// Get user's emergency history
const getEmergencyHistory = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const emergencies = await EmergencyEvent.find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: emergencies,
      count: emergencies.length,
      stats: {
        active: emergencies.filter(e => e.status === 'active').length,
        resolved: emergencies.filter(e => e.status === 'resolved').length,
        cancelled: emergencies.filter(e => e.status === 'cancelled').length
      }
    });

  } catch (error) {
    console.error("Get emergency history error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching emergency history",
      error: error.message
    });
  }
};

module.exports = {
  triggerEmergency,
  getEmergencyStatus,
  resolveEmergency,
  completeStep,
  getEmergencyHistory
};