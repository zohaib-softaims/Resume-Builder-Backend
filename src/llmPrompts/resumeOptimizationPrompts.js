export const getOptimizedSummaryPrompt = (resumeText, resumeAnalysis) => {
  return `
You are a professional resume writer specializing in creating impactful executive summaries and professional summaries. Your task is to refine and optimize the summary section of a resume.

==========================
**Resume**:
${resumeText}
==========================

==========================
**Current Resume Analysis**:
${JSON.stringify(resumeAnalysis, null, 2)}
==========================

**Your Task**:
Write an optimized professional summary section that:
1. Addresses the identified weaknesses in the current resume
2. Incorporates missing keywords naturally and contextually
3. Highlights the candidate's key strengths identified in the analysis
4. Maintains authenticity and avoids keyword stuffing
5. Is specific, compelling, and tailored to the candidate's background

**CRITICAL RULE**: You CANNOT remove ANY information from the original resume. You can only:
- Add new information based on the resume analysis
- Enhance existing information with more detail
- Improve clarity and presentation

**Instructions**:
- Review the entire resume analysis above to understand the strengths, weaknesses, and recommendations
- If no summary exists in the resume, create one from scratch based on the experience and skills
- If a summary exists, refine it significantly while keeping ALL original information intact and adding improvements but keep the summary concise.
- Use information from the resume analysis to guide your optimization
- Pay special attention to any areas for improvement mentioned in the analysis
- Leverage strengths identified in the analysis

`;
};

export const getOptimizedSkillsPrompt = (resumeText, resumeAnalysis) => {
  return `
You are a professional resume writer specializing in SKILLS section optimization for ATS compatibility and recruiter readability.

==========================
**Resume**:
${resumeText}
==========================

==========================
**Current Resume Analysis**:
${JSON.stringify(resumeAnalysis, null, 2)}
==========================

YOUR TASK:
1) RETAIN all skills exactly as listed in the resume's existing Skills section, preserving their original category names and items.
2) EXTRACT additional skills, tools, frameworks, and technologies explicitly mentioned anywhere else in the resume (Experience, Projects, Achievements) that are NOT already in the Skills section.
3) INTEGRATE missing keywords from the Resume Analysis.
4) ADD the extracted items into an appropriate category while keeping the original categories intact. If a fitting category exists, use it; otherwise create a new, specific, related category name.
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

OUTPUT REQUIREMENTS:
- Return a cleanly written Skills section in text that groups items under category headings.
- Keep original category names and their items as-is, appending new items where applicable.
- Integrate analysis keywords in skill section.
- If no existing Skills section exists, create sensible, specific categories (never "Additional/Other/Miscellaneous") and list all skills you extracted.
- Do NOT include categories with no items.
`;
};

export const getOptimizedProjectsPrompt = (resumeText, resumeAnalysis) => {
  return `You are an expert resume optimization specialist with deep knowledge of ATS systems, industry best practices, and technical recruiting standards. Your task is to rewrite and enhance ONLY the Projects section of the provided resume.

==========================
**ORIGINAL RESUME**:
${resumeText}
==========================

==========================
**RESUME ANALYSIS** (Weaknesses, Strengths & Keywords):
${JSON.stringify(resumeAnalysis, null, 2)}
==========================

==========================
**YOUR TASK**:
==========================

Rewrite and optimize the Projects section following these strict requirements:

**PRIMARY OBJECTIVES:**
1. Address all identified weaknesses from the resume analysis (EXCEPT any suggestions about making content more concise or reducing length)
2. Strategically incorporate missing keywords identified in the keyword analysis
3. Strengthen technical descriptions and impact statements
4. Enhance clarity, professionalism, and ATS compatibility

**CRITICAL CONSTRAINTS:**
 **MANDATORY - INFORMATION PRESERVATION:**
- You MUST retain ALL information, details, technologies, achievements, and metrics from the original Projects section
- You can ADD new information, details, and context to make projects more comprehensive
- You can REPHRASE and REORGANIZE existing information for better impact
- You CANNOT remove, omit, or discard ANY piece of information from the original projects
- Even if the analysis suggests the resume is too lengthy, IGNORE that specific weakness - focus on enriching, not condensing

**ENHANCEMENT GUIDELINES:**

1. **Keyword Integration:**
   - Naturally weave in missing keywords from the analysis
   - Prioritize technical skills, tools, and methodologies relevant to target roles
   - Ensure keywords fit contextually and don't feel forced

2. **Structure & Formatting:**
   - Use strong action verbs (Developed, Engineered, Implemented, Architected, Optimized, etc.)


3. **Content Enhancement:**
   - Expand on technical implementations with more specific details
   - Add context about project scope, team size, or duration if missing
   - Highlight problem-solving approaches and technical challenges overcome
   - Emphasize measurable outcomes (performance improvements, user impact, efficiency gains)
   - Include relevant technologies, frameworks, and tools used

4. **Weakness Mitigation:**
   - Address weak or vague statements identified in the analysis
   - Strengthen passive descriptions with active, impactful language
   - Add specificity where the analysis identified generic statements
   - Improve technical depth where noted as lacking

5. **Quality Standards:**
   - Ensure consistent tone and formatting across all projects
   - Maintain professional, confident language
   - Use present tense for ongoing projects, past tense for completed ones
   - Avoid buzzwords without substance - back claims with concrete details
   - Ensure each bullet point demonstrates value and technical competency

**OUTPUT FORMAT:**
Provide ONLY the rewritten Projects section in clean, properly formatted text. Use this structure:



**IMPORTANT REMINDERS:**
- Focus ONLY on the Projects section - do not modify other resume sections
- Every detail from the original projects MUST appear in the optimized version (enhanced, but present)
- Your output should be MORE detailed and comprehensive than the original, not shorter
- Prioritize clarity, impact, and ATS optimization while preserving all original information

Generate the optimized Projects section now:`;
};

