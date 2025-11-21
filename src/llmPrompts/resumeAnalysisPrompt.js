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
  required: [
    "name",
    "email",
    "overall_resume_score",
    "ats_compatibility",
    "keyword_optimization",
    "achievement_focus",
    "resume_analysis",
    "keyword_analysis",
  ],
  additionalProperties: false,
};
