# Resume Builder Backend - Project Guidelines

**Last Updated**: 2025-01-04

> This file guides AI assistants (Claude) in understanding project conventions, coding standards, and architectural patterns for the Resume Builder backend.

## Tech Stack
- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js
- **Database**: PostgreSQL/MySQL (via services)
- **AI/LLM**: OpenAI GPT models
- **Web Scraping**: Puppeteer
- **PDF Generation**: Custom PDF generator
- **Cloud Storage**: AWS S3
- **Logging**: Winston logger

## Project Structure
```
src/
├── config/          # Configuration files (headers, constants)
├── controllers/     # Route controllers (job, resume, webhook)
├── services/        # Business logic services
├── utils/           # Utility functions and helpers
├── lib/             # Core libraries (LLM config, logger)
├── llmPrompts/      # AI prompt templates
└── index.js         # Application entry point

scripts/             # Test and utility scripts
```

## Key Commands
- **IMPORTANT**: DO NOT run any commands without explicit user permission
- Development: `npm run dev`
- Production: `npm start`
- Testing: Scripts in `/scripts/` directory

## Project Conventions

### Code Style & Principles

#### Core Design Principles

**KISS (Keep It Simple, Stupid)**
- Favor simplicity over cleverness
- Write code that's easy to understand and maintain
- Avoid unnecessary complexity and over-engineering
- If a simple solution works, don't make it complex

