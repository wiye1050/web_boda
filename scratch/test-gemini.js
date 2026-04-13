const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API Key found");
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash as I set in the route
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log("Testing Gemini API with model: gemini-1.5-flash...");
    const result = await model.generateContent("Hola, esto es una prueba. Responde 'OK'.");
    const response = await result.response;
    console.log("Response:", response.text());
  } catch (error) {
    console.error("API Error details:", error);
    if (error.message && error.message.includes("model is not found")) {
        console.log("Try gemini-pro or check available models.");
    }
  }
}

test();
