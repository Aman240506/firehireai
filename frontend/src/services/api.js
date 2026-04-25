import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const analyzeCandidate = async (file, resumeText, jobDescription) => {
    const formData = new FormData();
    
    if (file) {
        formData.append('resume', file);
    } else if (resumeText) {
        formData.append('resumeText', resumeText);
    }
    
    formData.append('jobDescription', jobDescription);

    const response = await axios.post(`${API_BASE_URL}/analyze`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
};