**DRY (Don't Repeat Yourself)**
- Every piece of knowledge must have a single, unambiguous representation
- Extract common logic into reusable functions
- Use utilities and helpers to avoid code duplication
- If you copy-paste code more than once, refactor it

**YAGNI (You Aren't Gonna Need It)**
- Don't add functionality until it's actually needed
- Focus on current requirements, not hypothetical future needs
- Remove unused code and dead imports

**Composition Over Inheritance**
- Use functional composition instead of class hierarchies
- Prefer small, composable functions over large monolithic ones
- Example: `pipe(fetchData, parseData, validateData)`

#### No Classes
- **DO NOT** use ES6 classes in this project
- Use functional programming patterns with pure functions
- Export named functions instead of class methods
- Example:
  ```javascript
  // ❌ Don't do this
  class UserService {
    async getUser(id) { ... }
  }

  // ✅ Do this
  export const getUser = async (id) => { ... };
  ```

#### Naming Conventions
- **Service Files**: Use descriptive names that indicate both the purpose and method
  - Format: `{purpose}{Method}.service.js`
  - Examples: `jobApiClient.service.js`, `jobWebScraper.service.js`
  - Both parts should clearly describe what the service does

- **Function Names**: Use descriptive verb-noun combinations
  - Format: `{verb}{Noun}From{Source}`
  - Examples: `fetchJobFromLinkedInApi()`, `scrapeJobFromWeb()`
  - Be specific about what the function does and where data comes from

- **Utility Files**: Use clear, descriptive names
  - Format: `{purpose}Utils.js`
  - Examples: `jobUtils.js`, `authUtils.js`

- **Variables**: Use camelCase and descriptive names
  - Examples: `jobDescription`, `resumeText`, `gapAnalysis`

#### File Organization
- **Config files**: Store in `/src/config/`
- **Services**: Store in `/src/services/`
- **Utils**: Store in `/src/utils/`
- **Controllers**: Store in `/src/controllers/`
- **Test scripts**: Store in `/scripts/`

### Development Workflow

#### Code Changes
- Prefer editing existing files over creating new ones
- Remove redundant code and comments
- Use modern ES6+ features (async/await, arrow functions, destructuring, optional chaining)
- Keep code clean and concise

### Bash Commands
**CRITICAL**: DO NOT run bash commands unless explicitly asked by the user

Never run without permission:
- `npm install` / `npm start` / `npm test` / `npm run dev`
- **NEVER START THE SERVER** - The server runs on port 9000 and should only be started by the user
- Database migrations or seeds
- Any deployment commands
- Git push operations
- File system operations (mkdir, rm, mv)

### Module System
- This project uses **ES6 modules** (`type: "module"` in package.json)
- Always use `import` and `export`, never `require` or `module.exports`
- Example:
  ```javascript
  // ✅ Correct
  import { something } from './module.js';
  export const myFunction = () => { ... };

  // ❌ Wrong
  const something = require('./module');
  module.exports = { myFunction };
  ```

### Error Handling

**Fail Fast with Context**
- Validate inputs at the start of functions
- Throw errors immediately when something is wrong
- Include descriptive error messages with context
- Example: `throw new Error('Failed to fetch job ${jobId}: ${error.message}')`

**Never Silently Fail**
- Always log errors with `logger.error()`
- Never use empty catch blocks
- Return meaningful error responses to users

**Handle Errors at the Right Level**
- Controllers: Catch errors and return HTTP responses
- Services: Let errors bubble up, add context if needed
- Utilities: Throw descriptive errors for invalid inputs

**Implementation**
- Use `catchAsync` wrapper for async controller functions
- Return appropriate HTTP status codes (400, 404, 500)
- Include error context: `{ job_id, resume_id, error: error.message }`

### Logging
- Use the `logger` utility from `/src/lib/logger.js`
- Log levels: `logger.debug()`, `logger.info()`, `logger.error()`
- Include relevant context (job_id, resume_id, etc.) in logs

### API Design
- RESTful endpoints
- Consistent response format:
  ```javascript
  {
    success: boolean,
    message: string,
    data: object | null,
    error: string | null
  }
  ```

## Best Practices

### Service Layer Architecture

**Single Responsibility Principle**
- Each service file has ONE clear purpose
- Service functions should be focused and composable
- Don't mix concerns (e.g., don't do database + API calls in same function)
- Example: `jobApiClient.service.js` only handles LinkedIn API calls

**Pure Functions When Possible**
- Services should be pure functions (same input = same output)
- Minimize side effects
- Make dependencies explicit (pass them as parameters)
- Easier to test and reason about

**Dependency Injection**
- Pass dependencies as function parameters
- Don't hard-code dependencies inside functions
- Example:
  ```javascript
  // ✅ Good - explicit dependency
  export const processJob = async (jobId, apiClient) => {
    return await apiClient.fetch(jobId);
  };

  // ❌ Bad - hidden dependency
  export const processJob = async (jobId) => {
    return await someGlobalClient.fetch(jobId);
  };
  ```

### Async Operations & Performance

**Parallel Processing**
- Use `Promise.all()` for independent async operations
- Never await in loops if operations can run in parallel
- Example:
  ```javascript
  // ✅ Good - parallel execution
  const [summary, skills, experience] = await Promise.all([
    generateSummary(resume),
    generateSkills(resume),
    generateExperience(resume),
  ]);

  // ❌ Bad - sequential execution
  const summary = await generateSummary(resume);
  const skills = await generateSkills(resume);
  const experience = await generateExperience(resume);
  ```

**Error Handling in Parallel Operations**
- Use `Promise.allSettled()` when some failures are acceptable
- Handle individual promise rejections appropriately
- Always include timeout mechanisms for external API calls

### Code Quality Standards

**Clean Code Requirements**
- No unused variables, imports, or dead code
- No redundant comments (code should be self-explanatory)
- No commented-out code (use git history instead)
- Use descriptive variable names (avoid abbreviations)
- Keep functions small and focused (single responsibility)

**Modern JavaScript Patterns**
- Use optional chaining: `user?.profile?.email`
- Use nullish coalescing: `value ?? defaultValue`
- Use array methods: `map`, `filter`, `reduce` over loops
- Use destructuring: `const { jobId, resumeId } = req.body`
- Use template literals: `` `Job ${jobId} processed` ``
- Use async/await over Promise chains

**Function Best Practices**
- Functions should do ONE thing well
- Maximum 50 lines per function (prefer smaller)
- Maximum 3-4 parameters (use object destructuring for more)
- Return early to reduce nesting
- Extract complex conditions into named functions

**Code Review Checklist**
Before submitting code, verify:
- [ ] All linting and formatting checks pass
- [ ] No console.logs (use logger instead)
- [ ] Error handling is comprehensive
- [ ] Function and variable names are descriptive
- [ ] No code duplication
- [ ] Comments explain "why", not "what"

## Workflow Guidelines

### Response Format
- Be concise and direct
- Use code blocks with language identifiers
- Reference specific files with paths: `src/services/jobApiClient.service.js:36`
- Show before/after for significant changes

### Error Handling
- All controllers wrapped with `catchAsync()`
- Return proper HTTP status codes (200, 400, 404, 500)
- Include descriptive error messages
- Log errors with context using `logger.error()`

### Testing
- Test scripts in `/scripts/` directory
- Manual testing preferred over automated tests
- Always verify changes don't break existing functionality


### Parallel LLM Processing
```javascript
// Process multiple sections simultaneously
const [summary, skills, projects, experience, achievements] = await Promise.all([
  generateSummary(resume, jobDescription),
  generateSkills(resume, jobDescription),
  generateProjects(resume, jobDescription),
  generateExperience(resume, jobDescription),
  generateAchievements(resume, jobDescription),
]);
```

### LLM Best Practices
- Always include timeout mechanisms (30-60 seconds)
- Log LLM requests and responses for debugging
- Handle rate limits gracefully with retries
- Cache expensive LLM calls when possible
- Keep prompts focused and specific


## Anti-Patterns to Avoid

### ❌ God Functions
Don't create functions that do everything
```javascript
// ❌ Bad - Does too much
export const processJobAndResumeAndGeneratePdfAndUploadToS3 = async (data) => {
  // 200 lines of mixed concerns
};

// ✅ Good - Single responsibility
export const processJob = async (jobUrl) => { /* fetch job */ };
export const optimizeResume = async (resume, job) => { /* optimize */ };
export const generatePdf = async (resume) => { /* generate */ };
```

### ❌ Callback Hell
Don't nest callbacks or mix Promise styles
```javascript
// ❌ Bad
fetchJob(url, (job) => {
  getResume(id, (resume) => {
    generatePdf(resume, (pdf) => {
      uploadToS3(pdf, (url) => { /* ... */ });
    });
  });
});

// ✅ Good
const job = await fetchJob(url);
const resume = await getResume(id);
const pdf = await generatePdf(resume);
const url = await uploadToS3(pdf);
```

### ❌ Magic Numbers/Strings
Don't use unexplained constants
```javascript
// ❌ Bad
if (status === 3) { /* ... */ }
if (jobText.length > 100000) { /* ... */ }

// ✅ Good
const STATUS = { PENDING: 1, PROCESSING: 2, COMPLETED: 3 };
const MAX_JOB_TEXT_LENGTH = 100000;

if (status === STATUS.COMPLETED) { /* ... */ }
if (jobText.length > MAX_JOB_TEXT_LENGTH) { /* ... */ }
```


### ❌ Mixing Concerns
Don't mix business logic with infrastructure
```javascript
// ❌ Bad - Mixing DB queries with business logic
export const processJob = async (jobUrl) => {
  const job = await db.query('SELECT * FROM jobs WHERE url = ?', [jobUrl]);
  const resume = await db.query('SELECT * FROM resumes WHERE id = ?', [job.resumeId]);
  // business logic mixed with SQL
};

// ✅ Good - Separate layers
export const processJob = async (jobUrl) => {
  const job = await getJobByUrl(jobUrl);
  const resume = await getResumeById(job.resumeId);
  return await analyzeJobMatch(job, resume);
};
```

## Performance Guidelines

### Database Optimization
- Use indexes on frequently queried fields (`user_id`, `job_id`, `resume_id`)
- Limit result sets with pagination (don't return all rows)
- Avoid N+1 queries - use joins or batch queries
- Use connection pooling for better performance
- Cache expensive queries when data doesn't change frequently

### Async Optimization
```javascript
// ✅ Good - Parallel execution saves time
const [job, resume, user] = await Promise.all([
  fetchJob(jobId),
  getResume(resumeId),
  getUser(userId)
]);
// Total time: max(fetchJob, getResume, getUser)

// ❌ Bad - Sequential execution wastes time
const job = await fetchJob(jobId);
const resume = await getResume(resumeId);
const user = await getUser(userId);
// Total time: fetchJob + getResume + getUser
```