/**
 * Suggestion Generation Prompt
 * Analyzes resume against job gap analysis and generates actionable suggestions
 */

export const generateSuggestionsPrompt = (resumeText, gapAnalysis, jobDescription) => {
  return `
You are a professional resume optimization expert. Generate specific, actionable suggestions to improve this resume based on the gap analysis and job description.

==========================
**RESUME (CURRENT)**:
${resumeText}
==========================

==========================
**GAP ANALYSIS (WHAT'S MISSING/WEAK)**:

Job Title: ${gapAnalysis.job_title || 'N/A'}
Match Rate: ${gapAnalysis.overall_match_rate || 'N/A'}

**Searchability:**
Good Points:
${gapAnalysis.searchability?.good_points?.map((point, i) => `${i + 1}. ${point}`).join('\n') || 'None'}

Weak Points:
${gapAnalysis.searchability?.weak_points?.map((point, i) => `${i + 1}. ${point}`).join('\n') || 'None'}

**Skills:**
Matching Skills: ${gapAnalysis.skills?.matching_skills?.join(', ') || 'None'}
Missing Skills: ${gapAnalysis.skills?.missing_skills?.join(', ') || 'None'}

**Pros & Cons:**
Pros:
${gapAnalysis.pros_and_cons?.pros?.map((pro, i) => `${i + 1}. ${pro}`).join('\n') || 'None'}

Cons:
${gapAnalysis.pros_and_cons?.cons?.map((con, i) => `${i + 1}. ${con}`).join('\n') || 'None'}

**Recruiter Tips:**
${gapAnalysis.recruiter_tips?.map((tip, i) => `${i + 1}. ${tip}`).join('\n') || 'None'}

**Formatting:**
Good Points:
${gapAnalysis.formatting?.good_points?.map((point, i) => `${i + 1}. ${point}`).join('\n') || 'None'}

Bad Points:
${gapAnalysis.formatting?.bad_points?.map((point, i) => `${i + 1}. ${point}`).join('\n') || 'None'}
==========================

==========================
**JOB DESCRIPTION (TARGET TO MATCH)**:
${jobDescription || 'N/A'}
==========================

**YOUR TASK:**

Generate 8-20 HIGH-IMPACT suggestions to improve this resume for the job.

**WHAT IS HIGH-IMPACT:**
A suggestion is HIGH-IMPACT if it addresses specific gaps identified above:
- Fixes Missing Skills (adds technologies/skills from gap analysis missing_skills list)
- Fixes Searchability Weak Points (enhances summary, experience, or projects with keywords)
- Addresses Cons (resolves negative points identified in pros_and_cons)
- Implements Recruiter Tips (applies specific advice from recruiter_tips)
- Fixes Formatting Bad Points (resolves ATS or scannability issues)
- Adds Job Description Keywords (incorporates exact terminology from job posting)

**PROCESS:**
1. First, analyze the resume to understand existing sections and content structure
2. For each gap category, generate targeted suggestions:
   - Missing Skills → Add to existing skills section (use exact skill names from gap analysis or job description)
   - Weak Searchability → Enhance summary/experience with keywords
   - Cons → Fix or rewrite problematic content
   - Recruiter Tips → Apply specific improvements mentioned
   - Formatting Issues → Resolve ATS/readability problems
3. Prioritize suggestions by potential match rate impact (biggest gaps first)

**CRITICAL RULES:**
- Use EXACT skill/certification names from gap analysis or job description (e.g., "AWS Certified Solutions Architect - Associate" not just "AWS cert")
- For skills, use proper capitalization and official names (e.g., "JavaScript" not "javascript", "Node.js" not "NodeJS")
- Only suggest realistic changes based on what the candidate already has (don't fabricate experience)
- Identify actual section names from the resume, don't invent new ones
- For "current" field, extract the exact text from the resume as it appears
- Be specific about WHERE to make changes (company name, project name, section name)

**SUGGESTION STRUCTURE:**

Each suggestion must target one of these sections:
- summary: Professional summary (single paragraph)
- skills: Technical/soft skills (comma-separated lists)
- experience: Work experience bullet points
- projects: Project descriptions bullet points
- achievements: Awards and recognitions
- education: Degrees and universities
- certifications: Professional certifications

Suggestion types:
- add: Add new content (when current="" or adding to existing list)
- remove: Remove irrelevant/outdated content
- enhance: Improve existing content (add metrics, keywords, details)
- rewrite: Completely rewrite for better impact

Field naming (must match actual resume sections):
- For skills: Use exact category from resume (e.g., "Technical Skills", "Programming Languages") or just "skills"
- For summary: "summary"
- For experience: "experience at [Exact Company Name] - [what you're changing]"
- For projects: "project [Exact Project Name] - [what you're changing]"
- For achievements: "achievements"
- For education: "education at [Exact University Name]"
- For certifications: Use full official certification name (e.g., "AWS Certified Solutions Architect - Associate")

**EACH SUGGESTION MUST HAVE:**
{
  "section": "summary" | "skills" | "experience" | "projects" | "achievements" | "education" | "certifications",
  "type": "add" | "remove" | "enhance" | "rewrite",
  "target": {
    "field": "descriptive field name",
    "current": "exact current content (empty string if adding new)"
  },
  "proposed": "new or improved content",
  "preview": "one clear sentence explaining the change"
}

**EXAMPLES:**

Example 1 - Add missing skills (addresses Missing Skills gap):
{
  "section": "skills",
  "type": "add",
  "target": {
    "field": "Technical Skills - Backend",
    "current": "Node.js, Express.js, PostgreSQL"
  },
  "proposed": "Node.js, Express.js, PostgreSQL, Kubernetes, Redis, GraphQL, Docker",
  "preview": "Add Kubernetes, Redis, GraphQL, and Docker to match critical missing skills from job requirements"
}

Example 2 - Enhance experience with metrics (addresses Searchability Weak Points):
{
  "section": "experience",
  "type": "enhance",
  "target": {
    "field": "experience at Google - API development",
    "current": "Built REST APIs for the platform"
  },
  "proposed": "Architected and deployed microservices-based REST APIs handling 100K+ requests/day with 99.9% uptime, using Node.js, Redis caching, and Kubernetes orchestration",
  "preview": "Add scale metrics, impact quantification, and missing keywords (microservices, Kubernetes) to strengthen searchability"
}

Example 3 - Rewrite summary (addresses Cons and Searchability):
{
  "section": "summary",
  "type": "rewrite",
  "target": {
    "field": "summary",
    "current": "Full-stack developer with 5 years of experience in web development"
  },
  "proposed": "Senior Full-Stack Engineer with 5+ years architecting scalable cloud-native applications. Expert in React, Node.js, Kubernetes, and AWS with proven track record delivering high-availability systems serving 1M+ users. Specialized in microservices architecture and DevOps automation.",
  "preview": "Rewrite to include seniority level, cloud-native keywords, scale metrics, and core technologies from job description"
}

Example 4 - Add new certification when none exist (addresses Missing Skills):
{
  "section": "certifications",
  "type": "add",
  "target": {
    "field": "AWS Certified Solutions Architect - Associate",
    "current": ""
  },
  "proposed": "AWS Certified Solutions Architect - Associate (2024)",
  "preview": "Add AWS certification mentioned as required qualification in job description"
}

Example 5 - Remove outdated/irrelevant content (addresses Formatting Bad Points):
{
  "section": "skills",
  "type": "remove",
  "target": {
    "field": "Technical Skills - Frontend",
    "current": "jQuery, AngularJS, Backbone.js, React"
  },
  "proposed": "React",
  "preview": "Remove outdated frameworks (jQuery, AngularJS, Backbone.js) that hurt perceived modernity and ATS relevance"
}

**NOW GENERATE SUGGESTIONS:**

Focus on changes that will have the biggest impact on increasing the match rate from ${gapAnalysis.overall_match_rate || 'current'} to a higher percentage. Be specific, actionable, and realistic.
`;
};
