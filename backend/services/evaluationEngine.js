const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Evaluates a structured candidate against a job description.
 * @param {Object} candidateData The JSON representation of the candidate.
 * @param {string} jobDescription The raw job description text.
 * @returns {Promise<Object>} An evaluation object containing matchScore and skill sets.
 */
async function evaluateCandidate(candidateData, jobDescription) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an expert technical recruiter and unbiased AI hiring assistant.
Evaluate the candidate against the job description.
Focus ONLY on skills, experience relevance, and core qualifications.
Do NOT be influenced by the candidate's name, gender, college name, or employment gaps.

You MUST return ONLY a valid JSON object. No markdown fences.

Return this exact schema:
{
  "matchScore": <number between 0 and 100 representing overall fit based purely on skills and experience relevance>,
  "matchingSkills": [<array of strings of key skills they possess that match the JD>],
  "missingSkills": [<array of strings of key skills they lack that are required in the JD>]
}

Candidate Data (JSON format):
${JSON.stringify(candidateData, null, 2)}

Job Description:
${jobDescription}
`;

    const result = await model.generateContent(prompt);
    let cleanText = result.response.text().trim();
    
    // Clean markdown if present
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```.*\n/, '').replace(/\n```$/, '');
    }

    const evaluation = JSON.parse(cleanText);
    
    // Ensure matchScore is a number
    if (typeof evaluation.matchScore !== 'number') {
      evaluation.matchScore = parseInt(evaluation.matchScore, 10) || 50;
    }

    return evaluation;

  } catch (error) {
    console.error('Error in evaluateCandidate (Gemini):', error);
    // Return a safe fallback rather than failing the whole simulation run
    return {
      matchScore: 0,
      matchingSkills: [],
      missingSkills: []
    };
  }
}

module.exports = { evaluateCandidate };
