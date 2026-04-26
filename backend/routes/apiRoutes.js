const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { parseResume } = require('../services/resumeParser');
const { runBiasSimulations } = require('../services/biasEngine');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    const jobDescription = req.body.jobDescription;
    let resumeText = req.body.resumeText || '';

    // If a PDF file was uploaded, extract its text
    if (req.file) {
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Please upload a valid PDF file.' });
      }
      try {
        const pdfData = await pdfParse(req.file.buffer);
        resumeText = pdfData.text;
      } catch (parseError) {
        console.error('Error parsing PDF:', parseError);
        return res.status(500).json({ error: 'Failed to extract text from the PDF file.' });
      }
    }

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ error: 'No resume text found or provided.' });
    }

    if (!jobDescription || !jobDescription.trim()) {
      return res.status(400).json({ error: 'Job description is required.' });
    }

    // 1. Parse the raw resume text into structured JSON using Gemini
    console.log('Step 1: Parsing resume text...');
    const parsedCandidate = await parseResume(resumeText);
    
    // 2. Pass the structured candidate and JD to the bias engine for simulations
    console.log('Step 2: Running baseline evaluations and bias simulations...');
    const finalResults = await runBiasSimulations(parsedCandidate, jobDescription);

    return res.json(finalResults);

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'An error occurred during analysis.' });
  }
});

module.exports = router;
