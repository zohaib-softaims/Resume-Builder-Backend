export const resumeAnalysisPrompt = (resumeText) => {
  return `
You are a professional resume analyst and an expert in Applicant Tracking Systems (ATS),
keyword optimization, and achievement-focused resume writing. You will analyze a given resume text
and provide a comprehensive report.

==========================
**Resume**:
${resumeText}
==========================


**Evaluation Dimensions**:

1. **Personal Information:**
   - Extract the candidate's **name** (full name if available)
   - Extract the candidate's **email** address

2. Overall Resume Score (in percentage): Evaluate overall quality of the resume based on ATS compatibility, keyword optimization, and achievement focus.
3. ATS Compatibility (score out of 100): How well the resume would perform in an ATS system.
4. Keyword Optimization (score out of 100): Check whether industry-relevant keywords are used that are required by ATS.
5. Achievement Focus (score out of 100): Assess how well the resume quantifies achievements with metrics (e.g., "increased revenue by 27%").
6. **Resume Analysis:**
   - **Strengths:**  
     Identify 3–5 key strengths that make this resume stand out.  
     Focus on elements that genuinely enhance credibility, clarity, or hiring appeal.  
     Each strength must be supported by direct evidence or references from the resume text — quote or summarize specific sections that demonstrate these qualities.  
     Avoid vague or surface-level comments like “good formatting” or “well-structured.” Instead, explain *why* each identified strength adds value and *how* it benefits the candidate’s positioning.

   - **Weaknesses:**  
     Identify 3–5 substantial weaknesses that limit the resume’s effectiveness or clarity.  
     The model should independently determine all relevant weaknesses.  
     Avoid mentioning issues like “too detailed,” “too concise,” or “cluttered formatting.”  
     For each weakness:
       - Explain clearly *why* it weakens the resume.  
       - Reference or quote the exact part of the resume that demonstrates it.  
       - Suggest a constructive, content-level improvement.  
     The critique should sound like that of a professional resume consultant giving practical, actionable feedback not a mechanical checklist.

7. **Keyword Analysis:**
   Perform an in-depth, intelligent keyword assessment based on the resume's domain and context.
   You should infer the candidate's likely target roles or industries by analyzing the content, titles, and skills mentioned in the resume.
   Then, using your understanding of real-world job market expectations (as reflected in top job boards like LinkedIn or Indeed), identify:
   - Which critical industry or role-specific keywords are missing or underrepresented.
   - Which skills, tools, certifications, or domain terms would significantly increase the resume's visibility in ATS and recruiter searches.
   - Don't output arbitrary keyword lists — only relevant, contextually justified keywords that make the resume more competitive in real job searches.

`;
};

