# FairHire AI ⚖️✨

FairHire AI is a premium, full-stack application designed to detect and explain bias in hiring decisions. By leveraging Google's Gemini AI, the system evaluates candidate resumes against job descriptions through blind simulations—identifying whether non-skill factors (like gender/name, college tier, or employment gaps) are subtly influencing the perceived match score.

---

## 🌟 Key Features

- **Skill-Based Baseline Evaluation:** Analyzes candidate skills against the job description to calculate a core "Match Score".
- **Blind Bias Simulations:** The engine creates anonymized versions of the candidate's resume (e.g., removing name, college, or masking employment gaps) and re-evaluates them to see if the score changes.
- **Bias Impact Visualization:** Visually highlights score variances caused by demographic data.
- **Explainable AI:** Generates specific, readable insights detailing exactly *why* a bias factor impacted the score.
- **Premium SaaS UI:** Features a high-end, dark-themed glassmorphism interface powered by **Framer Motion** for smooth 3D tilt effects, flowing gradient animations, and a rich interactive processing state.

---

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Framer Motion (Advanced animations and 3D interactions)
- React Router DOM
- Vanilla CSS (Custom Design System with Glassmorphism)

**Backend:**
- Node.js & Express.js
- Google Generative AI (`@google/generative-ai` / Gemini 2.5 Flash)
- Multer (File uploads)
- PDF-Parse (Resume text extraction)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine. You will also need a free [Google Gemini API Key](https://aistudio.google.com/app/apikey).

### 1. Backend Setup
The backend handles PDF parsing and communicates with the Gemini API to run the bias simulations.

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add your Gemini API key:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_actual_api_key_here
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```
   *(You should see "Server running on port 5000" in the console).*

### 2. Frontend Setup
The frontend is the premium UI where users upload resumes and view the analysis dashboard.

1. Open a **new** terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
4. The application will automatically open in your browser at `http://localhost:3000`.

---

## 🧠 How the AI Engine Works

1. **Extraction (Resume Parser):** The user uploads a PDF or pastes text. The backend uses Gemini to strictly extract structured JSON data (skills, timeline, gaps, education).
2. **Baseline Evaluation:** The engine asks Gemini to act as a recruiter and evaluate the extracted JSON against the Job Description, returning a baseline `matchScore`.
3. **Simulations (Bias Engine):** 
   - **Mod A:** Removes the candidate's name.
   - **Mod B:** Removes the college/university name.
   - **Mod C:** Explicitly instructs the AI to ignore timeline gaps.
4. **Comparison:** The system compares the baseline score with the simulated scores. Any score variance triggers a bias warning, which is surfaced to the UI along with the AI's reasoning.

---

## 🌍 Deployment

To put this project on the internet:

1. **Backend (Render):** Push your code to GitHub. Connect Render.com to your repo, set the root directory to `backend`, use `npm install` and `node server.js`, and add your `GEMINI_API_KEY` to the environment variables.
2. **Frontend (Vercel):** Connect Vercel to your repo, set the root directory to `frontend`. Before deploying, update your `api.js` to point to your new live Render URL instead of `localhost:5000`. 

---

*Designed to make hiring fair, data-driven, and unbiased.*
