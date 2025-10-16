const { classificationModel, guidanceModel } = require("../Config/gemini.js");
const emergencyProcedures = require("../data/emergencyProcedures.js");




function extractJSON(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in AI response");
    return JSON.parse(match[0]);
  } catch (err) {
    console.error("Failed to parse JSON from AI response:", text);
    throw err;
  }
}

// Emergency Type Detection
const classifyEmergency = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text input is required"
      });
    }

    const prompt = `
    Analyze this emergency situation and classify it. Return ONLY a JSON object with this exact structure:
    {
      "emergencyType": "medical|fire|police|natural_disaster|accident|other",
      "detectedEmergencyType": "specific type like heart_attack, building_fire, etc.",
      "confidenceScore": 0.0-1.0,
      "reasoning": "brief explanation of classification",
      "riskAssessment": "low|medium|high|critical",
      "immediateActions": ["array of 2-3 immediate actions"]
    }

    User input: "${text}"

    Emergency types:
    - medical: health emergencies, injuries, medical conditions
    - fire: fires, smoke, burns
    - police: crimes, safety threats, suspicious activities  
    - natural_disaster: earthquakes, floods, storms
    - accident: car crashes, falls, industrial accidents
    - other: anything else

    Respond with ONLY the JSON object, no other text.
    `;

    const result = await classificationModel.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Clean the response and parse JSON
    const cleanResponse = textResponse.replace(/```json\n?|\n?```/g, '').trim();
    const classification = JSON.parse(cleanResponse);

    res.json({
      success: true,
      data: classification
    });

  } catch (error) {
    console.error("AI classification error:", error);
    res.status(500).json({
      success: false,
      message: "Error processing emergency classification",
      error: error.message
    });
  }
};

// RAG - Emergency Guidance
const getEmergencyGuidance = async (req, res) => {
  try {
    const { emergencyType, detectedEmergencyType, userContext } = req.body;

    if (!emergencyType || !detectedEmergencyType) {
      return res.status(400).json({
        success: false,
        message: "Emergency type and detected type are required"
      });
    }

    // Retrieve procedures from knowledge base
    let specificProcedures = [];
    if (emergencyProcedures[emergencyType] && emergencyProcedures[emergencyType][detectedEmergencyType]) {
      specificProcedures = emergencyProcedures[emergencyType][detectedEmergencyType];
    }

    const prompt = `
    Provide emergency guidance for a ${detectedEmergencyType} situation (${emergencyType} emergency).

    ${userContext ? `Additional context: ${userContext}` : ''}

    Available standard procedures: ${specificProcedures.join(' | ')}

    Generate comprehensive step-by-step instructions including:
    1. Immediate life-saving actions
    2. Safety precautions for responder
    3. When to call emergency services
    4. What information to provide to dispatcher
    5. Ongoing monitoring instructions

    Return ONLY a JSON object with this structure:
    {
      "emergencyType": "${emergencyType}",
      "detectedEmergencyType": "${detectedEmergencyType}",
      "steps": [
        {
          "stepNumber": 1,
          "title": "Clear action title",
          "description": "Detailed instruction",
          "estimatedTime": 30,
          "priority": "critical|high|medium|low",
          "safetyNote": "Important safety warning if any"
        }
      ],
      "emergencyServicesContact": "When and how to contact emergency services",
      "precautions": ["Array of safety precautions"],
      "monitoringInstructions": "What to monitor while waiting for help"
    }

    Respond with ONLY the JSON object, no other text.
    `;

    const result = await guidanceModel.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    // Clean and parse response
    const cleanResponse = textResponse.replace(/```json\n?|\n?```/g, '').trim();
    const guidance = JSON.parse(cleanResponse);

    // Add source information
    guidance.knowledgeBaseUsed = specificProcedures.length > 0;
    guidance.standardProceduresIncluded = specificProcedures;

    res.json({
      success: true,
      data: guidance
    });

  } catch (error) {
    console.error("AI guidance error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating emergency guidance",
      error: error.message
    });
  }
};

const analyzeEmergency = async (req, res) => {
  try {
    const { text, userContext } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text input is required"
      });
    }

    // Step 1: Classify emergency (use JSON-only prompt like classifyEmergency)
    const classificationPrompt = `
    Analyze this emergency situation and classify it. Return ONLY a JSON object with this exact structure:
    {
      "emergencyType": "medical|fire|police|natural_disaster|accident|other",
      "detectedEmergencyType": "specific type like heart_attack, building_fire, etc.",
      "confidenceScore": 0.0-1.0,
      "reasoning": "brief explanation of classification",
      "riskAssessment": "low|medium|high|critical",
      "immediateActions": ["array of 2-3 immediate actions"]
    }

    User input: "${text}"

    Emergency types:
    - medical: health emergencies, injuries, medical conditions
    - fire: fires, smoke, burns
    - police: crimes, safety threats, suspicious activities  
    - natural_disaster: earthquakes, floods, storms
    - accident: car crashes, falls, industrial accidents
    - other: anything else

    Respond with ONLY the JSON object, no other text.
    `;

    const classificationResult = await classificationModel.generateContent(classificationPrompt);
    const classificationResponse = await classificationResult.response;
    const classification = extractJSON(classificationResponse.text());

    // Retrieve procedures from knowledge base
    let specificProcedures = [];
    if (
      emergencyProcedures[classification.emergencyType] &&
      emergencyProcedures[classification.emergencyType][classification.detectedEmergencyType]
    ) {
      specificProcedures = emergencyProcedures[classification.emergencyType][classification.detectedEmergencyType];
    }

    const guidancePrompt = `
    Provide emergency guidance for a ${classification.detectedEmergencyType} situation (${classification.emergencyType} emergency).

    ${userContext ? `Additional context: ${userContext}` : ''}

    Available standard procedures: ${specificProcedures.join(' | ')}

    Generate comprehensive step-by-step instructions including:
    1. Immediate life-saving actions
    2. Safety precautions for responder
    3. When to call emergency services
    4. What information to provide to dispatcher
    5. Ongoing monitoring instructions

    Return ONLY a JSON object with this structure:
    {
      "emergencyType": "${classification.emergencyType}",
      "detectedEmergencyType": "${classification.detectedEmergencyType}",
      "steps": [
        {
          "stepNumber": 1,
          "title": "Clear action title",
          "description": "Detailed instruction",
          "estimatedTime": 30,
          "priority": "critical|high|medium|low",
          "safetyNote": "Important safety warning if any"
        }
      ],
      "emergencyServicesContact": "When and how to contact emergency services",
      "precautions": ["Array of safety precautions"],
      "monitoringInstructions": "What to monitor while waiting for help"
    }

    Respond with ONLY the JSON object, no other text.
    `;

    const guidanceResult = await guidanceModel.generateContent(guidancePrompt);
    const guidanceResponse = await guidanceResult.response;
    const guidance = extractJSON(guidanceResponse.text());

    // Add source info
    guidance.knowledgeBaseUsed = specificProcedures.length > 0;
    guidance.standardProceduresIncluded = specificProcedures;

    res.json({
      success: true,
      data: {
        classification,
        guidance
      }
    });

  } catch (error) {
    console.error("Full analysis error:", error);
    res.status(500).json({
      success: false,
      message: "Error in complete emergency analysis",
      error: error.message
    });
  }
};


module.exports = {
  classifyEmergency,
  getEmergencyGuidance,
  analyzeEmergency
};