export const getOptimizedExperiencePrompt = (resumeText, resumeAnalysis) => {
  return `You are an expert resume optimization specialist with deep knowledge of ATS systems, industry best practices, and professional recruiting standards. Your task is to rewrite and enhance ONLY the Experience section of the provided resume.

==========================
**ORIGINAL RESUME**:
${resumeText}
==========================

==========================
**RESUME ANALYSIS** (Weaknesses, Strengths & Keywords):
${JSON.stringify(resumeAnalysis, null, 2)}
==========================

==========================
**YOUR TASK**:
==========================

Rewrite and optimize the Experience section following these strict requirements:

**PRIMARY OBJECTIVES:**
1. Address all identified weaknesses from the resume analysis (EXCEPT any suggestions about making content more concise or reducing length)
2. Strategically incorporate missing keywords identified in the keyword analysis
3. Enhance impact statements with quantifiable achievements
4. Strengthen technical depth and professional accomplishments
5. Improve ATS compatibility and recruiter readability

**CRITICAL CONSTRAINTS:**
**MANDATORY - INFORMATION PRESERVATION:**
- You MUST retain ALL information, details, responsibilities, achievements, technologies, and metrics from the original Experience section
- You can ADD new context, details, and elaboration to make experiences more comprehensive
- You can REPHRASE and REORGANIZE existing information for stronger impact
- You CANNOT remove, omit, or discard ANY piece of information from the original experiences
- Even if the analysis suggests the resume is too lengthy, IGNORE that specific weakness - focus on enriching, not condensing
- Preserve all job titles, company names, dates, locations, and duration exactly as provided

**ENHANCEMENT GUIDELINES:**

1. **Keyword Integration:**
   - Naturally incorporate missing keywords from the analysis throughout bullet points
   - Prioritize role-relevant technical skills, tools, methodologies, and industry terms
   - Ensure keywords enhance the narrative and don't feel artificially inserted
   - Match keyword density to industry standards for the target role

2. **Structure & Formatting:**
   - Use powerful action verbs that demonstrate leadership and impact (Led, Spearheaded, Architected, Drove, Optimized, Engineered, Implemented, Transformed, etc.)


3. **Content Enhancement - The STAR Method:**
   - **Situation**: Provide context where missing (team size, project scope, business challenge)
   - **Task**: Clarify responsibilities and technical challenges
   - **Action**: Detail specific actions taken, technologies used, and methodologies applied
   - **Result**: Emphasize measurable outcomes and business impact
   
4. **Quantification & Impact:**
   - Add or enhance metrics wherever possible (%, $, time saved, user growth, performance improvements)
   - If exact numbers aren't available in original, add contextual impact statements
   - Translate technical work into business value (e.g., "Reduced server costs by optimizing queries")
   - Highlight scale: data volume, user base, transaction volume, system throughput
   - Include efficiency gains, quality improvements, and revenue impact

5. **Technical Depth:**
   - Expand on technical implementations with specific technologies and tools

6. **Weakness Mitigation:**
   - Strengthen vague or generic statements identified in the analysis
   - Replace passive voice with active, confident language
   - Add specificity to responsibilities that lack detail
   - Enhance shallow descriptions with technical depth and context
   - Address any gaps in demonstrating progression or growth

7. **Professional Presentation:**
   - Ensure consistent tone across all roles (professional, confident, achievement-focused)
   - Use present tense for current role, past tense for previous roles
   - Avoid personal pronouns (I, me, my, we)
   - Eliminate buzzwords without substance - every claim should be backed by specifics
   - Ensure parallel structure within each role's bullet points

8. **Career Narrative:**
   - Highlight increasing scope of impact and leadership
   - Demonstrate continuous learning and skill development
   - Connect experiences to show coherent career trajectory

**OUTPUT FORMAT:**
Provide ONLY the rewritten Experience section in clean, properly formatted text. Use this structure:



**IMPORTANT REMINDERS:**
- Focus ONLY on the Experience section - do not modify other resume sections
- Every detail from the original experience entries MUST appear in the optimized version (elaborated, but present)
- Your output should be MORE detailed and comprehensive than the original, never shorter
- Prioritize impact, specificity, and ATS optimization while preserving all original information
- If a role has limited information in the original, expand it with reasonable context while maintaining accuracy

Generate the optimized Experience section now:`;
};

export const getOptimizedAchievementsAwardsPrompt = (resumeText, resumeAnalysis) => {
  return `
You are a professional resume writer. Optimize Achievements and Awards with precise conditional behavior.

==========================
**Resume**:
${resumeText}
==========================

==========================
**Resume Analysis**:
${JSON.stringify(resumeAnalysis, null, 2)}
==========================

STRICT BEHAVIOR:
- If BOTH Achievements and Awards exist in the resume: generate BOTH sections.
- If ONLY Achievements exist: generate ONLY Achievements.
- If ONLY Awards exist: generate ONLY Awards.
- If NEITHER exists: return an empty string (no content).

ENHANCEMENT RULES:
1) Preserve all existing items; do not remove content.
2) Strengthen with measurable outcomes, scope, and impact where supported by resume content.
3) Use strong action verbs and concise, professional phrasing.
4) Integrate missing keywords naturally only when justified by resume content.

OUTPUT FORMAT (plain text, no JSON):
- Use clear section headers like "Achievements" and/or "Awards" only if that section is present.
- Under Achievements: bullet list of improved points.
- Under Awards: for each award include title, issuer, year; bullet context if useful.
- If neither section exists, output must be exactly empty.
`;
};
