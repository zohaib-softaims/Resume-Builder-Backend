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

2) EXTRACT additional skills from Experience, Projects, and Achievements sections ONLY IF they meet ALL these criteria:
   - It's a specific tool, software, language, framework, platform, or equipment with an official name
   - It would appear in a job posting under "Required Skills" or "Technical Requirements"
   - It's NOT already in the Skills section
   - It's NOT any of these BANNED items:
     ❌ Soft skills (Communication, Teamwork, Leadership, Problem-solving, Time management)
     ❌ Personality traits (Detail-oriented, Self-motivated, Adaptable, Creative)
     ❌ Certifications (AWS Certified, PMP, CPA, Six Sigma, Licensed Professional)
     ❌ Job responsibilities (Project management, Customer service, Data analysis, Budgeting)
     ❌ Buzzwords (Innovation, Strategic thinking, Best practices, Scalability, Optimization)
     ❌ Generic concepts (Agile, Microservices, CI/CD, Cloud, APIs) - unless it's a specific tool
     ❌ Job titles (Manager, Engineer, Analyst, Specialist)
   
   VALID examples to ADD: Python, React, Salesforce, Excel, AutoCAD, Photoshop, SQL, Docker, Tableau, Epic EMR, CNC Programming, Welding
   INVALID examples to REJECT: "Team player", "AWS Certified", "Problem-solving", "Agile methodology", "Strong communication"

3) Extract keywords from Resume Analysis ONLY IF:
   - The keyword is a tangible tool/software/language/technology (not a concept or trait)
   - The keyword actually appears in the resume text
   - The keyword is NOT in the BANNED list above
   - When in doubt, DO NOT ADD

4) ADD extracted skills into an appropriate category. If a fitting category exists, use it; otherwise create a new, specific, domain-related category name.

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
  return `You are an expert resume optimization specialist with deep knowledge of ATS systems, industry best practices, and technical recruiting standards.

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

Rewrite and optimize ONLY the Projects section following these requirements:

**CRITICAL RULE - INFORMATION PRESERVATION:**
⚠️ You MUST include EVERY piece of information from the original Projects section. This means:
- Every project name
- Every company/organization name
- Every technology, framework, library, or tool mentioned
- Every number, metric, percentage, or time period
- Every feature, functionality, or component described
- Every achievement or outcome mentioned
- Every descriptive word (modular, scalable, responsive, etc.)

Think of this as EXPANDING and ENHANCING the original, NEVER reducing or summarizing it.

**TRANSFORMATION STRATEGY:**

Instead of copying the original, transform it using these techniques:

1. **Restructure Sentences Completely:**
   - Change sentence patterns and flow
   - Start bullets with different action verbs
   - Vary the rhythm and structure across bullets
   
   Example:
   - Original: "Built a web app using React and Node.js"
   - Transform: "Engineered a full-stack web application leveraging React for the frontend and Node.js for server-side logic"

2. **Add Technical Depth:**
   - Expand on HOW things were implemented
   - Mention architectural patterns, design decisions
   - Add technical context that would naturally exist
   
   Example:
   - Original: "Implemented user authentication"
   - Enhanced: "Implemented secure user authentication using JWT tokens with bcrypt password hashing and role-based access control (RBAC)"

3. **Add Context & Scale:**
   - Add reasonable context about project scope
   - Include scale indicators (users, data volume, requests)
   - Mention team structure or collaboration
   
   Example:
   - Original: "Developed API endpoints"
   - Enhanced: "Developed 15+ RESTful API endpoints handling 50K+ daily requests with comprehensive error handling and validation"

4. **Show Problem → Solution → Impact:**
   - Frame work as solving specific problems
   - Explain your technical approach
   - Quantify or describe the impact
   
   Example:
   - Original: "Optimized database queries"
   - Enhanced: "Resolved performance bottlenecks by optimizing complex SQL queries and implementing database indexing, reducing query execution time from 3 seconds to 200ms"

5. **Integrate Missing Keywords Naturally:**
   From the Resume Analysis, identify missing keywords and weave them into descriptions where they fit contextually.
   
   Example:
   - If "CI/CD" is missing and you deployed: "Established CI/CD pipeline using GitHub Actions..."
   - If "Microservices" is missing and architecture allows: "...following microservices architecture principles"

**ENHANCEMENT EXAMPLES:**

❌ TOO SIMILAR (avoid this):
Original: "Created a dashboard using React and integrated it with backend API"
Bad rewrite: "Developed a dashboard with React and connected it to the backend API"

✅ PROPERLY TRANSFORMED (do this):
"Architected an interactive analytics dashboard using React with Material-UI components, integrating RESTful API endpoints for real-time data visualization and enabling users to generate custom reports with 5+ filtering options"

---

❌ TOO SIMILAR:
Original: "Implemented responsive design for mobile devices"
Bad rewrite: "Built responsive design to support mobile devices"

✅ PROPERLY TRANSFORMED:
"Engineered mobile-first responsive layouts using CSS Grid and Flexbox with Tailwind CSS, ensuring pixel-perfect rendering across iOS and Android devices and achieving 98+ Lighthouse mobile performance score"

---

❌ TOO SIMILAR:
Original: "Used Docker for containerization"
Bad rewrite: "Applied Docker for application containerization"

✅ PROPERLY TRANSFORMED:
"Containerized the application using Docker with multi-stage builds to reduce image size by 60%, and orchestrated local development environments using Docker Compose with automated database seeding and hot-reloading for rapid iteration"

**STYLE GUIDELINES:**

- **Strong Action Verbs**: Architected, Engineered, Spearheaded, Designed, Implemented, Optimized, Developed, Automated, Streamlined, Integrated, Orchestrated, Established
- **Vary Your Openings**: Don't start every bullet the same way
- **Be Specific**: Replace vague terms with precise technical language
- **Show Value**: Every bullet should demonstrate clear value delivered
- **Use Numbers**: Add metrics where reasonable (response times, user counts, performance gains, feature counts)

**VERIFICATION METHOD:**

After writing each project, ask yourself:
1. Did I mention every technology from the original? ✓
2. Did I keep every metric/number? ✓
3. Did I preserve every feature/functionality described? ✓
4. Did I include the company/organization name if it was there? ✓
5. Is this substantially different in wording from the original? ✓
6. Did I add technical depth and context? ✓
7. Did I integrate relevant missing keywords? ✓

If any answer is NO, revise before moving to the next project.

**OUTPUT FORMAT:**

PROJECTS

**[Project Name]** | [Technology Stack]
[Compelling 1-2 sentence description of what the project is and its purpose]
- [Transformed and enhanced bullet point]
- [Transformed and enhanced bullet point]
- [Transformed and enhanced bullet point]
[Continue for all relevant work...]

[Next project...]

**IMPORTANT NOTES:**

- Read the ENTIRE original Projects section carefully before starting
- Preserve EVERYTHING but express it better
- Add depth, context, and technical details
- Make it substantially different in wording
- Ensure every project is more detailed than the original
- If you're unsure whether to include something, INCLUDE IT

Generate the enhanced Projects section now:`;
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

export const getOptimizedAchievementsAwardsPrompt = (
  resumeText,
  resumeAnalysis
) => {
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

SCOPE RESTRICTION (CRITICAL)
You can ONLY work with items already listed under:
- "Achievements" section
- "Awards" or "Honors" section

DO NOT extract or add content from:
- Experience section
- Projects section
- Education section
- Skills section
- Certifications or Licenses section
- Any other resume section
into achievement or award section 

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
