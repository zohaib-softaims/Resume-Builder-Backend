/**
 * Suggestion-Based Optimization Prompts
 * Uses accepted user suggestions to optimize specific resume sections
 */

export const getOptimizedSummaryWithSuggestionsPrompt = (
  resumeText,
  currentSummary,
  acceptedSuggestions
) => {
  return `
You are a professional resume writer specializing in executive summaries and professional profiles.

==========================
**Full Resume**:
${resumeText}
==========================

==========================
**Current Summary**:
${currentSummary}
==========================

==========================
**Accepted Suggestions to Apply**:
${acceptedSuggestions
  .map(
    (s, i) =>
      `${i + 1}. ${s.preview}\n   Current: ${s.target.current}\n   Proposed: ${
        s.proposed
      }`
  )
  .join("\n\n")}
==========================

**PRIMARY TASK**:
Apply ALL the accepted suggestions above to optimize the summary while maintaining a professional tone and powerful impact.

**IMPORTANT RULES**:
1. Apply EVERY suggestion listed above (all ${
    acceptedSuggestions.length
  } suggestions)
2. Maintain professional tone and executive-level impact
3. Keep content concise (3-5 sentences typically)
4. Preserve any information not mentioned in suggestions
5. Ensure smooth flow and natural readability
6. Integrate suggestions seamlessly - avoid choppy or forced language

==========================
**EXAMPLES**:

**Example 1 - Adding Specialization**:
Current: "Software developer with 3 years of experience."

Suggestions:
1. Add "Full-Stack" before "Software developer"
2. Add "specializing in React and Node.js" after "experience"

Optimized Output:
Full-Stack Software developer with 3 years of experience specializing in React and Node.js.

**Example 2 - Enhancing Impact**:
Current: "Experienced engineer working on cloud projects."

Suggestions:
1. Change "Experienced engineer" to "Senior Cloud Solutions Architect"
2. Change "working on cloud projects" to "architecting scalable AWS solutions serving 1M+ users"

Optimized Output:
Senior Cloud Solutions Architect architecting scalable AWS solutions serving 1M+ users.

**Example 3 - Multiple Enhancements**:
Current: "Developer who builds web applications. I have skills in JavaScript."

Suggestions:
1. Change "Developer who builds web applications" to "Full-Stack Engineer specializing in modern web applications"
2. Change "I have skills in JavaScript" to "Expert in JavaScript, TypeScript, React, and Node.js with 5+ years of production experience"

Optimized Output:
Full-Stack Engineer specializing in modern web applications. Expert in JavaScript, TypeScript, React, and Node.js with 5+ years of production experience.
==========================

**OUTPUT FORMAT REQUIREMENT**:

Return ONLY the optimized summary text following these rules:
- Plain text, no markdown formatting or headers
- Typically 3-5 sentences (adjust based on content)
- No preamble (DON'T say "Here is the optimized summary:")
- No explanations, meta-commentary, or notes
- No quotation marks around the entire output
- Start directly with the summary content

✓ VALID Output Example:
Senior Full-Stack Engineer with 5+ years architecting scalable cloud-native applications. Expert in React, Node.js, Kubernetes, and AWS with proven track record delivering high-availability systems serving 1M+ users. Specialized in microservices architecture and DevOps automation.

✗ INVALID Output Examples:
- "Here is the optimized summary: Senior Full-Stack Engineer..." (has preamble - WRONG)
- "**Summary**: Senior Full-Stack Engineer..." (has markdown header - WRONG)
- "Senior Full-Stack Engineer... [Note: I incorporated all 3 suggestions]" (has meta-commentary - WRONG)

==========================
**VERIFICATION CHECKLIST** (Review before returning):

Before finalizing your output, verify:
1. ✓ All ${acceptedSuggestions.length} suggestions have been incorporated
2. ✓ All original information from the current summary is preserved (unless explicitly replaced by a suggestion)
3. ✓ The text flows naturally and reads professionally without awkward transitions
4. ✓ No preambles, explanations, headers, or meta-commentary included
5. ✓ Output format matches the specification exactly (plain text, no markdown, no quotes)

If any check fails, revise the output before returning.
==========================

Return the optimized summary now:
`;
};

