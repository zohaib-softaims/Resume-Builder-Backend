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

1. Overall Resume Score (in percentage): Evaluate overall quality of the resume based on ATS compatibility, keyword optimization, and achievement focus.
2. ATS Compatibility (score out of 100): How well the resume would perform in an ATS system.
3. Keyword Optimization (score out of 100): Check whether industry-relevant keywords are used that are required by ATS.
4. Achievement Focus (score out of 100): Assess how well the resume quantifies achievements with metrics (e.g., "increased revenue by 27%").
5. Resume Strength Tips:
    Positive - One positive key insight or the strongest aspect of this resume (e.g., strong quantified achievements).
    Negative - One negative key insight or the most critical weakness that should be improved(e.g., missing certifications, missing quantified achievements, missing an importanrt section).
6. Resume Analysis:
    - Strengths: List of 3-5 things the resume does well. For each strength, clearly refer to the part of the CV that demonstrates this strength (quote or summarize the relevant sentence or section from the CV).
    - Weaknesses: List of 3-5 areas for improvement in the cv. For each weakness, explain why it needs improvement and also point to a relevant example or reference from the CV (quote or summarize the section that demonstrates this weakness).
7. Keyword Analysis:
    - List of missing or recommended keywords based on the target job or industry.
    - Provide advice on how to improve keyword optimization. For the advice, refer or quote a relevant part of the CV that could be improved by adding or optimizing keywords.

Output the results in this JSON format:


{
  "overall_resume_score": "45%",
  "ats_compatibility": 82,
  "keyword_optimization": 45,
  "achievement_focus": 70,
  "resume_strength_tips": {
     "positive": {
      "heading": "",
      "description": ""
    }, 
    "negative": {
      "heading": "",
      "description": ""
    } 
  },
  "resume_analysis": {
    "strengths": [
      "Quantified impact with metrics like 'increased revenue by 27%'",
      "Relevant industry experience"
    ],
    "weaknesses": [
      "No mention of certifications",
    ]
  },
  "keyword_analysis": {
    "missing_keywords": ["", "", "", "",...], //Only include technical and domain-specific keywords such as tools, frameworks, and job-related hard skills.
    "suggestions": "Consider integrating missing keywords into relevant experience or skills sections."
  }
}

 ### Important:
    Do not add anything outside the JSON block. Always follow this format strictly.
    Do NOT wrap any of your JSON responses in triple backticks (\`\`\`), do NOT use \`\`\`json, and do NOT include any markdown syntax. 
`;
};
