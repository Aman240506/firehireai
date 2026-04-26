const { evaluateCandidate } = require('./evaluationEngine');

async function runBiasSimulations(parsedResume, jobDescription) {
    // 1. Baseline Evaluation
    const baseline = await evaluateCandidate(parsedResume, jobDescription, {
        ignoreName: false,
        ignoreCollege: false,
        ignoreGaps: false
    });

    const simulations = [];
    let overallBiasImpact = 0;
    const biasFactors = [];

    // 2. Mod A: Remove Name
    if (parsedResume.name) {
        const noNameResult = await evaluateCandidate(parsedResume, jobDescription, {
            ignoreName: true
        });
        const scoreDiff = noNameResult.matchScore - baseline.matchScore;
        if (Math.abs(scoreDiff) > 0) {
            biasFactors.push({
                type: "Gender/Name Bias",
                impact: scoreDiff > 0 ? `+${scoreDiff}%` : `${scoreDiff}%`,
                reason: `Score ${scoreDiff > 0 ? 'increased' : 'decreased'} after removing candidate name.`
            });
            overallBiasImpact = Math.max(overallBiasImpact, Math.abs(scoreDiff));
        }
    }

    // 3. Mod B: Remove College
    if (parsedResume.education && parsedResume.education.college) {
        const noCollegeResult = await evaluateCandidate(parsedResume, jobDescription, {
            ignoreCollege: true
        });
        const scoreDiff = noCollegeResult.matchScore - baseline.matchScore;
        if (Math.abs(scoreDiff) > 0) {
            biasFactors.push({
                type: "College Tier Bias",
                impact: scoreDiff > 0 ? `+${scoreDiff}%` : `${scoreDiff}%`,
                reason: `Score ${scoreDiff > 0 ? 'increased' : 'decreased'} after removing college name.`
            });
            overallBiasImpact = Math.max(overallBiasImpact, Math.abs(scoreDiff));
        }
    }

    // 4. Mod C: Ignore Experience Gaps
    if (parsedResume.gaps_detected || parsedResume.experience_years === 0) {
        const noGapsResult = await evaluateCandidate(parsedResume, jobDescription, {
            ignoreGaps: true
        });
        const scoreDiff = noGapsResult.matchScore - baseline.matchScore;
        if (Math.abs(scoreDiff) > 0) {
            biasFactors.push({
                type: "Experience Gap Bias",
                impact: scoreDiff > 0 ? `+${scoreDiff}%` : `${scoreDiff}%`,
                reason: `Score ${scoreDiff > 0 ? 'increased' : 'decreased'} when explicitly told to ignore gaps or lack of experience.`
            });
            overallBiasImpact = Math.max(overallBiasImpact, Math.abs(scoreDiff));
        }
    }

    // Determine Bias Score Level
    let biasScore = "Low";
    if (overallBiasImpact >= 15) {
        biasScore = "High";
    } else if (overallBiasImpact >= 5) {
        biasScore = "Medium";
    }

    // Generate Recommendation
    let recommendation = "Candidate should be evaluated primarily on their technical skills.";
    if (biasScore === "High" || biasScore === "Medium") {
        recommendation = "Decision may be influenced by non-relevant factors. Re-evaluate based strictly on the matching skills.";
    } else if (baseline.matchScore > 75) {
        recommendation = "Shortlist candidate based on strong skill alignment.";
    }

    return {
        matchScore: baseline.matchScore,
        matchingSkills: baseline.matchingSkills,
        missingSkills: baseline.missingSkills,
        biasScore: biasScore,
        biasFactors: biasFactors,
        recommendation: recommendation
    };
}

module.exports = { runBiasSimulations };