export const getOptimizedSkillsWithSuggestionsPrompt = (
  resumeText,
  currentSkills,
  acceptedSuggestions
) => {
  return `
You are an ATS optimization specialist focusing on skills categorization and keyword optimization.

==========================
**Full Resume**:
${resumeText}
==========================

==========================
**Current Skills**:
${currentSkills}
==========================

==========================
**Accepted Suggestions to Apply**:
${acceptedSuggestions
  .map(
    (s, i) =>
      `${i + 1}. ${s.preview}\n   Current: ${s.target.current}\n   Proposed: ${
        s.proposed
      }`
  )
  .join("\n\n")}
==========================

**PRIMARY TASK**:
Optimize the skills section by applying ALL the accepted suggestions above while maintaining logical organization and ATS compatibility.

**IMPORTANT RULES**:
1. Apply EVERY suggestion listed above (all ${
    acceptedSuggestions.length
  } suggestions)
2. For "add" suggestions: integrate new skills into appropriate categories
3. For "remove" suggestions: remove those specific skills
4. For "enhance" suggestions: expand or modify as proposed
5. Maintain logical groupings/categories (e.g., Frontend, Backend, Tools, etc.)
6. Preserve all skills not mentioned in suggestions
7. Keep the format clean, scannable, and ATS-friendly

==========================
**EXAMPLES**:

**Example 1 - Adding Skills**:
Current Skills:
Frontend: React, JavaScript
Backend: Node.js

Suggestions:
1. Add "TypeScript, Next.js" to Frontend category

Optimized Output:
Frontend: React, JavaScript, TypeScript, Next.js
Backend: Node.js

**Example 2 - Enhancing Skills**:
Current Skills:
Languages: JavaScript, Python

Suggestions:
1. Change "JavaScript" to "JavaScript (ES6+)"
2. Add "Go, Rust" to Languages

Optimized Output:
Languages: JavaScript (ES6+), Python, Go, Rust

**Example 3 - Reorganizing with Multiple Changes**:
Current Skills:
Programming: Java, C++
Web: HTML, CSS

Suggestions:
1. Add "Spring Boot, Maven" under Programming
2. Add "React, Vue.js" under Web
3. Remove "C++" from Programming

Optimized Output:
Programming: Java, Spring Boot, Maven
Web: HTML, CSS, React, Vue.js
==========================

**OUTPUT FORMAT REQUIREMENT**:

Return ONLY the optimized skills section following these rules:
- Use clear category labels followed by colon
- List skills separated by commas within each category
- One category per line
- No preamble (DON'T say "Here is the optimized skills section:")
- No explanations, meta-commentary, or notes
- No markdown headers or special formatting
- Start directly with the skills content

✓ VALID Output Example:
Frontend: React, TypeScript, Next.js, Tailwind CSS
Backend: Node.js, Express.js, PostgreSQL, MongoDB
Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD
Tools: Git, VS Code, Postman, Jira

✗ INVALID Output Examples:
- "Here are the updated skills: Frontend: React..." (has preamble - WRONG)
- "**Skills**\nFrontend: React..." (has markdown header - WRONG)
- "Frontend: React (added per suggestion 1)" (has meta-commentary - WRONG)
- "- Frontend: React\n- Backend: Node.js" (uses bullet points - WRONG for this format)

==========================
**VERIFICATION CHECKLIST** (Review before returning):

Before finalizing your output, verify:
1. ✓ All ${acceptedSuggestions.length} suggestions have been applied correctly
2. ✓ All skills not mentioned in suggestions are preserved
3. ✓ Skills are organized into logical, scannable categories
4. ✓ Format is clean and ATS-friendly (category: skill1, skill2, skill3)
5. ✓ No preambles, explanations, headers, or meta-commentary included

If any check fails, revise the output before returning.
==========================

Return the optimized skills section now:
`;
};

