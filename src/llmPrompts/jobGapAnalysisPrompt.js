export const jobGapAnalysisPrompt = (resumeText, jobDescription) => {
  return `
You are a professional resume analyst and an expert in Applicant Tracking Systems (ATS),
job matching, and resume optimization. A candidate is considering applying to the job below.
Before they apply, your job is to find the gaps in their CURRENT resume that would hold them back
for THIS specific job and provide precise, actionable fixes.

Core directive:
- Always ground every claim by citing the exact words/lines from BOTH the resume and the job description.
- If something is wrong or misaligned, clearly explain WHY it is wrong with respect to the JD, and HOW to fix it.


==========================
**Resume**:
${resumeText}
==========================

==========================
**Job Description**:
${jobDescription}
==========================

**Evaluation Dimensions**:

1. **Overall Match Rate (in percentage)**: Evaluate the overall compatibility between the resume and job description based on skills, experience, qualifications, and alignment with job requirements.

2. **Searchability Analysis**: 
   Analyze how well the resume aligns with the job description's requirements from an ATS and recruiter search perspective.
   
   - **Good Points**: 
     Identify 3-7 positive aspects that demonstrate strong alignment with the job description.
     For each good point:
      - Write naturally, e.g., "In your resume it mentions '…'; in the JD it states '…'. This aligns well because …".
      - Explain specifically how this point helps ATS/recruiter matching for this JD.
       - Focus on keyword matches, relevant experience, achievements that align with JD requirements, and any elements that improve ATS visibility.
   
   - **Weak Points**: 
     Identify 3-7 areas where the resume falls short compared to the job description requirements.
     For each weak point:
      - Write naturally, e.g., "In your resume it says '…'; in the JD it requires '…'. This is a gap because … . You can fix this …".
      - Compare the resume quote with a specific JD requirement and state the exact misalignment.
      - Suggest specific improvements (add measurable achievements, add missing keywords, rephrase role scope, etc.).
       - Focus on missing keywords, missing skills, missing experience, or missing qualifications mentioned in the JD.

3. **Skills Analysis**:
   Perform a detailed comparison of skills between the resume and job description.
   
   - **Matching Skills**: 
     List all skills that appear in both the resume and job description.
     For each matching skill, indicate where it appears in the resume (e.g., "Found in Skills section" or "Mentioned in Work Experience").
   
   - **Missing Skills**: 
     List all skills that are mentioned in the job description but are NOT found in the resume.
     For each missing skill, reference the specific requirement from the job description.
     Prioritize critical skills that are emphasized in the JD.

4. **Pros & Cons Analysis**:
   Provide a balanced comparison highlighting strengths and weaknesses when matching the resume against the job description.
   
   - **Pros**: 
     Identify 3-7 advantages where the resume demonstrates strong alignment with the job requirements.
     For each pro:
      - Write naturally, e.g., "In your resume …; in the JD …; this strengthens your fit because …".
      - Explain why this is an advantage for this specific job and how it strengthens the application.
       - Focus on relevant experience, achievements, qualifications, certifications, or other factors that make the candidate a good fit.
   
   - **Cons**: 
     Identify 3-7 disadvantages or gaps where the resume doesn't meet the job requirements.
     For each con:
      - Write naturally, e.g., "In your resume …; the JD asks for …; this hurts because …; suggested fix …".
      - Explain why this is a disadvantage for this specific job.
      - Suggest what could be added or improved to address this gap before applying.
       - Focus on missing experience, missing qualifications, experience gaps, or other factors that reduce the candidate's fit.

5. **Recruiter Tips (Pre-application fixes)**:
   Provide actionable advice from a recruiter's perspective on how to improve the resume for this specific job.
   Identify 3-7 tips that would help the candidate stand out for this position.
   For each tip:
     - Write naturally, e.g., "In your resume …; the JD expects …; do X to address this before applying.".
     - Focus on edits the candidate can make TODAY to raise match rate.
     - Be concrete (add XYZ keyword to Skills; quantify ABC impact in role N; reorder sections; add certification, etc.).

6. **Formatting Analysis**:
   Evaluate the resume's formatting and structure in the context of ATS compatibility and readability for this job.
   
   - **Good Points**: 
     Identify 3-7 formatting strengths that enhance ATS compatibility or readability.
     For each good point:
      - Write naturally, e.g., "In your resume …; this helps ATS readability because …" (JD may be n/a for pure formatting notes).
      - Explain how this formatting helps ATS parsing or recruiter review.
       - Examples: proper section headings, consistent formatting, absence of special characters, proper file structure, etc.
   
   - **Bad Points**: 
     Identify 3-7 formatting weaknesses that could harm ATS compatibility or readability.
     For each bad point:
      - Write naturally, e.g., "In your resume …; this can harm ATS parsing because …; You can fix this …".
      - Explain how this formatting issue could cause problems.
      - Provide specific suggestions for improvement.
       - Examples: missing sections, inconsistent formatting, special characters, problematic file names, etc.

**Important Guidelines**:
- Always reference actual quotes or specific sections from both the resume and job description.
- Be specific and actionable in all feedback.
- Prioritize critical requirements mentioned in the job description.
- Focus on concrete, measurable improvements.
- Ensure all points are relevant to the specific job description provided.
- Avoid generic or vague comments - always tie feedback to specific content in the resume or JD.
- Never invent content; if a requirement is missing, state it is missing and propose a realistic fix.

`;
};

export const jobGapAnalysisSchema = {
  type: "object",
  properties: {
    overall_match_rate: {
      type: "string",
      pattern: "^\\d+%$",
    },
    searchability: {
      type: "object",
      properties: {
        good_points: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
        },
        weak_points: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
        },
      },
      required: ["good_points", "weak_points"],
      additionalProperties: false,
    },
    skills: {
      type: "object",
      properties: {
        matching_skills: {
          type: "array",
          items: { type: "string" },
        },
        missing_skills: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["matching_skills", "missing_skills"],
      additionalProperties: false,
    },
    pros_and_cons: {
      type: "object",
      properties: {
        pros: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
        },
        cons: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
        },
      },
      required: ["pros", "cons"],
      additionalProperties: false,
    },
    recruiter_tips: {
      type: "array",
      items: { type: "string" },
      minItems: 1,
    },
    formatting: {
      type: "object",
      properties: {
        good_points: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
        },
        bad_points: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
        },
      },
      required: ["good_points", "bad_points"],
      additionalProperties: false,
    },
  },
  required: ["overall_match_rate", "searchability", "skills", "pros_and_cons", "recruiter_tips", "formatting"],
  additionalProperties: false,
};
