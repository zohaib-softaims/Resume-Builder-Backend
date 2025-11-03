export const getJobOptimizedSummaryPrompt = (resumeText, jobDescription, gapAnalysis) => {
  const missingSkills = gapAnalysis?.skills?.missing_skills || [];
  const weakPoints = gapAnalysis?.searchability?.weak_points || [];
  const cons = gapAnalysis?.pros_and_cons?.cons || [];
  const recruiterTips = gapAnalysis?.recruiter_tips || [];

  return `
You are a professional resume writer specializing in creating impactful executive summaries and professional summaries tailored to specific job descriptions. Your task is to refine and optimize the summary section of a resume to align with the target job.

==========================
**Resume**:
${resumeText}
==========================

==========================
**Job Description**:
${jobDescription}
==========================

==========================
**Gap Analysis - Missing Skills**:
${JSON.stringify(missingSkills, null, 2)}
==========================

==========================
**Gap Analysis - Searchability Weak Points**:
${JSON.stringify(weakPoints, null, 2)}
==========================

==========================
**Gap Analysis - Cons**:
${JSON.stringify(cons, null, 2)}
==========================

==========================
**Gap Analysis - Recruiter Tips**:
${JSON.stringify(recruiterTips, null, 2)}
==========================

**Your Task**:
Write an optimized professional summary section that:
1. Addresses missing skills identified in the gap analysis by naturally incorporating them where supported by the candidate's actual experience
2. Addresses searchability weak points by emphasizing those aspects in the summary
3. Addresses cons by highlighting relevant strengths that counteract the identified weaknesses
4. Incorporates recruiter tips to strengthen the summary
5. Maintains authenticity and avoids keyword stuffing
6. Is specific, compelling, and tailored to the target job

**CRITICAL RULE**: You CANNOT remove ANY information from the original resume. You can only:
- Add new information based on the gap analysis and job description
- Enhance existing information with more detail
- Improve clarity and presentation
- Tailor content to match job requirements

**Instructions**:
- Review the missing skills, weak points, cons, and recruiter tips from the gap analysis
- If no summary exists in the resume, create one from scratch that addresses these gaps
- If a summary exists, refine it significantly while keeping ALL original information intact and adding improvements but keep the summary concise
- Naturally weave in missing skills, address weak points, counteract cons, and incorporate recruiter tips
- Only mention skills/experiences that are actually present in the resume content
`;
};

export const getJobOptimizedSkillsPrompt = (resumeText, jobDescription, gapAnalysis) => {
  const missingSkills = gapAnalysis?.skills?.missing_skills || [];
  const matchingSkills = gapAnalysis?.skills?.matching_skills || [];

  return `
You are a professional resume writer specializing in SKILLS section optimization for ATS compatibility and recruiter readability, specifically tailored to job requirements.

==========================
**Resume**:
${resumeText}
==========================

==========================
**Job Description**:
${jobDescription}
==========================

==========================
**Gap Analysis - Missing Skills (VERY IMPORTANT - MUST INCLUDE ALL)**:
${JSON.stringify(missingSkills, null, 2)}
==========================

==========================
**Gap Analysis - Matching Skills**:
${JSON.stringify(matchingSkills, null, 2)}
==========================

YOUR TASK (in priority order):
1) RETAIN all skills exactly as listed in the resume's existing Skills section, preserving their original category names and items.

2) EXTRACT additional skills, tools, frameworks, and technologies explicitly mentioned anywhere else in the resume (Experience, Projects, Achievements) that are NOT already in the Skills section. Add these to appropriate categories.

3) **CRITICAL**: Include ALL missing skills from the gap analysis. These are skills the job requires that are missing from your resume. You MUST add every single missing skill, even if you need to create new categories. This is VERY IMPORTANT.

4) ADD the extracted items and missing skills into an appropriate category while keeping the original categories intact. If a fitting category exists, use it; otherwise create a new, specific, sensible category name.

5) BAN generic category names such as "Additional", "Other", or "Miscellaneous". Always use clear, domain-specific categories.

6) USE industry-standard terminology (normalize aliases to canonical names where appropriate), and DEDUPLICATE within categories.

7) DO NOT remove any original skills or categories. Only add.

CATEGORY MAPPING GUIDANCE (examples, not exhaustive):
- React Native → Mobile App Development
- Swift, Kotlin → Mobile App Development
- WebSockets, Socket.IO → Real-time / Messaging
- Kafka, RabbitMQ → Real-time / Messaging
- NestJS, Express, Django, Spring Boot → Backend
- React, Next.js, Angular, Vue → Frontend
- PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch → Databases
- AWS, GCP, Azure, Docker, Kubernetes, Terraform → Cloud & DevOps
- Python, TypeScript, Java, Go, C# → Programming Languages
- Jest, Cypress, Playwright → Testing
- GitHub Actions, Jenkins, CircleCI → CI/CD
- Refactoring, Clean Code Principles, Design Patterns → Software Engineering Practices
- Documentation, Code Review → Development Practices

OUTPUT REQUIREMENTS:
- Return a cleanly written Skills section in text that groups items under category headings.
- Keep original category names and their items as-is, appending new items where applicable.
- ALL missing skills from gap analysis MUST be included.
- If no existing Skills section exists, create sensible, specific categories (never "Additional/Other/Miscellaneous") and list all extracted skills plus missing skills.
- Do NOT include categories with no items.
`;
};