export const getOptimizedExperienceWithSuggestionsPrompt = (
  resumeText,
  currentExperience,
  acceptedSuggestions
) => {
  return `
You are a career narrative expert specializing in impact-driven experience descriptions.

==========================
**Full Resume**:
${resumeText}
==========================

==========================
**Current Experience Section**:
${currentExperience}
==========================

==========================
**Accepted Suggestions to Apply**:
${acceptedSuggestions
  .map(
    (s, i) =>
      `${i + 1}. Field: ${s.target.field}\n   ${s.preview}\n   Current: ${
        s.target.current
      }\n   Proposed: ${s.proposed}`
  )
  .join("\n\n")}
==========================

**PRIMARY TASK**:
Optimize the experience section by applying ALL the accepted suggestions above while maintaining impact and professional structure.

**IMPORTANT RULES**:
1. Apply EVERY suggestion listed above (all ${
    acceptedSuggestions.length
  } suggestions)
2. Locate each bullet point using the "Field" reference (e.g., "Senior Developer at TechCorp")
3. Replace the exact "Current" content with the "Proposed" content
4. Preserve all company names, job titles, and dates EXACTLY as written
5. Keep all other bullets that are not mentioned in suggestions UNCHANGED
6. Maintain the overall structure: Company → Position → Dates → Bullets
7. Ensure modified bullets maintain strong action verbs and quantifiable impact

==========================
**EXAMPLES**:

**Example 1 - Enhancing Single Bullet**:
Current Experience:
Software Engineer at ABC Corp | Jan 2020 - Present
• Developed web applications
• Fixed bugs and improved performance

Suggestions:
1. Field: Software Engineer at ABC Corp
   Change "Developed web applications" to "Architected and deployed 5+ React-based web applications serving 50,000+ daily users"

Optimized Output:
Software Engineer at ABC Corp | Jan 2020 - Present
• Architected and deployed 5+ React-based web applications serving 50,000+ daily users
• Fixed bugs and improved performance

**Example 2 - Multiple Bullet Changes**:
Current Experience:
Senior Developer at XYZ Inc | Mar 2018 - Dec 2019
• Built features using JavaScript
• Worked with team members
• Improved code quality

Suggestions:
1. Field: Senior Developer at XYZ Inc
   Change "Built features using JavaScript" to "Led development of real-time analytics dashboard using React and Node.js, reducing report generation time by 70%"
2. Field: Senior Developer at XYZ Inc
   Change "Worked with team members" to "Mentored 3 junior developers through code reviews and pair programming sessions"

Optimized Output:
Senior Developer at XYZ Inc | Mar 2018 - Dec 2019
• Led development of real-time analytics dashboard using React and Node.js, reducing report generation time by 70%
• Mentored 3 junior developers through code reviews and pair programming sessions
• Improved code quality

**Example 3 - Multiple Jobs**:
Current Experience:
Lead Engineer at Tech Solutions | 2021 - Present
• Managed engineering projects
• Deployed cloud infrastructure

Data Analyst at Data Corp | 2019 - 2021
• Analyzed customer data
• Created reports

Suggestions:
1. Field: Lead Engineer at Tech Solutions
   Change "Deployed cloud infrastructure" to "Architected AWS cloud infrastructure supporting 99.9% uptime for 1M+ users"
2. Field: Data Analyst at Data Corp
   Change "Analyzed customer data" to "Conducted data analysis on 10M+ customer records using Python and SQL, uncovering insights that increased retention by 15%"

Optimized Output:
Lead Engineer at Tech Solutions | 2021 - Present
• Managed engineering projects
• Architected AWS cloud infrastructure supporting 99.9% uptime for 1M+ users

Data Analyst at Data Corp | 2019 - 2021
• Conducted data analysis on 10M+ customer records using Python and SQL, uncovering insights that increased retention by 15%
• Created reports
==========================

**OUTPUT FORMAT REQUIREMENT**:

Return ONLY the optimized experience section following these rules:
- Maintain the structure: Job Title at Company | Dates
- Use bullet points (•) for each responsibility/achievement
- One bullet per line
- No preamble (DON'T say "Here is the optimized experience section:")
- No explanations, meta-commentary, or notes
- No markdown headers (like "## Experience")
- Preserve exact spacing and formatting from original

✓ VALID Output Example:
Senior Software Engineer at TechCorp | Jan 2020 - Present
• Architected microservices architecture handling 10M+ daily transactions using Node.js and Kubernetes
• Led team of 5 engineers delivering features 40% faster through Agile methodologies
• Reduced system latency by 60% through database optimization and caching strategies

Software Developer at StartupXYZ | Jun 2018 - Dec 2019
• Developed RESTful APIs serving mobile app with 100K+ users
• Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes

✗ INVALID Output Examples:
- "Here is the updated experience: Senior Software Engineer..." (has preamble - WRONG)
- "**Experience**\nSenior Software Engineer..." (has markdown header - WRONG)
- "• Architected microservices (updated per suggestion 1)" (has meta-commentary - WRONG)

==========================
**VERIFICATION CHECKLIST** (Review before returning):

Before finalizing your output, verify:
1. ✓ All ${
    acceptedSuggestions.length
  } suggestions have been incorporated into correct positions
2. ✓ All company names, job titles, and dates are preserved exactly
3. ✓ All bullets not mentioned in suggestions remain unchanged
4. ✓ Structure and formatting match the original (bullets, spacing, order)
5. ✓ No preambles, explanations, headers, or meta-commentary included

If any check fails, revise the output before returning.
==========================

Return the optimized experience section now:
`;
};

