import { GoogleGenerativeAI } from "@google/generative-ai";

export const askGemini = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        message: "Please enter a prompt",
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message: "Gemini API key is missing",
      });
    }

    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;

    res.json({
      answer: response.text(),
    });
  } catch (error) {
    console.error("Gemini API Error:", error);

    res.status(500).json({
      message: "Gemini request failed",
      error: error.message,
    });
}
};