export const getJobOptimizedProjectsPrompt = (resumeText, jobDescription, gapAnalysis) => {
  const missingSkills = gapAnalysis?.skills?.missing_skills || [];
  const weakPoints = gapAnalysis?.searchability?.weak_points || [];
  const cons = gapAnalysis?.pros_and_cons?.cons || [];
  const recruiterTips = gapAnalysis?.recruiter_tips || [];
  // Filter out formatting tips
  const relevantRecruiterTips = recruiterTips.filter((tip) => !tip.toLowerCase().includes("formatting") && !tip.toLowerCase().includes("label"));

  return `You are an expert resume optimization specialist. Your task is to rewrite and enhance ONLY the Projects section to align with the target job and fill critical gaps.

==========================
**ORIGINAL RESUME**:
${resumeText}
==========================

==========================
**JOB DESCRIPTION**:
${jobDescription}
==========================

==========================
**CRITICAL - Missing Skills (MUST ADDRESS THESE)**:
${JSON.stringify(missingSkills, null, 2)}
==========================

==========================
**Searchability Weak Points**:
${JSON.stringify(weakPoints, null, 2)}
==========================

==========================
**Cons**:
${JSON.stringify(cons, null, 2)}
==========================

==========================
**Recruiter Tips (EXCLUDING formatting tips)**:
${JSON.stringify(relevantRecruiterTips, null, 2)}
==========================

**PRIMARY OBJECTIVES:**
1. **CRITICAL**: Include projects where you worked on skills from the missing_skills list. Missing skills are VERY IMPORTANT - address as many as possible.
2. Address searchability weak points in project descriptions
3. Address cons by highlighting relevant project work that counters those weaknesses
4. Incorporate recruiter tips into project descriptions where applicable
5. Strengthen technical descriptions and impact statements to match job requirements

**CRITICAL CONSTRAINTS:**
**MANDATORY - INFORMATION PRESERVATION:**
- You MUST retain ALL information, details, technologies, achievements, and metrics from the original Projects section
- You can ADD new information, details, and context to make projects more comprehensive and aligned with job requirements
- You can REPHRASE and REORGANIZE existing information for better impact
- You CANNOT remove, omit, or discard ANY piece of information from the original projects
- Even if the analysis suggests the resume is too lengthy, IGNORE that specific weakness - focus on enriching, not condensing

**ENHANCEMENT GUIDELINES:**

1. **Missing Skills Integration (VERY IMPORTANT)**:
   - For each missing skill, try to find or enhance existing projects that demonstrate work related to that skill
   - Add bullet points about using these missing skills in projects
   - If a project involved refactoring, clean code principles, design patterns, documentation, code review, etc., make it explicit
   - Be specific about which projects used which missing skills

2. **Searchability Weak Points**:
   - Address each weak point by enhancing relevant project descriptions
   - For example, if "refactoring" is a weak point, add explicit mentions of refactoring in project descriptions
   - If "clean code principles" is missing, mention how projects applied clean code principles

3. **Cons Addressing**:
   - Counter cons by emphasizing project work that demonstrates those skills
   - For example, if cons mention "no peer code review", add project bullet points about code review processes

4. **Recruiter Tips Integration**:
   - Incorporate recruiter tips naturally into project descriptions
   - For example, if tip says "highlight refactoring experience", add a project bullet point about refactoring legacy code

5. **Structure & Formatting**:
   - Use strong action verbs (Developed, Engineered, Implemented, Architected, Optimized, Refactored, etc.)

6. **Content Enhancement**:
   - Expand on technical implementations with more specific details
   - Add context about project scope, team size, or duration if missing
   - Highlight problem-solving approaches and technical challenges overcome
   - Emphasize measurable outcomes

**OUTPUT FORMAT:**
Provide ONLY the rewritten Projects section in clean, properly formatted text.

**IMPORTANT REMINDERS:**
- Focus ONLY on the Projects section
- Every detail from the original projects MUST appear (enhanced, but present)
- Your output should be MORE detailed and comprehensive than the original
- Prioritize addressing missing skills, weak points, cons, and recruiter tips
- Tailor content to match job requirements without fabricating experiences

Generate the optimized Projects section now:`;
};