export const getOptimizedProjectsWithSuggestionsPrompt = (
  resumeText,
  currentProjects,
  acceptedSuggestions
) => {
  return `
You are a technical portfolio specialist focusing on project impact and technology showcasing.

==========================
**Full Resume**:
${resumeText}
==========================

==========================
**Current Projects Section**:
${currentProjects}
==========================

==========================
**Accepted Suggestions to Apply**:
${acceptedSuggestions
  .map(
    (s, i) =>
      `${i + 1}. Field: ${s.target.field}\n   ${s.preview}\n   Current: ${
        s.target.current
      }\n   Proposed: ${s.proposed}`
  )
  .join("\n\n")}
==========================

**PRIMARY TASK**:
Optimize the projects section by applying ALL the accepted suggestions above while showcasing technical depth and project impact.

**IMPORTANT RULES**:
1. Apply EVERY suggestion listed above (all ${
    acceptedSuggestions.length
  } suggestions)
2. Locate each project element using the "Field" reference (e.g., "E-commerce Platform")
3. Replace the exact "Current" content with the "Proposed" content
4. Preserve all project names and technology stacks EXACTLY as written
5. Keep all other content that is not mentioned in suggestions UNCHANGED
6. Maintain the overall structure: Project Name → Description/Bullets → Tech Stack
7. Ensure modified content highlights technical skills and measurable impact

==========================
**EXAMPLES**:

**Example 1 - Enhancing Project Description**:
Current Projects:
E-commerce Platform
• Built online shopping website
Tech: React, Node.js

Suggestions:
1. Field: E-commerce Platform
   Change "Built online shopping website" to "Developed full-stack e-commerce platform with real-time inventory tracking, processing 1,000+ daily transactions"

Optimized Output:
E-commerce Platform
• Developed full-stack e-commerce platform with real-time inventory tracking, processing 1,000+ daily transactions
Tech: React, Node.js

**Example 2 - Multiple Bullets in One Project**:
Current Projects:
Task Management App
• Created todo application
• Added user authentication
• Implemented database
Tech: Vue.js, Firebase

Suggestions:
1. Field: Task Management App
   Change "Created todo application" to "Built collaborative task management app with drag-and-drop interface supporting 500+ active users"
2. Field: Task Management App
   Change "Implemented database" to "Architected Firestore NoSQL database schema with real-time sync across devices"

Optimized Output:
Task Management App
• Built collaborative task management app with drag-and-drop interface supporting 500+ active users
• Added user authentication
• Architected Firestore NoSQL database schema with real-time sync across devices
Tech: Vue.js, Firebase

**Example 3 - Multiple Projects**:
Current Projects:
Weather Dashboard
• Displays weather data
Tech: React, OpenWeather API

Portfolio Website
• Personal website with projects
Tech: Next.js, Tailwind CSS

Suggestions:
1. Field: Weather Dashboard
   Change "Displays weather data" to "Built responsive weather dashboard with 7-day forecasts, hourly updates, and location-based alerts using OpenWeather API"
2. Field: Portfolio Website
   Change "Personal website with projects" to "Designed and deployed personal portfolio with 95+ Lighthouse score, featuring interactive project showcases and blog"

Optimized Output:
Weather Dashboard
• Built responsive weather dashboard with 7-day forecasts, hourly updates, and location-based alerts using OpenWeather API
Tech: React, OpenWeather API

Portfolio Website
• Designed and deployed personal portfolio with 95+ Lighthouse score, featuring interactive project showcases and blog
Tech: Next.js, Tailwind CSS
==========================

**OUTPUT FORMAT REQUIREMENT**:

Return ONLY the optimized projects section following these rules:
- Start each project with its name on a separate line
- Use bullet points (•) for project descriptions/achievements
- Include "Tech:" line for technology stack after bullets
- Maintain spacing between projects (blank line between each)
- No preamble (DON'T say "Here is the optimized projects section:")
- No explanations, meta-commentary, or notes
- No markdown headers (like "## Projects")
- Preserve exact formatting from original

✓ VALID Output Example:
E-commerce Platform
• Developed full-stack e-commerce platform with payment integration, serving 10,000+ monthly users
• Implemented cart functionality with real-time inventory updates and order tracking
Tech: React, Node.js, Stripe API, MongoDB

Weather Dashboard
• Built responsive weather app with geolocation, 7-day forecasts, and severe weather alerts
Tech: Vue.js, OpenWeather API, Chart.js

✗ INVALID Output Examples:
- "Here are the updated projects: E-commerce Platform..." (has preamble - WRONG)
- "**Projects**\nE-commerce Platform..." (has markdown header - WRONG)
- "• Developed platform (enhanced per suggestion 1)" (has meta-commentary - WRONG)
- Missing "Tech:" line (incomplete format - WRONG)

==========================
**VERIFICATION CHECKLIST** (Review before returning):

Before finalizing your output, verify:
1. ✓ All ${
    acceptedSuggestions.length
  } suggestions have been incorporated into correct projects
2. ✓ All project names and tech stacks are preserved exactly
3. ✓ All bullets/descriptions not mentioned in suggestions remain unchanged
4. ✓ Structure and formatting match the original (bullets, Tech: lines, spacing)
5. ✓ No preambles, explanations, headers, or meta-commentary included

If any check fails, revise the output before returning.
==========================

Return the optimized projects section now:
`;
};

