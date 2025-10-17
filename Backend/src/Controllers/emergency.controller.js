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

    // Default fallback AI analysis (always safe)
    const defaultAIAnalysis = {
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

    // Trigger AI analysis safely
    let aiAnalysis = { ...defaultAIAnalysis };
    try {
      const analysisResponse = await analyzeEmergency(
        { body: { text, userContext } },
        { json: (data) => data }
      );

      // Normalize AI response structure
      aiAnalysis = analysisResponse?.data || analysisResponse || {};
      if (aiAnalysis.data) aiAnalysis = aiAnalysis.data;

      // Merge with defaults to fill missing parts
      aiAnalysis = {
        classification: {
          ...defaultAIAnalysis.classification,
          ...(aiAnalysis.classification || {})
        },
        guidance: {
          ...defaultAIAnalysis.guidance,
          ...(aiAnalysis.guidance || {})
        }
      };

      const CONFIDENCE_THRESHOLD = 0.7;

      // Only proceed if AI is confident
      if (aiAnalysis.classification.confidenceScore < CONFIDENCE_THRESHOLD) {
        console.warn("Low AI confidence — using fallback instructions, not notifying contacts yet");

        // Optional: mark emergency type as "other" to avoid false alerts
        aiAnalysis.classification.emergencyType = "other";
        aiAnalysis.classification.detectedEmergencyType = "emergency";

        // Replace guidance with safe default
        aiAnalysis.guidance = defaultAIAnalysis.guidance;
      }

      // Ensure steps array exists
      if (!Array.isArray(aiAnalysis.guidance.steps) || aiAnalysis.guidance.steps.length === 0) {
        aiAnalysis.guidance.steps = defaultAIAnalysis.guidance.steps;
      }
    } catch (aiError) {
      console.error("AI analysis failed:", aiError);
      aiAnalysis = { ...defaultAIAnalysis };
    }

    // Format location
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

    // Create emergency event
    const emergencyEvent = new EmergencyEvent({
      userId: userId,
      emergencyType: aiAnalysis.classification.emergencyType,
      status: 'active',
      severity: aiAnalysis.classification.riskAssessment,
      location: formattedLocation,
      aiAnalysis: {
        confidenceScore: aiAnalysis.classification.confidenceScore,
        detectedEmergencyType: aiAnalysis.classification.detectedEmergencyType,
        riskAssessment: aiAnalysis.classification.riskAssessment,
        reasoning: aiAnalysis.classification.reasoning,
        timestamp: new Date()
      },
      instructions: aiAnalysis.guidance.steps.map((step, index) => ({
        stepNumber: index + 1,
        title: step.title || `Step ${index + 1}`,
        description: step.description || "Follow instructions carefully",
        estimatedTime: step.estimatedTime || 30,
        priority: step.priority || "normal",
        safetyNote: step.safetyNote || "",
        completed: false,
        aiGenerated: true
      })),
      notifications: []
    });

    await emergencyEvent.save();

    // Log notification trigger
    console.log(`Notification process triggered for emergency ${emergencyEvent._id}`);

    // Get emergency contacts (safe query)
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
    const { userId, startDate, endDate, emergencyType, status, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    // Build filter object
    const filter = { userId };
    
    // Date filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Emergency type filter
    if (emergencyType && emergencyType !== 'all') {
      filter.emergencyType = emergencyType;
    }

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get emergencies with filtering and pagination
    const emergencies = await EmergencyEvent.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('notifications.contactId', 'name phone relationship')
      .lean();

    // Get total count for pagination
    const total = await EmergencyEvent.countDocuments(filter);

    // Format response with resolution details
    const formattedEmergencies = emergencies.map(emergency => ({
      _id: emergency._id,
      emergencyType: emergency.emergencyType,
      status: emergency.status,
      severity: emergency.severity,
      createdAt: emergency.createdAt,
      resolvedAt: emergency.resolvedAt,
      location: emergency.location,
      responseTime: emergency.responseTime,
      resolutionDetails: {
        resolutionNotes: emergency.resolutionNotes,
        responseTime: emergency.responseTime,
        duration: emergency.resolvedAt ? 
          Math.floor((new Date(emergency.resolvedAt) - new Date(emergency.createdAt)) / 1000) : null,
        stepsCompleted: emergency.instructions ? 
          emergency.instructions.filter(step => step.completed).length : 0,
        totalSteps: emergency.instructions ? emergency.instructions.length : 0
      },
      aiAnalysis: emergency.aiAnalysis ? {
        confidenceScore: emergency.aiAnalysis.confidenceScore,
        detectedEmergencyType: emergency.aiAnalysis.detectedEmergencyType,
        riskAssessment: emergency.aiAnalysis.riskAssessment
      } : null,
      notificationsCount: emergency.notifications ? emergency.notifications.length : 0
    }));

    res.json({
      success: true,
      data: formattedEmergencies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      summary: {
        total,
        active: await EmergencyEvent.countDocuments({ ...filter, status: 'active' }),
        resolved: await EmergencyEvent.countDocuments({ ...filter, status: 'resolved' }),
        cancelled: await EmergencyEvent.countDocuments({ ...filter, status: 'cancelled' })
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

const getAnalyticsStats = async (req, res) => {
  try {
    const { userId, days = 30 } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const filter = { 
      userId, 
      createdAt: { $gte: startDate } 
    };

    // Get all emergencies for the period
    const emergencies = await EmergencyEvent.find(filter);

    // Emergency Frequency Analysis
    const frequencyByDay = await EmergencyEvent.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Response Times Analysis
    const responseTimes = emergencies
      .filter(e => e.responseTime && e.status === 'resolved')
      .map(e => e.responseTime);

    // Most Common Types
    const typeDistribution = await EmergencyEvent.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$emergencyType",
          count: { $sum: 1 },
          avgResponseTime: { $avg: "$responseTime" },
          resolvedCount: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Success Rates
    const totalEmergencies = emergencies.length;
    const resolvedEmergencies = emergencies.filter(e => e.status === 'resolved').length;
    const successRate = totalEmergencies > 0 ? (resolvedEmergencies / totalEmergencies) * 100 : 0;

    // Severity Distribution
    const severityDistribution = await EmergencyEvent.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 }
        }
      }
    ]);

    // Time-based patterns
    const hourlyDistribution = await EmergencyEvent.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate statistics
    const stats = {
      overview: {
        totalEmergencies,
        resolvedEmergencies,
        activeEmergencies: emergencies.filter(e => e.status === 'active').length,
        successRate: Math.round(successRate * 100) / 100,
        averageResponseTime: responseTimes.length > 0 ? 
          Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0,
        minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
        maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0
      },
      frequency: {
        daily: frequencyByDay,
        totalLast30Days: totalEmergencies,
        averagePerDay: totalEmergencies > 0 ? 
          Math.round((totalEmergencies / parseInt(days)) * 100) / 100 : 0
      },
      responseTimes: {
        average: responseTimes.length > 0 ? 
          Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) : 0,
        distribution: responseTimes,
        bySeverity: await getResponseTimesBySeverity(filter)
      },
      emergencyTypes: {
        distribution: typeDistribution,
        mostCommon: typeDistribution.length > 0 ? typeDistribution[0] : null,
        successRates: typeDistribution.map(type => ({
          type: type._id,
          successRate: type.count > 0 ? 
            Math.round((type.resolvedCount / type.count) * 100 * 100) / 100 : 0,
          total: type.count,
          resolved: type.resolvedCount
        }))
      },
      patterns: {
        hourly: hourlyDistribution,
        severity: severityDistribution,
        byStatus: {
          resolved: resolvedEmergencies,
          active: emergencies.filter(e => e.status === 'active').length,
          cancelled: emergencies.filter(e => e.status === 'cancelled').length
        }
      }
    };

    res.json({
      success: true,
      data: stats,
      period: {
        startDate,
        endDate: new Date(),
        days: parseInt(days)
      }
    });

  } catch (error) {
    console.error("Get analytics stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics statistics",
      error: error.message
    });
  }
};

// Helper function for response times by severity
const getResponseTimesBySeverity = async (filter) => {
  return await EmergencyEvent.aggregate([
    { 
      $match: { 
        ...filter, 
        status: "resolved",
        responseTime: { $exists: true, $ne: null }
      } 
    },
    {
      $group: {
        _id: "$severity",
        averageResponseTime: { $avg: "$responseTime" },
        minResponseTime: { $min: "$responseTime" },
        maxResponseTime: { $max: "$responseTime" },
        count: { $sum: 1 }
      }
    }
  ]);
};

module.exports = {
  triggerEmergency,
  getEmergencyStatus,
  resolveEmergency,
  completeStep,
  getEmergencyHistory,
  getAnalyticsStats
};