export const getJobOptimizedExperiencePrompt = (resumeText, jobDescription, gapAnalysis) => {
  const missingSkills = gapAnalysis?.skills?.missing_skills || [];
  const weakPoints = gapAnalysis?.searchability?.weak_points || [];
  const cons = gapAnalysis?.pros_and_cons?.cons || [];
  const recruiterTips = gapAnalysis?.recruiter_tips || [];
  // Filter out formatting tips
  const relevantRecruiterTips = recruiterTips.filter((tip) => !tip.toLowerCase().includes("formatting") && !tip.toLowerCase().includes("label"));

  return `You are an expert resume optimization specialist. Your task is to rewrite and enhance ONLY the Experience section to align with the target job and fill critical gaps.

==========================
**ORIGINAL RESUME**:
${resumeText}
==========================

==========================
**JOB DESCRIPTION**:
${jobDescription}
==========================

==========================
**CRITICAL - Missing Skills (MUST ADDRESS THESE)**:
${JSON.stringify(missingSkills, null, 2)}
==========================

==========================
**Searchability Weak Points**:
${JSON.stringify(weakPoints, null, 2)}
==========================

==========================
**Cons**:
${JSON.stringify(cons, null, 2)}
==========================

==========================
**Recruiter Tips (EXCLUDING formatting tips)**:
${JSON.stringify(relevantRecruiterTips, null, 2)}
==========================

**PRIMARY OBJECTIVES:**
1. **CRITICAL**: Include experience/work where you worked on skills from the missing_skills list. Missing skills are VERY IMPORTANT - address as many as possible.
2. Address searchability weak points in experience descriptions
3. Address cons by highlighting relevant work that counters those weaknesses
4. Incorporate recruiter tips into experience descriptions where applicable
5. Enhance impact statements with quantifiable achievements
6. Strengthen technical depth to match job requirements

**CRITICAL CONSTRAINTS:**
**MANDATORY - INFORMATION PRESERVATION:**
- You MUST retain ALL information, details, responsibilities, achievements, technologies, and metrics from the original Experience section
- You can ADD new context, details, and elaboration to make experiences more comprehensive and aligned with job requirements
- You can REPHRASE and REORGANIZE existing information for stronger impact
- You CANNOT remove, omit, or discard ANY piece of information from the original experiences
- Even if the analysis suggests the resume is too lengthy, IGNORE that specific weakness - focus on enriching, not condensing
- Preserve all job titles, company names, dates, locations, and duration exactly as provided

**ENHANCEMENT GUIDELINES:**

1. **Missing Skills Integration (VERY IMPORTANT)**:
   - For each missing skill, try to find or enhance existing experience that demonstrates work related to that skill
   - Add bullet points about using these missing skills in your roles
   - If you did refactoring, applied clean code principles, used design patterns, wrote documentation, or did code reviews, make it explicit in experience descriptions
   - Be specific about which roles involved which missing skills

2. **Searchability Weak Points**:
   - Address each weak point by enhancing relevant experience descriptions
   - For example, if "refactoring" is a weak point, add explicit mentions of refactoring legacy code in experience bullet points
   - If "clean code principles" is missing, mention how you applied clean code principles in your work

3. **Cons Addressing**:
   - Counter cons by emphasizing experience that demonstrates those skills
   - For example, if cons mention "no peer code review", add experience bullet points about conducting/participating in code reviews

4. **Recruiter Tips Integration**:
   - Incorporate recruiter tips naturally into experience descriptions
   - For example, if tip says "highlight refactoring experience", add an experience bullet point about refactoring legacy code

5. **Structure & Formatting**:
   - Use powerful action verbs (Led, Spearheaded, Architected, Drove, Optimized, Engineered, Implemented, Refactored, Transformed, etc.)

6. **Content Enhancement - The STAR Method**:
   - **Situation**: Provide context where missing (team size, project scope, business challenge)
   - **Task**: Clarify responsibilities and technical challenges relevant to the job
   - **Action**: Detail specific actions taken, technologies used, and methodologies applied (especially missing skills)
   - **Result**: Emphasize measurable outcomes and business impact
   
7. **Quantification & Impact**:
   - Add or enhance metrics wherever possible (%, $, time saved, user growth, performance improvements)
   - Translate technical work into business value

8. **Professional Presentation**:
   - Ensure consistent tone across all roles (professional, confident, achievement-focused)
   - Use present tense for current role, past tense for previous roles
   - Avoid personal pronouns (I, me, my, we)
   - Ensure parallel structure within each role's bullet points

**OUTPUT FORMAT:**
Provide ONLY the rewritten Experience section in clean, properly formatted text.

**IMPORTANT REMINDERS:**
- Focus ONLY on the Experience section
- Every detail from the original experience entries MUST appear (elaborated, but present)
- Your output should be MORE detailed and comprehensive than the original, never shorter
- Prioritize addressing missing skills, weak points, cons, and recruiter tips
- Tailor content to match job requirements without fabricating experiences

Generate the optimized Experience section now:`;
};