export const getOptimizedAchievementsWithSuggestionsPrompt = (
  resumeText,
  currentAchievements,
  acceptedSuggestions
) => {
  return `
You are an accomplishments strategist specializing in quantifiable results and recognition.

==========================
**Full Resume**:
${resumeText}
==========================

==========================
**Current Achievements**:
${currentAchievements}
==========================

==========================
**Accepted Suggestions to Apply**:
${acceptedSuggestions
  .map(
    (s, i) =>
      `${i + 1}. ${s.preview}\n   Current: ${s.target.current}\n   Proposed: ${
        s.proposed
      }`
  )
  .join("\n\n")}
==========================

**PRIMARY TASK**:
Optimize the achievements section by applying ALL the accepted suggestions above while emphasizing quantifiable impact and recognition.

**IMPORTANT RULES**:
1. Apply EVERY suggestion listed above (all ${
    acceptedSuggestions.length
  } suggestions)
2. Replace the exact "Current" content with the "Proposed" content
3. Maintain bullet point format throughout
4. Keep all achievements not mentioned in suggestions UNCHANGED
5. Preserve the order of achievements unless suggestions specify otherwise
6. Ensure all achievements are specific, quantifiable, and impactful
7. Use strong action verbs and measurable metrics

==========================
**EXAMPLES**:

**Example 1 - Quantifying Achievement**:
Current Achievements:
• Won hackathon competition
• Improved team performance
• Received employee recognition

Suggestions:
1. Change "Won hackathon competition" to "Won 1st place at TechHacks 2023 among 50+ teams for AI-powered accessibility tool"

Optimized Output:
• Won 1st place at TechHacks 2023 among 50+ teams for AI-powered accessibility tool
• Improved team performance
• Received employee recognition

**Example 2 - Multiple Achievement Enhancements**:
Current Achievements:
• Published research paper
• Led community initiative
• Certified in cloud technologies

Suggestions:
1. Change "Published research paper" to "Co-authored peer-reviewed paper on machine learning optimization published in IEEE Conference Proceedings"
2. Change "Led community initiative" to "Founded coding bootcamp for underserved youth, training 100+ students with 85% job placement rate"

Optimized Output:
• Co-authored peer-reviewed paper on machine learning optimization published in IEEE Conference Proceedings
• Founded coding bootcamp for underserved youth, training 100+ students with 85% job placement rate
• Certified in cloud technologies

**Example 3 - Adding New Achievements**:
Current Achievements:
• Completed leadership training
• Contributed to open source

Suggestions:
1. Change "Completed leadership training" to "Graduated from Google Tech Lead Academy, selected as 1 of 30 participants from 500+ applicants"
2. Add new achievement: "Maintained open-source library with 2,000+ GitHub stars and 50+ contributors"

Optimized Output:
• Graduated from Google Tech Lead Academy, selected as 1 of 30 participants from 500+ applicants
• Contributed to open source
• Maintained open-source library with 2,000+ GitHub stars and 50+ contributors
==========================

**OUTPUT FORMAT REQUIREMENT**:

Return ONLY the optimized achievements section following these rules:
- Use bullet points (•) for each achievement
- One achievement per line
- No preamble (DON'T say "Here is the optimized achievements section:")
- No explanations, meta-commentary, or notes
- No markdown headers (like "## Achievements")
- No numbering (1., 2., 3.) - use bullets only
- Start directly with the first bullet point

✓ VALID Output Example:
• Won Google Code Jam Regional Finals, ranking top 5% among 10,000+ global participants
• Published technical blog with 50,000+ monthly readers covering cloud architecture and DevOps
• Earned AWS Solutions Architect Professional certification with 95% exam score
• Presented "Scaling Microservices" at KubeCon 2023 to audience of 500+ engineers

✗ INVALID Output Examples:
- "Here are the updated achievements: • Won..." (has preamble - WRONG)
- "**Achievements**\n• Won..." (has markdown header - WRONG)
- "• Won award (updated per suggestion 1)" (has meta-commentary - WRONG)
- "1. Won award\n2. Published blog" (uses numbering instead of bullets - WRONG)

==========================
**VERIFICATION CHECKLIST** (Review before returning):

Before finalizing your output, verify:
1. ✓ All ${
    acceptedSuggestions.length
  } suggestions have been incorporated correctly
2. ✓ All achievements not mentioned in suggestions are preserved unchanged
3. ✓ Each achievement uses bullet point (•) format
4. ✓ Achievements are specific and quantifiable where possible
5. ✓ No preambles, explanations, headers, or meta-commentary included

If any check fails, revise the output before returning.
==========================

Return the optimized achievements section now:
`;
};

