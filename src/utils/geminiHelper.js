// src/utils/geminiHelper.js
const { GoogleGenAI } = require('@google/genai');

// 1) Instantiate with your API key
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const model = process.env.GEMINI_MODEL_NAME || 'gemini-2.5-flash';

/**
 * Compare JD vs. CV using a chat-style prompt.
 * Returns a JSON object: { canApply, score, reasons }.
 */
async function compareWithChat(jdText, cvText) {
  const prompt = `
Eres un experto en selección de personal. Dada esta Descripción de Puesto y este CV,
determina si el candidato cumple con los requisitos. Devuelve un JSON con:
  • canApply: true|false
  • score: número entre 0 y 100
  • reasons: lista breve de coincidencias o carencias

Job Description:
"""${jdText}"""

CV:
"""${cvText}"""

POR FAVOR responde *solo* con el JSON:
`.trim();

  const response = await ai.models.generateContent({
    model,
    contents: prompt
  });

  // The SDK puts the reply in response.text
  const text = response.text.trim();
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`No se pudo parsear JSON de Gemini: ${text}`);
  }
}

module.exports = { compareWithChat };
