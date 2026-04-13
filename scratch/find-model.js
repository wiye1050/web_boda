const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // There is no direct listModels in the SDK for API keys usually, 
    // but we can try to get them.
    // Actually, we can just try different names.
    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-pro",
        "gemini-1.0-pro",
        "gemini-pro"
    ];
    
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("test");
            console.log(`Model ${m}: SUCCESS`);
            break;
        } catch (e) {
            console.log(`Model ${m}: FAILED - ${e.message}`);
        }
    }
  } catch (error) {
    console.error(error);
  }
}

listModels();