export const getOptimizedEducationWithSuggestionsPrompt = (
  resumeText,
  currentEducation,
  acceptedSuggestions
) => {
  return `
You are an academic credentials formatter ensuring clarity and relevance.

==========================
**Full Resume**:
${resumeText}
==========================

==========================
**Current Education**:
${currentEducation}
==========================

==========================
**Accepted Suggestions to Apply**:
${acceptedSuggestions
  .map(
    (s, i) =>
      `${i + 1}. ${s.preview}\n   Current: ${s.target.current}\n   Proposed: ${
        s.proposed
      }`
  )
  .join("\n\n")}
==========================

**PRIMARY TASK**:
Optimize the education section by applying ALL the accepted suggestions above while maintaining clarity and professional formatting.

**IMPORTANT RULES**:
1. Apply EVERY suggestion listed above (all ${
    acceptedSuggestions.length
  } suggestions)
2. If "Current Education" is empty, "N/A", or "None": CREATE a new education section using ONLY the proposed content from suggestions
3. If "Current Education" exists: Replace the exact "Current" content with the "Proposed" content
4. Preserve degree names, universities, and graduation dates EXACTLY as written (unless explicitly modified by suggestion)
5. Keep all education entries not mentioned in suggestions UNCHANGED
6. Maintain clear, scannable structure
7. Add relevant coursework, honors, or GPA only if suggested
8. Keep format professional and ATS-friendly

==========================
**EXAMPLES**:

**Example 1 - Adding Details to Degree**:
Current Education:
Bachelor of Science in Computer Science
State University | 2020

Suggestions:
1. Add "GPA: 3.8/4.0" after "State University | 2020"

Optimized Output:
Bachelor of Science in Computer Science
State University | 2020 | GPA: 3.8/4.0

**Example 2 - Adding Coursework and Honors**:
Current Education:
Master of Science in Data Science
Tech Institute | 2022

Suggestions:
1. Add "Relevant Coursework: Machine Learning, Deep Learning, Statistical Analysis" after degree info
2. Add "Graduated with Honors" after "Tech Institute | 2022"

Optimized Output:
Master of Science in Data Science
Tech Institute | 2022 | Graduated with Honors
Relevant Coursework: Machine Learning, Deep Learning, Statistical Analysis

**Example 3 - Multiple Degrees with Enhancements**:
Current Education:
Bachelor of Arts in Economics
City College | 2018

Associate Degree in Business
Community College | 2016

Suggestions:
1. Add "Magna Cum Laude" after "City College | 2018"
2. Add "Dean's List all semesters" after "Community College | 2016"

Optimized Output:
Bachelor of Arts in Economics
City College | 2018 | Magna Cum Laude

Associate Degree in Business
Community College | 2016 | Dean's List all semesters

**Example 4 - Creating Education Section from Scratch (NO CURRENT EDUCATION)**:
Current Education:
N/A

Suggestions:
1. Add new education: "Bachelor of Science in Computer Science - Stanford University | 2021 | GPA: 3.8/4.0"

Optimized Output:
Bachelor of Science in Computer Science
Stanford University | 2021 | GPA: 3.8/4.0

**Example 5 - Creating Multiple Education Entries from Empty Resume**:
Current Education:
None

Suggestions:
1. Add "Bachelor of Engineering in Software Engineering - MIT | 2020"
2. Add "Relevant Coursework: Algorithms, Data Structures, Machine Learning, Cloud Computing"

Optimized Output:
Bachelor of Engineering in Software Engineering
MIT | 2020
Relevant Coursework: Algorithms, Data Structures, Machine Learning, Cloud Computing
==========================

**OUTPUT FORMAT REQUIREMENT**:

Return ONLY the optimized education section following these rules:
- Start each degree on its own line
- Follow with: Institution | Graduation Year | Optional honors/GPA
- Add coursework, activities, or details on subsequent lines if applicable
- Maintain spacing between different degrees (blank line between entries)
- No preamble (DON'T say "Here is the optimized education section:")
- No explanations, meta-commentary, or notes
- No markdown headers (like "## Education")
- Start directly with the first degree

✓ VALID Output Example:
Bachelor of Science in Computer Science
Massachusetts Institute of Technology | 2021 | GPA: 3.9/4.0
Relevant Coursework: Algorithms, Operating Systems, Distributed Systems
Honors: Dean's List (4 semesters), Presidential Scholar

Master of Business Administration
Harvard Business School | 2023
Concentration: Technology and Operations Management

✗ INVALID Output Examples:
- "Here is the updated education: Bachelor of Science..." (has preamble - WRONG)
- "**Education**\nBachelor of Science..." (has markdown header - WRONG)
- "Bachelor of Science (added GPA per suggestion 1)" (has meta-commentary - WRONG)
- Missing spacing between degrees (formatting issue - WRONG)

==========================
**VERIFICATION CHECKLIST** (Review before returning):

Before finalizing your output, verify:
1. ✓ All ${
    acceptedSuggestions.length
  } suggestions have been incorporated correctly
2. ✓ All degree names, universities, and dates are preserved exactly (unless modified by suggestion)
3. ✓ All education entries not mentioned in suggestions remain unchanged
4. ✓ Format is clear, professional, and ATS-friendly
5. ✓ No preambles, explanations, headers, or meta-commentary included

If any check fails, revise the output before returning.
==========================

Return the optimized education section now:
`;
};

