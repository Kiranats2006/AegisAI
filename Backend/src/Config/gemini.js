const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Emergency classification model
const classificationModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: `You are an emergency response AI specialist. Analyze user input to determine the type of emergency and provide appropriate guidance.`
});

// RAG guidance model
const guidanceModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: `You are an emergency procedures expert. Provide step-by-step instructions for emergency situations based on established protocols.`
});

module.exports = { classificationModel, guidanceModel };