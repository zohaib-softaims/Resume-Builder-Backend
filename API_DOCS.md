# Resume Builder Backend - API Documentation

Base URL: `http://localhost:9000/api`

---

## Resume APIs

### 1. Parse Resume
**POST** `/resume/parse`

**Headers:**
```
Authorization: Bearer <clerk_token>
Content-Type: multipart/form-data
```

**Request Body:**
```
resume: <PDF file>
```

**Response:**
```json
{
  "success": true,
  "message": "Resume analyzed successfully",
  "data": {
    "resume_id": "clxxx",
    "resume_analysis": {
      "overall_resume_score": "80%",
      "ats_compatibility": "85%",
      "keyword_optimization": "75%",
      "achievement_focus": "70%",
      "personal_info": { ... },
      "summary": "...",
      "skills": [...],
      "experience": [...],
      "education": [...],
      "projects": [...]
    }
  }
}
```

---

### 2. Optimize Resume
**POST** `/resume/optimize`

**Headers:**
```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "resume_id": "clxxx"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resume optimized and PDF generated successfully",
  "data": {
    "resume_id": "clxxx",
    "pdf_url": "https://s3.amazonaws.com/..."
  }
}
```

---

### 3. Get User Resumes
**GET** `/resume`

**Headers:**
```
Authorization: Bearer <clerk_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Resumes fetched successfully",
  "data": {
    "resumes": [
      {
        "id": "clxxx",
        "user_id": "user_xxx",
        "resume_fileUrl": "https://s3...",
        "optimized_resumeUrl": "https://s3...",
        "resume_analysis_score": {
          "overall_resume_score": "80%",
          "ats_compatibility": "85%",
          "keyword_optimization": "75%",
          "achievement_focus": "70%"
        },
        "createdAt": "2025-01-04T...",
        "updatedAt": "2025-01-04T..."
      }
    ],
    "count": 5
  }
}
```

---

### 4. Get Resume Details
**GET** `/resume/:resume_id`

**Headers:**
```
Authorization: Bearer <clerk_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Resume details fetched successfully",
  "data": {
    "resume_id": "clxxx",
    "user_id": "user_xxx",
    "resume_analysis": { ... },
    "resume_analysis_score": {
      "overall_resume_score": "80%",
      "ats_compatibility": "85%",
      "keyword_optimization": "75%",
      "achievement_focus": "70%"
    },
    "original_resume_url": "https://s3...",
    "optimized_resume_url": "https://s3...",
    "created_at": "2025-01-04T...",
    "updated_at": "2025-01-04T..."
  }
}
```

---

## Job APIs

### 5. Scrape Job & Analyze Gap
**POST** `/job/scrap-job`

**Headers:**
```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "job_url": "https://www.linkedin.com/jobs/view/123456",
  "resume_id": "clxxx"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job scraped and gap analysis completed successfully",
  "data": {
    "job_id": "clxxx",
    "job_title": "Senior Software Engineer",
    "job_description": "...",
    "job_gap_analysis": {
      "overall_match_rate": "75%",
      "searchability": { ... },
      "formatting": { ... },
      "skills": {
        "matching_skills": [...],
        "missing_skills": [...]
      },
      "recruiter_tips": [...]
    }
  }
}
```

---

### 6. Optimize Resume for Job
**POST** `/job/optimize`

**Headers:**
```
Authorization: Bearer <clerk_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "job_id": "clxxx"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resume and cover letter generated successfully",
  "data": {
    "job_id": "clxxx",
    "resume_id": "clxxx",
    "pdf_url": "https://s3.amazonaws.com/optimized-resume.pdf",
    "cover_letter_url": "https://s3.amazonaws.com/cover-letter.pdf"
  }
}
```

---

### 7. Get User Jobs
**GET** `/job`

**Headers:**
```
Authorization: Bearer <clerk_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User jobs fetched successfully",
  "data": {
    "jobs": [
      {
        "job_id": "clxxx",
        "original_resume_name": "John_Doe_Resume.pdf",
        "job_title": "Senior Software Engineer",
        "job_analysis_score": {
          "overall_match_rate": "75%",
          "searchability_issues": 2,
          "formatting_issues": 1,
          "missing_skills": 3,
          "recruiter_tips_count": 5
        },
        "created_at": "2025-01-04T...",
        "updated_at": "2025-01-04T..."
      }
    ],
    "count": 10
  }
}
```

---

### 8. Get Job Details
**GET** `/job/:job_id`

**Headers:**
```
Authorization: Bearer <clerk_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Job details fetched successfully",
  "data": {
    "job_id": "clxxx",
    "job_title": "Senior Software Engineer",
    "job_url": "https://linkedin.com/jobs/view/123456",
    "job_description": "...",
    "job_gap_analysis": { ... },
    "job_analysis_score": {
      "overall_match_rate": "75%",
      "searchability_issues": 2,
      "formatting_issues": 1,
      "missing_skills": 3,
      "recruiter_tips_count": 5
    },
    "optimized_resume_url": "https://s3...",
    "cover_letter_url": "https://s3...",
    "original_resume_url": "https://s3...",
    "created_at": "2025-01-04T...",
    "updated_at": "2025-01-04T..."
  }
}
```

---

## User APIs

### 9. Get User Statistics
**GET** `/user/stats`

**Headers:**
```
Authorization: Bearer <clerk_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User stats fetched successfully",
  "data": {
    "overall_stats": {
      "average_resume_score": 82.5,
      "best_ats_score": 90,
      "total_resumes_uploaded": 10,
      "total_job_optimized_resumes": 7
    },
    "latest_resumes": [
      {
        "id": "clxxx",
        "user_id": "user_xxx",
        "resume_fileUrl": "https://s3...",
        "optimized_resumeUrl": "https://s3...",
        "resume_analysis_score": {
          "overall_resume_score": "85%",
          "ats_compatibility": "90%",
          "keyword_optimization": "80%",
          "achievement_focus": "75%"
        },
        "original_resume_name": "John_Doe_Resume.pdf",
        "createdAt": "2025-01-04T...",
        "updatedAt": "2025-01-04T..."
      }
      // Top 3 latest resumes
    ],
    "latest_jobs": [
      {
        "job_id": "clxxx",
        "original_resume_name": "John_Doe_Resume.pdf",
        "job_title": "Senior Software Engineer",
        "job_analysis_score": {
          "overall_match_rate": "88%",
          "searchability_issues": 1,
          "formatting_issues": 0,
          "missing_skills": 2,
          "recruiter_tips_count": 4
        },
        "created_at": "2025-01-04T...",
        "updated_at": "2025-01-04T..."
      }
      // Top 3 latest jobs
    ]
  }
}
```

---

## Authentication

All endpoints (except webhooks) require Clerk authentication.

**Headers:**
```
Authorization: Bearer <clerk_token>
```

The user ID is automatically extracted from the Clerk token via `req.auth.userId`.

---

## Response Format

All API responses follow this structure:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error description"
}
```

---

## Status Codes

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error
