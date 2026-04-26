const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function parseResume(resumeText) {
    const prompt = `
You are an expert HR assistant. Extract the following information from the provided resume text.
Return ONLY a valid JSON object matching this exact structure:
{
  "name": "Full Name or null if missing",
  "skills": ["skill1", "skill2"],
  "education": {
    "college": "College Name or null",
    "degree": "Degree or null"
  },
  "experience_years": number (e.g. 5, or 0 if fresher),
  "work_timeline": ["Job 1 details", "Job 2 details"],
  "gaps_detected": true/false
}

If the resume is poorly formatted, do your best to extract these fields. 
If no skills are found, return an empty array.

Resume Text:
${resumeText}
`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const parsedContent = JSON.parse(result.response.text());
        return parsedContent;
    } catch (error) {
        console.error("Error parsing resume with Gemini:", error);
        throw error;
    }
}

module.exports = { parseResume };
