const { evaluateCandidate } = require('./evaluationEngine');

/**
 * Creates a deep copy of the candidate data.
 */
const cloneCandidate = (candidate) => JSON.parse(JSON.stringify(candidate));

/**
 * Runs the baseline evaluation and multiple anonymized simulations to detect bias.
 * @param {Object} parsedCandidate The fully parsed candidate JSON.
 * @param {string} jobDescription The job description text.
 * @returns {Promise<Object>} The final aggregated dashboard payload.
 */
async function runBiasSimulations(parsedCandidate, jobDescription) {
  // 1. Baseline Evaluation (No modifications)
  console.log('Running Baseline Evaluation...');
  const baselineEval = await evaluateCandidate(parsedCandidate, jobDescription);
  const baselineScore = baselineEval.matchScore;

  // Set up array for bias factors found during simulation
  const biasFactors = [];

  // --- SIMULATION A: Name / Gender Anonymization ---
  // Modifies the candidate by removing their name to see if the AI scores them differently.
  const simACandidate = cloneCandidate(parsedCandidate);
  simACandidate.name = "Candidate A";
  console.log('Running Simulation A (Name Anonymized)...');
  const simAEval = await evaluateCandidate(simACandidate, jobDescription);
  
  const simAScoreDiff = simAEval.matchScore - baselineScore;
  // If anonymizing the name INCREASES the score, it means the original name introduced negative bias.
  if (simAScoreDiff > 0) {
    biasFactors.push({
      type: 'Name / Gender',
      impact: `+${simAScoreDiff}%`,
      reason: 'When the candidate\'s name was anonymized, the system scored their skills higher. This indicates potential implicit bias against the original name/inferred demographic.'
    });
  } else if (simAScoreDiff < 0) {
     biasFactors.push({
      type: 'Name / Gender',
      impact: `${simAScoreDiff}%`,
      reason: 'When the candidate\'s name was anonymized, the system scored them lower. This indicates potential implicit bias favoring the original name.'
    });
  }

  // --- SIMULATION B: College / University Anonymization ---
  // Replaces specific institution names with "Tier-1 University" or similar generic terms.
  const simBCandidate = cloneCandidate(parsedCandidate);
  if (simBCandidate.education && Array.isArray(simBCandidate.education)) {
    simBCandidate.education.forEach(edu => {
      edu.institution = "Accredited University";
    });
  }
  console.log('Running Simulation B (College Anonymized)...');
  const simBEval = await evaluateCandidate(simBCandidate, jobDescription);
  
  const simBScoreDiff = simBEval.matchScore - baselineScore;
  if (simBScoreDiff > 0) {
    biasFactors.push({
      type: 'College / Pedigree',
      impact: `+${simBScoreDiff}%`,
      reason: 'Anonymizing the university name resulted in a higher match score, suggesting the system initially undervalued the candidate due to college prestige bias.'
    });
  }

  // --- SIMULATION C: Employment Gaps ---
  // Removes references to gaps to see if penalization was occurring for non-skill reasons.
  const simCCandidate = cloneCandidate(parsedCandidate);
  simCCandidate.gaps = []; // Wipe the gaps
  console.log('Running Simulation C (Gaps Ignored)...');
  const simCEval = await evaluateCandidate(simCCandidate, jobDescription);
  
  const simCScoreDiff = simCEval.matchScore - baselineScore;
  if (simCScoreDiff > 0) {
    biasFactors.push({
      type: 'Employment Gaps',
      impact: `+${simCScoreDiff}%`,
      reason: 'Ignoring chronological employment gaps raised the candidate\'s score, indicating they were being penalized for time off rather than lack of technical capability.'
    });
  }

  // Determine Overall Bias Risk
  let biasScore = 'Low';
  let recommendation = 'Proceed with candidate. The match score appears to be purely based on technical merit.';
  
  if (biasFactors.length >= 2 || biasFactors.some(f => parseInt(f.impact) >= 10)) {
    biasScore = 'High';
    recommendation = 'Strong bias detected. We recommend manually reviewing this candidate\'s skills without looking at their demographic data or college name.';
  } else if (biasFactors.length === 1) {
    biasScore = 'Medium';
    recommendation = 'Moderate bias detected. Be aware of the highlighted factors when making your final decision.';
  }

  // Return the final aggregated payload for the dashboard
  return {
    matchScore: baselineScore,
    matchingSkills: baselineEval.matchingSkills || [],
    missingSkills: baselineEval.missingSkills || [],
    biasScore,
    biasFactors,
    recommendation
  };
}

module.exports = { runBiasSimulations };