export const getJobOptimizedAchievementsAwardsPrompt = (resumeText, jobDescription, gapAnalysis) => {
  return `
You are a professional resume writer. Optimize Achievements and Awards with precise conditional behavior, tailored to the target job description.

==========================
**Resume**:
${resumeText}
==========================

==========================
**Job Description**:
${jobDescription}
==========================

==========================
**Job Gap Analysis**:
${JSON.stringify(gapAnalysis, null, 2)}
==========================

STRICT BEHAVIOR:
- If BOTH Achievements and Awards exist in the resume: generate BOTH sections.
- If ONLY Achievements exist: generate ONLY Achievements.
- If ONLY Awards exist: generate ONLY Awards.
- If NEITHER exists: return an empty string (no content).

ENHANCEMENT RULES:
1) Preserve all existing items; do not remove content.
2) Strengthen with measurable outcomes, scope, and impact where supported by resume content and relevant to the job.
3) Use strong action verbs and concise, professional phrasing.
4) Tailor content to highlight achievements/awards most relevant to the job requirements.

OUTPUT FORMAT (plain text, no JSON):
- Use clear section headers like "Achievements" and/or "Awards" only if that section is present.
- Under Achievements: bullet list of improved points.
- Under Awards: for each award include title, issuer, year; bullet context if useful.
- If neither section exists, output must be exactly empty.
`;
};
