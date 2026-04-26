const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function evaluateCandidate(parsedResume, jobDescription, config = {}) {
    const {
        ignoreName = false,
        ignoreCollege = false,
        ignoreGaps = false
    } = config;

    // Create a modified copy of the resume based on simulation config
    const simulatedResume = JSON.parse(JSON.stringify(parsedResume));

    if (ignoreName) {
        simulatedResume.name = "[REDACTED]";
    }
    if (ignoreCollege && simulatedResume.education) {
        simulatedResume.education.college = "[REDACTED]";
    }

    const gapInstruction = ignoreGaps 
        ? "CRITICAL INSTRUCTION: Explicitly ignore any employment gaps or lack of experience if they are a fresher. Do not penalize the score for gaps." 
        : "Evaluate employment gaps as you normally would for this role.";

    const prompt = `
You are an unbiased expert technical recruiter. Evaluate the candidate's fit for the job description based ONLY on their skills and relevant experience.
Do not explicitly assume gender or penalize for factors unrelated to job performance.

${gapInstruction}

Candidate Profile (JSON):
${JSON.stringify(simulatedResume, null, 2)}

Job Description:
${jobDescription}

Return ONLY a valid JSON object matching this exact structure:
{
  "matchScore": number (0-100),
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"]
}
`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Error evaluating candidate with Gemini:", error);
        throw error;
    }
}

module.exports = { evaluateCandidate };
