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

**Task**: Extract all skills and organize them into technical_skills, soft_skills, and certifications.

**Instructions**:
- Parse the text to find ALL skills mentioned
- YOU MUST INCLUDE EVERY SKILL from the optimized skills text
- Categorize technical skills (programming languages, frameworks, tools, technologies)
- Categorize soft skills (communication, leadership, teamwork, etc.)
- Extract certifications if mentioned
- Return as structured JSON

**CRITICAL**: Do not remove any skills. Include everything from the optimized text.

**Required JSON Format**:
{
  "technical_skills": ["JavaScript", "React", "Node.js"],
  "soft_skills": ["Leadership", "Communication"],
  "certifications": ["AWS Certified", "Google Cloud"]
}

Return ONLY the JSON object, no additional text or markdown.
`;
};

export const skillsSchema = {
  type: "object",
  properties: {
    technical_skills: {
      type: "array",
      items: { type: "string" },
    },
    soft_skills: {
      type: "array",
      items: { type: "string" },
    },
    certifications: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["technical_skills", "soft_skills", "certifications"],
  additionalProperties: false,
};

export const formatExperiencePrompt = (optimizedExperience) => {
  return `
You are a resume formatter. The following is an optimized experience section. Parse and structure each job experience.

**Optimized Experience**:
${optimizedExperience}

**Task**: Extract each job experience and structure it with company, position, location, dates, and responsibilities.

**Instructions**:
- Parse each job entry from the text
- YOU MUST INCLUDE ALL jobs/positions from the optimized experience
- Extract company name, job title/position
- Extract location if mentioned
- Extract start and end dates (format as "MMM YYYY" like "Jan 2020", "Present")
- Extract ALL responsibilities/achievements as separate strings in the array
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
      "start_date": "Jan 2020",
      "end_date": "Present",
      "responsibilities": [
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
          start_date: { type: "string" },
          end_date: { type: "string" },
          responsibilities: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["company", "position", "location", "start_date", "end_date", "responsibilities"],
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

**Task**: Extract each project and structure it with name, technologies, description, and achievements.

**Instructions**:
- Parse each project from the text
- YOU MUST INCLUDE ALL projects from the optimized projects
- Extract project name
- Extract technologies used (as array)
- Extract brief description
- Extract ALL achievements/features as separate strings in the array
- Each achievement should be a separate string in the array
- Return as array of project objects

**CRITICAL**: Do not remove any projects or achievements. Include everything from the optimized text.

**Required JSON Format**:
{
  "projects": [
    {
      "name": "Project Name",
      "technologies": ["React", "Node.js"],
      "description": "Brief project description",
      "achievements": [
        "Achievement 1 with metrics",
        "Achievement 2 with impact"
      ]
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
          name: { type: "string" },
          technologies: {
            type: "array",
            items: { type: "string" },
          },
          description: { type: "string" },
          achievements: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["name", "technologies", "description", "achievements"],
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

**Task**: Extract education details including institution, degree, location, graduation date, and coursework.

**Instructions**:
- Look for education section in the resume
- YOU MUST INCLUDE ALL education entries from the resume
- Extract institution name, degree earned
- Extract location if mentioned
- Extract graduation date (format as "MMM YYYY" or "Year")
- Extract ALL relevant coursework if mentioned
- Return as array of education objects

**CRITICAL**: Do not remove any education entries. Include everything from the resume text.

**Required JSON Format**:
{
  "education": [
    {
      "institution": "University Name",
      "degree": "Bachelor of Science in Computer Science",
      "location": "City, State",
      "graduation_date": "May 2020",
      "relevant_coursework": ["Data Structures", "Algorithms"]
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
          institution: { type: "string" },
          degree: { type: "string" },
          location: { type: "string" },
          graduation_date: { type: "string" },
          relevant_coursework: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["institution", "degree", "location", "graduation_date", "relevant_coursework"],
        additionalProperties: false,
      },
    },
  },
  required: ["education"],
  additionalProperties: false,
};
