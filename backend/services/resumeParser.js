const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extracts structured candidate data from unstructured resume text using Gemini.
 * @param {string} resumeText The raw text extracted from the PDF.
 * @returns {Promise<Object>} A structured JSON representation of the candidate.
 */
async function parseResume(resumeText) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an expert HR data extraction system. Your task is to extract structured information from the provided resume text.
You MUST respond ONLY with a valid JSON object. Do not include markdown blocks, code fences, or any conversational text.

Extract the following information:
- "name": The candidate's full name.
- "contact": An object containing "email", "phone", and "location" (if available).
- "skills": A flat array of strings representing technical and soft skills.
- "education": An array of objects with "degree", "institution", and "year".
- "experience": An array of objects with "title", "company", "startDate", "endDate", and "description".
- "gaps": An array of strings describing any notable employment gaps (e.g., "Jan 2022 to Dec 2022"). Leave empty if none.

Resume Text:
${resumeText}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up response if it contains markdown formatting
    let cleanText = responseText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```.*\n/, '').replace(/\n```$/, '');
    }

    const parsedJson = JSON.parse(cleanText);
    return parsedJson;

  } catch (error) {
    console.error('Error in parseResume (Gemini):', error);
    throw new Error('Failed to parse resume data.');
  }
}

module.exports = { parseResume };
