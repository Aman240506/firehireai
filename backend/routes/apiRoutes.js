const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { parseResume } = require('../services/resumeParser');
const { runBiasSimulations } = require('../services/biasEngine');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/analyze', upload.single('resume'), async (req, res) => {
    try {
        const { jobDescription } = req.body;
        const file = req.file;

        if (!jobDescription) {
            return res.status(400).json({ error: 'Job description is required' });
        }
        
        let resumeText = '';

        if (file) {
            // Extract text from PDF
            const fs = require('fs');
            const dataBuffer = fs.readFileSync(file.path);
            const data = await pdfParse(dataBuffer);
            resumeText = data.text;
            // Clean up the uploaded file
            fs.unlinkSync(file.path);
        } else if (req.body.resumeText) {
            resumeText = req.body.resumeText;
        } else {
             return res.status(400).json({ error: 'Resume (file or text) is required' });
        }

        // 1. Parse Resume using LLM
        const parsedResume = await parseResume(resumeText);
        
        if (!parsedResume.skills || parsedResume.skills.length === 0) {
            return res.status(200).json({
                error: 'No skills could be extracted from the resume. Please check the document formatting.'
            });
        }

        // 2. Run Bias Simulations
        const results = await runBiasSimulations(parsedResume, jobDescription);

        res.json(results);

    } catch (error) {
        console.error('Error during analysis:', error);
        res.status(500).json({ error: 'Failed to analyze resume.' });
    }
});

module.exports = router;