export const resumeAnalysisPromptWithContext = (resumeText, previousResumeText, previousResumeAnalysis) => {
  // Parse previous analysis if it's a string
  let previousAnalysis = previousResumeAnalysis;
  if (typeof previousResumeAnalysis === "string") {
    try {
      previousAnalysis = JSON.parse(previousResumeAnalysis);
    } catch (e) {
      previousAnalysis = {};
    }
  }

  return `
You are a professional resume analyst and an expert in Applicant Tracking Systems (ATS),
keyword optimization, and achievement-focused resume writing. You will analyze a given resume text
and provide a comprehensive report.

**INTERNAL CALIBRATION DATA (For scoring consistency only - DO NOT reference in your analysis)**:
Below is a similar resume and its analysis scores for internal calibration purposes. Use this ONLY to maintain consistent scoring standards. Your analysis should be written as if you are analyzing the current resume completely independently, with no reference to this calibration data.

**Calibration Resume Text**:
${previousResumeText}

**Calibration Scores**:
- Overall Score: ${previousAnalysis?.overall_resume_score || "N/A"}
- ATS Compatibility: ${previousAnalysis?.ats_compatibility || "N/A"}
- Keyword Optimization: ${previousAnalysis?.keyword_optimization || "N/A"}
- Achievement Focus: ${previousAnalysis?.achievement_focus || "N/A"}

**CRITICAL INSTRUCTIONS FOR SCORING - FOLLOW THIS EXACT PROCESS**:

**STEP 1: COMPARISON CHECK**
First, carefully compare the current resume with the calibration resume text. Check if they are:
- Completely identical (same content and no differences at all)

**STEP 2: SCORING DECISION**

**IF RESUMES ARE COMPLETELY IDENTICAL OR MERELY HAVE FORMATTING DIFFERENCES:**
- Use the EXACT SAME scores as the calibration scores
- Overall Score: ${previousAnalysis?.overall_resume_score || "N/A"}
- ATS Compatibility: ${previousAnalysis?.ats_compatibility || "N/A"}
- Keyword Optimization: ${previousAnalysis?.keyword_optimization || "N/A"}
- Achievement Focus: ${previousAnalysis?.achievement_focus || "N/A"}

**IF RESUMES HAVE CONTENT DIFFERENCES:**
  If resume has different skills, different quantifiable achievements, added or removed section, enhanced wording or any difference then update the score from
  calibration score accordingly.

**ANALYSIS WRITING**
- DO NOT mention the calibration data, previous resume, comparisons, improvements, additions, expansions, or any indication that you have reference material
- Write your analysis as if this is the first and only resume you are analyzing
- Never use words like "now includes", "adds", "expanded", "improved", "better than", "compared to", "previously", "addition of", "addressing a gap"

==========================
**Resume to Analyze**:
${resumeText}
==========================


**Evaluation Dimensions**:

1. **Personal Information:**
   - Extract the candidate's **name** (full name if available)
   - Extract the candidate's **email** address

2. Overall Resume Score (in percentage): Evaluate overall quality of the resume based on ATS compatibility, keyword optimization, and achievement focus. 
   - If resumes are identical → Use calibration score: ${previousAnalysis?.overall_resume_score || "N/A"}
   - If different → Adjust from calibration score (${
     previousAnalysis?.overall_resume_score || "N/A"
   }) based on identified differences (new skills, achievements, certifications, etc.)

3. ATS Compatibility (score out of 100): How well the resume would perform in an ATS system.
   - If resumes are identical → Use calibration score: ${previousAnalysis?.ats_compatibility || "N/A"}
   - If different → Adjust from calibration score (${previousAnalysis?.ats_compatibility || "N/A"}) based on formatting/structure changes

4. Keyword Optimization (score out of 100): Check whether industry-relevant keywords are used that are required by ATS.
   - If resumes are identical → Use calibration score: ${previousAnalysis?.keyword_optimization || "N/A"}
   - If different → Adjust from calibration score (${previousAnalysis?.keyword_optimization || "N/A"}) based on new/removed skills and certifications

5. Achievement Focus (score out of 100): Assess how well the resume quantifies achievements with metrics (e.g., "increased revenue by 27%").
   - If resumes are identical → Use calibration score: ${previousAnalysis?.achievement_focus || "N/A"}
   - If different → Adjust from calibration score (${
     previousAnalysis?.achievement_focus || "N/A"
   }) based on new/removed quantifiable achievements and general achievements

6. **Resume Analysis:**
   - **Strengths:**  
     Identify 3–5 key strengths that make this resume stand out.  
     Focus on elements that genuinely enhance credibility, clarity, or hiring appeal.  
     Each strength must be supported by direct evidence or references from the resume text — quote or summarize specific sections that demonstrate these qualities.  
     Avoid vague or surface-level comments like "good formatting" or "well-structured." Instead, explain *why* each identified strength adds value and *how* it benefits the candidate's positioning.
     **CRITICAL**: Write strengths based ONLY on what is present in the current resume. Do NOT mention additions, improvements, expansions, or compare to anything else.

   - **Weaknesses:**  
     Identify 3–5 substantial weaknesses that limit the resume's effectiveness or clarity.  
     The model should independently determine all relevant weaknesses.  
     Avoid mentioning issues like "too detailed," "too concise," or "cluttered formatting."  
     For each weakness:
       - Explain clearly *why* it weakens the resume.  
       - Reference or quote the exact part of the resume that demonstrates it.  
       - Suggest a constructive, content-level improvement.  
     The critique should sound like that of a professional resume consultant giving practical, actionable feedback not a mechanical checklist.
     **CRITICAL**: Write weaknesses based ONLY on what is missing or problematic in the current resume. Do NOT mention gaps compared to other resumes or improvements made.

7. **Keyword Analysis:**
   Perform an in-depth, intelligent keyword assessment based on the resume's domain and context.
   You should infer the candidate's likely target roles or industries by analyzing the content, titles, and skills mentioned in the resume.
   Then, using your understanding of real-world job market expectations (as reflected in top job boards like LinkedIn or Indeed), identify:
   - Which critical industry or role-specific keywords are missing or underrepresented.
   - Which skills, tools, certifications, or domain terms would significantly increase the resume's visibility in ATS and recruiter searches.
   - Don't output arbitrary keyword lists — only relevant, contextually justified keywords that make the resume more competitive in real job searches.

**FINAL REMINDER**: Your analysis must read as if you are analyzing this resume completely independently for the first time. Never mention:
- Comparisons to other resumes
- Additions, improvements, expansions, or enhancements
- Previous versions or iterations
- Any indication that you have reference material or calibration data
- Words like "now includes", "adds", "expanded", "improved", "better than", "compared to", "previously", "addition of", "addressing a gap"

Write naturally about what IS in the resume and what COULD be improved, as if this is a standalone analysis.

`;
};

