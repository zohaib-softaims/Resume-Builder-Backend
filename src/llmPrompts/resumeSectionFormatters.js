// Individual formatting prompts for each section

export const formatPersonalInfoPrompt = (originalResumeText) => {
  return `
You are a resume data extraction expert. Extract personal information from the resume text below and format it as JSON.

**Resume Text**:
${originalResumeText}

**Task**: Extract personal information including:
- Name (full name)
- Email address
- Phone number
- Location (city, state/country)
- LinkedIn profile URL
- Portfolio/Website URL

**Instructions**:
- Look for contact information at the top of the resume
- Use exact information found in the text
- If not found, use placeholder "Your Name", "your@email.com", etc.
- Return ONLY JSON, no additional text

**Required JSON Format**:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1 (555) 123-4567",
  "location": "City, State",
  "linkedin": "linkedin.com/in/username",
  "portfolio": "https://portfolio.com"
}
`;
};

export const personalInfoSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    email: { type: "string" },
    phone: { type: "string" },
    location: { type: "string" },
    linkedin: { type: "string" },
    portfolio: { type: "string" },
  },
  required: ["name", "email", "phone", "location", "linkedin", "portfolio"],
  additionalProperties: false,
};

export const formatSummaryPrompt = (optimizedSummary) => {
  return `
You are a resume formatter. Return the following optimized professional summary as-is.

**Optimized Summary**:
${optimizedSummary}

**Task**: Return the summary exactly as provided, without any modifications.

**Instructions**:
- Do not change, shorten, or reformat the content
- Return it exactly as provided in the optimized summary above

Return ONLY the summary text, no JSON wrapper, no additional comments.
`;
};

export const formatSkillsPrompt = (optimizedSkills) => {
  return `
You are a resume formatter. The following is an optimized skills section. Parse and organize the skills into categories.

**Optimized Skills**:
${optimizedSkills}

**Task**: Extract all skills and organize them into an array of categories.

**Instructions**:
- Parse the text to find ALL skills mentioned
- YOU MUST INCLUDE EVERY SKILL from the optimized skills text
- Group skills under meaningful categories (e.g., Programming, Frameworks, Tools, Cloud, Soft Skills)
- Return as structured JSON

**CRITICAL**: Do not remove any skills. Include everything from the optimized text.

**Required JSON Format**:
{
  "skills": [
    { "category": "Programming", "items": ["JavaScript", "TypeScript"] },
    { "category": "Frameworks", "items": ["React", "Next.js", "Express"] },
    { "category": "Soft Skills", "items": ["Leadership", "Communication"] }
  ]
}

Return ONLY the JSON object, no additional text or markdown.
`;
};

export const skillsSchema = {
  type: "object",
  properties: {
    skills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: { type: "string" },
          items: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["category", "items"],
        additionalProperties: false,
      },
    },
  },
  required: ["skills"],
  additionalProperties: false,
};

export const formatExperiencePrompt = (optimizedExperience) => {
  return `
You are a resume formatter. The following is an optimized experience section. Parse and structure each job experience.

**Optimized Experience**:
${optimizedExperience}

**Task**: Extract each job experience and structure it with company, position, location, years, and description_points.

**Instructions**:
- Parse each job entry from the text
- YOU MUST INCLUDE ALL jobs/positions from the optimized experience
- Extract company name, job title/position
- Extract location if mentioned
- Extract a single years string formatted as "StartDate–EndDate" (example: "Jan 2020–Present")
- Extract ALL responsibilities/achievements as separate strings in description_points
- Each responsibility should be a separate string in the array
- Return as array of experience objects

**CRITICAL**: Do not remove any jobs or responsibilities. Include everything from the optimized text.

**Required JSON Format**:
{
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "location": "City, State",
      "years": "Jan 2020–Present",
      "description_points": [
        "Achievement bullet point 1",
        "Achievement bullet point 2"
      ]
    }
  ]
}

Return ONLY the JSON object, no additional text or markdown.
`;
};

export const experienceSchema = {
  type: "object",
  properties: {
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          company: { type: "string" },
          position: { type: "string" },
          location: { type: "string" },
          years: { type: "string" },
          description_points: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["company", "position", "location", "years", "description_points"],
        additionalProperties: false,
      },
    },
  },
  required: ["experience"],
  additionalProperties: false,
};

export const formatProjectsPrompt = (optimizedProjects) => {
  return `
You are a resume formatter. The following is an optimized projects section. Parse and structure each project.

**Optimized Projects**:
${optimizedProjects}

**Task**: Extract each project and structure it with title, tech_stack, link, and description_points.

**Instructions**:
- Parse each project from the text
- YOU MUST INCLUDE ALL projects from the optimized projects
- Extract project title
- Extract tech_stack (as array of strings)
- Extract link if provided; if not present, output an empty string
- Extract ALL description_points as separate strings in the array
- Return as array of project objects

**CRITICAL**: Do not remove any projects or achievements. Include everything from the optimized text.

**Required JSON Format**:
{
  "projects": [
    {
      "title": "Project Name",
      "description_points": [
        "Achievement 1 with metrics",
        "Achievement 2 with impact"
      ],
      "tech_stack": ["React", "Node.js"],
      "link": "https://example.com"
    }
  ]
}

Return ONLY the JSON object, no additional text or markdown.
`;
};

export const projectsSchema = {
  type: "object",
  properties: {
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          description_points: {
            type: "array",
            items: { type: "string" },
          },
          tech_stack: {
            type: "array",
            items: { type: "string" },
          },
          link: { type: "string" },
        },
        required: ["title", "description_points", "tech_stack", "link"],
        additionalProperties: false,
      },
    },
  },
  required: ["projects"],
  additionalProperties: false,
};

export const formatEducationPrompt = (originalResumeText) => {
  return `
You are a resume data extraction expert. Extract education information from the resume text below.

**Resume Text**:
${originalResumeText}

**Task**: Extract education details including degree, institution, location, and years.

**Instructions**:
- Look for education section in the resume
- YOU MUST INCLUDE ALL education entries from the resume
- Extract degree and institution name
- Extract location if mentioned
- Extract a single years string formatted as "StartDate–EndDate" (example: "2016–2020" or "May 2020")
- Return as array of education objects

**CRITICAL**: Do not remove any education entries. Include everything from the resume text.

**Required JSON Format**:
{
  "education": [
    {
      "degree": "Bachelor of Science in Computer Science",
      "institution": "University Name",
      "location": "City, State",
      "years": "2016–2020"
    }
  ]
}

If no education found, return { "education": [] }.

Return ONLY the JSON object, no additional text or markdown.
`;
};

export const educationSchema = {
  type: "object",
  properties: {
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          degree: { type: "string" },
          institution: { type: "string" },
          location: { type: "string" },
          years: { type: "string" },
        },
        required: ["degree", "institution", "location", "years"],
        additionalProperties: false,
      },
    },
  },
  required: ["education"],
  additionalProperties: false,
};