export const getOptimizedCertificationsWithSuggestionsPrompt = (
  resumeText,
  currentCertifications,
  acceptedSuggestions
) => {
  return `
You are a professional credentials specialist organizing certifications for maximum impact.

==========================
**Full Resume**:
${resumeText}
==========================

==========================
**Current Certifications**:
${currentCertifications}
==========================

==========================
**Accepted Suggestions to Apply**:
${acceptedSuggestions
  .map(
    (s, i) =>
      `${i + 1}. ${s.preview}\n   Current: ${s.target.current}\n   Proposed: ${
        s.proposed
      }`
  )
  .join("\n\n")}
==========================

**PRIMARY TASK**:
Optimize the certifications section by applying ALL the accepted suggestions above while maintaining professional formatting and clear organization.

**IMPORTANT RULES**:
1. Apply EVERY suggestion listed above (all ${
    acceptedSuggestions.length
  } suggestions)
2. Replace the exact "Current" content with the "Proposed" content
3. Keep all certifications not mentioned in suggestions UNCHANGED
4. Include certification name, issuing organization, and year for each entry
5. Maintain consistent format across all certifications
6. List certifications in reverse chronological order (newest first) unless suggestions specify otherwise
7. Keep format professional and scannable

==========================
**EXAMPLES**:

**Example 1 - Adding New Certification**:
Current Certifications:
• AWS Certified Solutions Architect - Amazon Web Services, 2022

Suggestions:
1. Add new certification: "Certified Kubernetes Administrator (CKA) - Cloud Native Computing Foundation, 2023"

Optimized Output:
• Certified Kubernetes Administrator (CKA) - Cloud Native Computing Foundation, 2023
• AWS Certified Solutions Architect - Amazon Web Services, 2022

**Example 2 - Enhancing Certification Details**:
Current Certifications:
• Google Cloud Professional - 2021
• PMP Certified - 2020

Suggestions:
1. Change "Google Cloud Professional - 2021" to "Google Cloud Professional Cloud Architect - Google Cloud, 2021"
2. Change "PMP Certified - 2020" to "Project Management Professional (PMP) - Project Management Institute, 2020"

Optimized Output:
• Google Cloud Professional Cloud Architect - Google Cloud, 2021
• Project Management Professional (PMP) - Project Management Institute, 2020

**Example 3 - Multiple Changes**:
Current Certifications:
• CompTIA Security+ - 2019
• Scrum Master Certified - 2020

Suggestions:
1. Add "Certified Information Systems Security Professional (CISSP) - ISC², 2023"
2. Change "Scrum Master Certified - 2020" to "Certified ScrumMaster (CSM) - Scrum Alliance, 2020"
3. Add expiration date to Security+: "CompTIA Security+ - CompTIA, 2019 (Valid through 2025)"

Optimized Output:
• Certified Information Systems Security Professional (CISSP) - ISC², 2023
• Certified ScrumMaster (CSM) - Scrum Alliance, 2020
• CompTIA Security+ - CompTIA, 2019 (Valid through 2025)
==========================
**OUTPUT FORMAT REQUIREMENT**:

Return ONLY the optimized certifications section following these rules:
- Preserve the EXACT format and structure from the current certifications section
- If certifications have detailed bullet points underneath, keep them unchanged
- If certifications have descriptions, keep them unchanged
- Only modify what the suggestions explicitly tell you to change
- Maintain consistent formatting style throughout
- List in reverse chronological order (newest first) unless current format differs
- No preamble (DON'T say "Here is the optimized certifications section:")
- No explanations, meta-commentary, or notes
- No markdown headers (like "## Certifications" or "# CERTIFICATIONS")
- Start directly with the first certification entry

✓ VALID Output Example (Simple Format):
• AWS Certified Solutions Architect Professional - Amazon Web Services, 2023
• Certified Kubernetes Administrator (CKA) - Cloud Native Computing Foundation, 2022
• Google Cloud Professional Data Engineer - Google Cloud, 2021

✓ VALID Output Example (Detailed Format with Sub-bullets):
AWS Certified Cloud Practitioner (2024)
• Demonstrated comprehensive understanding of AWS cloud infrastructure, security, and cost management principles
• Mastered key AWS services including EC2, S3, RDS, DynamoDB, ECS/ECR, IAM, CloudWatch, and serverless technologies
• Applied knowledge of cloud architecture best practices, deployment strategies, and infrastructure automation

Google Cloud Professional Cloud Architect - Google Cloud, 2023
• Designed and deployed scalable cloud solutions on GCP
• Implemented security and compliance measures for enterprise applications

✗ INVALID Output Examples:
- "Here are the updated certifications: • AWS..." (has preamble - WRONG)
- "**Certifications**\n• AWS..." (has markdown header - WRONG)
- "• AWS Certified (added per suggestion 1)" (has meta-commentary - WRONG)
- Changing bullet point details when suggestions only ask to change the title (over-modifying - WRONG)
==========================
**VERIFICATION CHECKLIST** (Review before returning):

Before finalizing your output, verify:
1. ✓ All ${
    acceptedSuggestions.length
  } suggestions have been incorporated correctly
2. ✓ All certifications not mentioned in suggestions are preserved unchanged
3. ✓ Each certification includes: Name - Issuing Organization, Year
4. ✓ Certifications are listed in reverse chronological order (newest first)
5. ✓ Format is consistent across all certifications
6. ✓ No preambles, explanations, headers, or meta-commentary included

If any check fails, revise the output before returning.
==========================

Return the optimized certifications section now:
`;
};