export const resumeAnalysisPromptWithOptimizedResume = (resumeText, previousResumeText, previousResumeAnalysis) => {
  // Parse previous analysis if it's a string
  let previousAnalysis = previousResumeAnalysis;
  if (typeof previousResumeAnalysis === "string") {
    try {
      previousAnalysis = JSON.parse(previousResumeAnalysis);
    } catch (e) {
      previousAnalysis = {};
    }
  }

  return `
You are a professional resume analyst and an expert in Applicant Tracking Systems (ATS),
keyword optimization, and achievement-focused resume writing. You will analyze an optimized resume text
and provide a comprehensive report.

**CONTEXT (For scoring reference only - DO NOT reference in your analysis)**:
You are analyzing an optimized version of a resume. Below is the original resume text and its analysis scores for reference. The optimized resume has been improved and should generally score higher than the original.

**Original Resume Text**:
${previousResumeText}

**Original Resume Analysis Scores**:
- Overall Score: ${previousAnalysis?.overall_resume_score || "N/A"}
- ATS Compatibility: ${previousAnalysis?.ats_compatibility || "N/A"}
- Keyword Optimization: ${previousAnalysis?.keyword_optimization || "N/A"}
- Achievement Focus: ${previousAnalysis?.achievement_focus || "N/A"}

**CRITICAL INSTRUCTIONS FOR SCORING THE OPTIMIZED RESUME**:
1. The current resume is an OPTIMIZED version that has been improved from the original. It should generally score HIGHER than the original resume scores.

2. Evaluate the optimized resume's quality objectively:
   - ATS compatibility (formatting, structure, keyword placement)
   - Keyword optimization (industry-relevant terms, skills, technologies)
   - Achievement focus (quantified metrics, impact statements, results)
   - Overall presentation quality

3. Scoring Guidelines:
   - The optimized resume typically has MORE keywords, MORE skills, BETTER achievements, MORE quantifiable metrics, and STRONGER ATS compatibility than the original
   - Score it HIGHER than the original scores (typically 2-5 points higher, or more if significantly improved)
   - If the optimized resume shows clear improvements in keywords, achievements, or ATS compatibility → Score it HIGHER
   - Only score it lower or similar if the optimization actually made it worse (which is rare)
   - Always ensure: Optimized resume quality improvements = Higher scores than original

4. Maintain reasonable score increases: If original was 85, optimized should typically be 87-90 or higher if significantly improved.

5. DO NOT mention the original resume, comparisons, optimizations, improvements, or any indication that this is an optimized version in your analysis

6. Write your analysis as if you are analyzing this resume independently for the first time

==========================
**Resume to Analyze**:
${resumeText}
==========================


**Evaluation Dimensions**:

1. **Personal Information:**
   - Extract the candidate's **name** (full name if available)
   - Extract the candidate's **email** address

2. Overall Resume Score (in percentage): Evaluate overall quality of the resume based on ATS compatibility, keyword optimization, and achievement focus. This is an optimized resume, so it should score HIGHER than the original score (${
    previousAnalysis?.overall_resume_score || "N/A"
  }). Typically score 2-5 points higher, or more if significantly improved.

3. ATS Compatibility (score out of 100): How well the resume would perform in an ATS system. Optimized resumes typically have better ATS compatibility, so score it HIGHER than the original (${
    previousAnalysis?.ats_compatibility || "N/A"
  }).

4. Keyword Optimization (score out of 100): Check whether industry-relevant keywords are used that are required by ATS. Optimized resumes typically have more and better keywords, so score it HIGHER than the original (${
    previousAnalysis?.keyword_optimization || "N/A"
  }).

5. Achievement Focus (score out of 100): Assess how well the resume quantifies achievements with metrics (e.g., "increased revenue by 27%"). Optimized resumes typically have more and better quantified achievements, so score it HIGHER than the original (${
    previousAnalysis?.achievement_focus || "N/A"
  }).

6. **Resume Analysis:**
   - **Strengths:**  
     Identify 3–5 key strengths that make this resume stand out.  
     Focus on elements that genuinely enhance credibility, clarity, or hiring appeal.  
     Each strength must be supported by direct evidence or references from the resume text — quote or summarize specific sections that demonstrate these qualities.  
     Avoid vague or surface-level comments like "good formatting" or "well-structured." Instead, explain *why* each identified strength adds value and *how* it benefits the candidate's positioning.
     **CRITICAL**: Write strengths based ONLY on what is present in the current resume. Do NOT mention additions, improvements, expansions, or compare to anything else.

   - **Weaknesses:**  
     Identify 3–5 substantial weaknesses that limit the resume's effectiveness or clarity.  
     The model should independently determine all relevant weaknesses.  
     Avoid mentioning issues like "too detailed," "too concise," or "cluttered formatting."  
     For each weakness:
       - Explain clearly *why* it weakens the resume.  
       - Reference or quote the exact part of the resume that demonstrates it.  
       - Suggest a constructive, content-level improvement.  
     The critique should sound like that of a professional resume consultant giving practical, actionable feedback not a mechanical checklist.
     **CRITICAL**: Write weaknesses based ONLY on what is missing or problematic in the current resume. Do NOT mention gaps compared to other resumes or improvements made.

7. **Keyword Analysis:**
   Perform an in-depth, intelligent keyword assessment based on the resume's domain and context.
   You should infer the candidate's likely target roles or industries by analyzing the content, titles, and skills mentioned in the resume.
   Then, using your understanding of real-world job market expectations (as reflected in top job boards like LinkedIn or Indeed), identify:
   - Which critical industry or role-specific keywords are missing or underrepresented.
   - Which skills, tools, certifications, or domain terms would significantly increase the resume's visibility in ATS and recruiter searches.
   - Don't output arbitrary keyword lists — only relevant, contextually justified keywords that make the resume more competitive in real job searches.

**FINAL REMINDER**: Your analysis must read as if you are analyzing this resume completely independently for the first time. Never mention:
- Comparisons to other resumes
- Additions, improvements, expansions, or enhancements
- Previous versions or iterations
- Any indication that you have reference material or calibration data
- Words like "now includes", "adds", "expanded", "improved", "better than", "compared to", "previously", "addition of", "addressing a gap"

Write naturally about what IS in the resume and what COULD be improved, as if this is a standalone analysis.

`;
};

export const resumeAnalysisSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
    },
    email: {
      type: "string",
    },
    overall_resume_score: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },
    ats_compatibility: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },
    keyword_optimization: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },
    achievement_focus: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },
    resume_analysis: {
      type: "object",
      properties: {
        strengths: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
        },
        weaknesses: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
        },
      },
      required: ["strengths", "weaknesses"],
      additionalProperties: false,
    },
    keyword_analysis: {
      type: "object",
      properties: {
        missing_keywords: {
          type: "array",
          items: { type: "string" },
        },
        suggestions: { type: "string" },
      },
      required: ["missing_keywords", "suggestions"],
      additionalProperties: false,
    },
  },
  required: ["name", "email", "overall_resume_score", "ats_compatibility", "keyword_optimization", "achievement_focus", "resume_analysis", "keyword_analysis"],
  additionalProperties: false,
};
