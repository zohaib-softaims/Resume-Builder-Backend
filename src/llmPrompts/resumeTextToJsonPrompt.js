export const resumeTextToJsonPrompt = (resumeText) => {
  return `You are an expert resume parser. Your task is to extract structured information from the provided resume text and convert it into a well-organized JSON format.

**IMPORTANT RULES:**
1. Only include fields that have actual data in the resume
2. If a field is empty or not present in the resume, DO NOT include it in the JSON output
3. Return valid JSON only, no additional text or explanations
4. Maintain professional formatting and accuracy
5. Extract all relevant information without omitting important details

**Resume Text:**
${resumeText}

**Extract and structure the following information:**

1. **Personal Information:**
   - name: Full name
   - email: Email address
   - phone: Phone number
   - linkedin: LinkedIn profile URL
   - location: City, State/Country

2. **Summary:**
   - summary: Professional summary or objective statement

3. **Skills:**
   - skills: Array of skill objects, each with:
     - category: Skill category (e.g., "Frontend", "Backend", "Cloud", "Languages")
     - items: Array of skill names in that category

4. **Experience:**
   - experience: Array of work experience objects, each with:
     - company: Company name
     - position: Job title
     - location: Work location
     - years: Employment period (e.g., "Jan 2020 – Present", "2018 – 2020")
     - description_points: Array of bullet points describing responsibilities/achievements

5. **Education:**
   - education: Array of education objects, each with:
     - degree: Degree name (e.g., "Bachelor of Science in Computer Science")
     - institution: School/University name
     - location: School location
     - years: Graduation year or period (e.g., "2020", "2016 – 2020")

6. **Certifications:**
   - certifications: Array of certification objects, each with:
     - name: Certification name
     - issuer: Issuing organization
     - year: Year obtained
     - description_points: Array of relevant details (if any)

7. **Projects:**
   - projects: Array of project objects, each with:
     - title: Project name
     - description_points: Array of bullet points describing the project
     - tech_stack: Array of technologies used
     - link: Project URL or GitHub link (empty string if not available)

8. **Achievements:**
   - achievements: Array of achievement objects, each with:
     - heading: Achievement category or title
     - description_points: Array of achievement descriptions

9. **Awards:**
   - awards: Array of award objects, each with:
     - title: Award name
     - issuer: Organization that gave the award
     - year: Year received
     - description_points: Array of relevant details (if any)

10. **Interests:**
    - interests: Array of strings (hobbies, professional interests)

**Output Format:**
Return a valid JSON object with ONLY the fields that have data. Do not include empty arrays or null values.

Example structure (include only populated fields):
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1 (555) 123-4567",
  "linkedin": "https://linkedin.com/in/johndoe",
  "location": "San Francisco, CA",
  "summary": "Experienced software engineer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud infrastructure. Proven track record of delivering scalable applications and leading cross-functional teams.",
  "skills": [
    {
      "category": "Frontend",
      "items": ["React", "TypeScript", "Next.js", "Tailwind CSS", "Redux"]
    },
    {
      "category": "Backend",
      "items": ["Node.js", "Express", "Python", "Django", "PostgreSQL"]
    },
    {
      "category": "Cloud & DevOps",
      "items": ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"]
    }
  ],
  "experience": [
    {
      "company": "Tech Corp",
      "position": "Senior Software Engineer",
      "location": "San Francisco, CA",
      "years": "Jan 2020 – Present",
      "description_points": [
        "Led development of customer-facing web applications serving 1M+ users",
        "Improved application performance by 40% through code optimization and caching strategies",
        "Mentored team of 5 junior engineers and conducted code reviews",
        "Implemented microservices architecture reducing deployment time by 60%"
      ]
    },
    {
      "company": "Startup Inc",
      "position": "Full Stack Developer",
      "location": "Austin, TX",
      "years": "Jun 2018 – Dec 2019",
      "description_points": [
        "Built RESTful APIs and frontend interfaces for SaaS platform",
        "Integrated third-party payment systems (Stripe, PayPal)",
        "Reduced server costs by 30% through AWS optimization"
      ]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science in Computer Science",
      "institution": "University of California, Berkeley",
      "location": "Berkeley, CA",
      "years": "2014 – 2018"
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified Solutions Architect – Associate",
      "issuer": "Amazon Web Services",
      "year": "2021",
      "description_points": [
        "Validated expertise in designing distributed systems on AWS"
      ]
    },
    {
      "name": "MongoDB Certified Developer",
      "issuer": "MongoDB University",
      "year": "2020"
    }
  ],
  "projects": [
    {
      "title": "E-Commerce Platform",
      "description_points": [
        "Built full-stack e-commerce application with shopping cart and payment integration",
        "Implemented real-time inventory management system",
        "Achieved 99.9% uptime with load balancing and auto-scaling"
      ],
      "tech_stack": ["React", "Node.js", "MongoDB", "Redis", "AWS"],
      "link": "https://github.com/johndoe/ecommerce-platform"
    },
    {
      "title": "Task Management Dashboard",
      "description_points": [
        "Developed collaborative task management tool with real-time updates",
        "Integrated Slack notifications and calendar sync"
      ],
      "tech_stack": ["Next.js", "PostgreSQL", "GraphQL", "WebSockets"],
      "link": ""
    }
  ],
  "achievements": [
    {
      "heading": "Performance Optimization",
      "description_points": [
        "Reduced page load time from 5s to 1.2s through lazy loading and code splitting",
        "Optimized database queries resulting in 70% faster response times"
      ]
    },
    {
      "heading": "Leadership",
      "description_points": [
        "Led migration of monolithic application to microservices architecture",
        "Established coding standards and best practices for 20-person engineering team"
      ]
    }
  ],
  "awards": [
    {
      "title": "Employee of the Year",
      "issuer": "Tech Corp",
      "year": "2022",
      "description_points": [
        "Recognized for outstanding contributions to product development and team leadership"
      ]
    },
    {
      "title": "Best Capstone Project",
      "issuer": "UC Berkeley Computer Science Department",
      "year": "2018"
    }
  ],
  "interests": ["Open Source Contribution", "Machine Learning", "Technical Writing", "Hiking"]
}

Now parse the resume and return the structured JSON:`;
};

export const resumeTextToJsonSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    email: { type: "string" },
    phone: { type: "string" },
    linkedin: { type: "string" },
    location: { type: "string" },
    summary: { type: "string" },
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
    certifications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          issuer: { type: "string" },
          year: { type: "string" },
          description_points: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["name", "issuer", "year", "description_points"],
        additionalProperties: false,
      },
    },
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
    achievements: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: { type: "string" },
          description_points: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["heading", "description_points"],
        additionalProperties: false,
      },
    },
    awards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          issuer: { type: "string" },
          year: { type: "string" },
          description_points: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["title", "issuer", "year", "description_points"],
        additionalProperties: false,
      },
    },
    interests: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "name",
    "email",
    "phone",
    "linkedin",
    "location",
    "summary",
    "skills",
    "experience",
    "education",
    "certifications",
    "projects",
    "achievements",
    "awards",
    "interests"
  ],
  additionalProperties: false,
};
