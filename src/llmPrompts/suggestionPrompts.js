/**
 * Suggestion Generation Prompt
 * Analyzes resume against job gap analysis and generates actionable suggestions
 */

export const generateSuggestionsPrompt = (resumeText, gapAnalysis) => {
  return `
You are a professional resume optimization expert. Generate specific, actionable suggestions to improve this resume based on the gap analysis.

==========================
**RESUME**:
${resumeText}
==========================

==========================
**GAP ANALYSIS**:

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

**YOUR TASK:**

Generate 8-20 HIGH-IMPACT suggestions to improve this resume for the job.

**PROCESS:**
1. Address missing skills → add them to skills section
2. Fix searchability weak points and cons → enhance summary, experience, or projects
3. Apply recruiter tips → specific improvements
4. Fix critical formatting issues if needed

**RULES:**
- Be SPECIFIC: Say exactly WHAT to change and WHERE
- Only suggest realistic changes (don't invent experience the candidate doesn't have)
- Prioritize changes that directly address gaps in the analysis
- For experience/projects, reference the company/project name in the field
- Show clear before and after content

**SECTIONS:**
- summary: Professional summary (single paragraph)
- skills: Technical/soft skills (comma-separated lists)
- experience: Work experience bullet points
- projects: Project descriptions bullet points
- achievements: Awards and recognitions
- education: Degrees and universities
- certifications: Professional certifications

**TYPES:**
- add: Add completely new content
- remove: Remove irrelevant or outdated content
- enhance: Improve existing content (add metrics, keywords, details)
- rewrite: Completely rewrite for better impact

**FIELD NAMING FORMAT:**
- For skills: "skills" or "skills - [Category Name]"
- For summary: "summary"
- For experience: "experience at [Company Name] - [brief description]"
- For projects: "project [Project Name] - [brief description]"
- For achievements: "achievements"
- For education: "education at [University Name]"
- For certifications: "certifications - [Cert Name]"

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

Add missing skills:
{
  "section": "skills",
  "type": "add",
  "target": {
    "field": "skills - Backend Technologies",
    "current": "Node.js, Express, PostgreSQL"
  },
  "proposed": "Node.js, Express, PostgreSQL, Kubernetes, Redis, GraphQL, Docker",
  "preview": "Add Kubernetes, Redis, GraphQL, and Docker (critical missing skills from job requirements)"
}

Enhance experience bullet:
{
  "section": "experience",
  "type": "enhance",
  "target": {
    "field": "experience at Google - API development",
    "current": "Built REST APIs for the platform"
  },
  "proposed": "Architected and deployed microservices-based REST APIs handling 100K+ requests/day with 99.9% uptime, using Node.js, Redis caching, and Kubernetes orchestration",
  "preview": "Add metrics, scale, and missing keywords (microservices, Kubernetes) to API development work"
}

Rewrite summary:
{
  "section": "summary",
  "type": "rewrite",
  "target": {
    "field": "summary",
    "current": "Full-stack developer with 5 years of experience in web development"
  },
  "proposed": "Senior Full-Stack Engineer with 5+ years building scalable microservices architectures. Expert in React, Node.js, Kubernetes, and AWS. Led development of cloud-native applications serving 1M+ users with 99.9% uptime. Proven track record in distributed systems and DevOps automation.",
  "preview": "Rewrite summary to emphasize microservices, cloud, scale, and leadership (key job requirements)"
}

Add certification:
{
  "section": "certifications",
  "type": "add",
  "target": {
    "field": "certifications - AWS Solutions Architect",
    "current": ""
  },
  "proposed": "- Expert-level certification demonstrating cloud architecture skills\n- Validates ability to design distributed systems on AWS",
  "preview": "Add AWS Certified Solutions Architect certification (mentioned in job requirements)"
}

Add project detail:
{
  "section": "projects",
  "type": "enhance",
  "target": {
    "field": "project E-commerce Platform - payment integration",
    "current": "Integrated payment gateway using Stripe"
  },
  "proposed": "Integrated Stripe payment gateway processing $2M+ in transactions monthly, implementing PCI-compliant tokenization, webhook handling for real-time updates, and automated reconciliation reducing errors by 95%",
  "preview": "Add scale metrics, security details, and impact to payment integration work"
}

**NOW GENERATE SUGGESTIONS:**

Focus on changes that will have the biggest impact on increasing the match rate from ${gapAnalysis.overall_match_rate || 'current'} to a higher percentage. Be specific, actionable, and realistic.
`;
};
