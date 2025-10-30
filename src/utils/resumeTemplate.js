export const resumeHtmlTemplate = (resumeData) => {
  const { personal_info, professional_summary, skills, experience, projects, education } = resumeData;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Professional Resume</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Calibri', 'Arial', sans-serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #333;
            background: #fff;
        }
        
        .container {
            max-width: 8.5in;
            margin: 0 auto;
            padding: 0.5in;
        }
        
        /* Header Section */
        .header {
            text-align: center;
            border-bottom: 2px solid #2c3e50;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .header h1 {
            font-size: 24pt;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .contact-info {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 15px;
            font-size: 10pt;
            color: #555;
        }
        
        .contact-info span {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        /* Section Styles */
        .section {
            margin-bottom: 20px;
        }
        
        .section-title {
            font-size: 14pt;
            font-weight: bold;
            color: #2c3e50;
            border-bottom: 1px solid #2c3e50;
            padding-bottom: 3px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* Professional Summary */
        .professional-summary {
            text-align: justify;
            font-size: 10.5pt;
            line-height: 1.5;
            color: #444;
        }
        
        /* Skills Section */
        .skills-container {
            display: flex;
            flex-wrap: wrap;
            gap: 30px;
        }
        
        .skill-category {
            flex: 1;
            min-width: 200px;
        }
        
        .skill-category h4 {
            font-size: 11pt;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .skill-list {
            list-style: none;
            padding-left: 0;
        }
        
        .skill-list li {
            display: inline-block;
            margin-right: 8px;
            margin-bottom: 4px;
            padding: 2px 8px;
            background: #f0f4f8;
            border-radius: 3px;
            font-size: 10pt;
        }
        
        /* Experience and Projects */
        .entry {
            margin-bottom: 15px;
            page-break-inside: avoid;
        }
        
        .entry-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 5px;
        }
        
        .entry-title {
            font-size: 12pt;
            font-weight: bold;
            color: #2c3e50;
        }
        
        .entry-company {
            font-size: 11pt;
            font-style: italic;
            color: #555;
        }
        
        .entry-date {
            font-size: 10pt;
            color: #666;
            white-space: nowrap;
        }
        
        .entry-location {
            font-size: 10pt;
            color: #666;
            margin-top: -5px;
            margin-bottom: 8px;
        }
        
        .responsibilities {
            list-style: none;
            padding-left: 0;
        }
        
        .responsibilities li {
            font-size: 10pt;
            margin-bottom: 5px;
            padding-left: 20px;
            position: relative;
            line-height: 1.4;
            color: #444;
        }
        
        .responsibilities li:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #2c3e50;
            font-weight: bold;
        }
        
        /* Project Tech Stack */
        .project-tech {
            font-size: 9.5pt;
            color: #666;
            font-style: italic;
            margin-bottom: 5px;
        }
        
        /* Education */
        .education-entry {
            margin-bottom: 12px;
        }
        
        .education-entry .entry-title {
            font-size: 11pt;
        }
        
        .coursework {
            font-size: 9.5pt;
            color: #555;
            margin-top: 3px;
        }
        
        /* Print Optimizations */
        @media print {
            .container {
                padding: 0;
            }
            
            .section {
                page-break-inside: avoid;
            }
            
            .entry {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>${escapeHtml(personal_info?.name || "Your Name")}</h1>
            <div class="contact-info">
                ${personal_info?.email ? `<span>${escapeHtml(personal_info.email)}</span>` : ""}
                ${personal_info?.phone ? `<span>${escapeHtml(personal_info.phone)}</span>` : ""}
                ${personal_info?.location ? `<span>${escapeHtml(personal_info.location)}</span>` : ""}
                ${personal_info?.linkedin ? `<span>${escapeHtml(personal_info.linkedin)}</span>` : ""}
                ${personal_info?.portfolio ? `<span>${escapeHtml(personal_info.portfolio)}</span>` : ""}
            </div>
        </div>
        
        <!-- Professional Summary -->
        ${
          professional_summary
            ? `
        <div class="section">
            <div class="section-title">Professional Summary</div>
            <div class="professional-summary">${escapeHtml(professional_summary).replace(/\n/g, "<br>")}</div>
        </div>
        `
            : ""
        }
        
        <!-- Skills -->
        ${
          skills
            ? `
        <div class="section">
            <div class="section-title">Technical Skills</div>
            <div class="skills-container">
                ${
                  skills.technical_skills && skills.technical_skills.length > 0
                    ? `
                <div class="skill-category">
                    <h4>Technical Skills</h4>
                    <ul class="skill-list">
                        ${skills.technical_skills.map((skill) => `<li>${escapeHtml(skill)}</li>`).join("")}
                    </ul>
                </div>
                `
                    : ""
                }
                ${
                  skills.soft_skills && skills.soft_skills.length > 0
                    ? `
                <div class="skill-category">
                    <h4>Soft Skills</h4>
                    <ul class="skill-list">
                        ${skills.soft_skills.map((skill) => `<li>${escapeHtml(skill)}</li>`).join("")}
                    </ul>
                </div>
                `
                    : ""
                }
                ${
                  skills.certifications && skills.certifications.length > 0
                    ? `
                <div class="skill-category">
                    <h4>Certifications</h4>
                    <ul class="skill-list">
                        ${skills.certifications.map((cert) => `<li>${escapeHtml(cert)}</li>`).join("")}
                    </ul>
                </div>
                `
                    : ""
                }
            </div>
        </div>
        `
            : ""
        }
        
        <!-- Experience -->
        ${
          experience && experience.length > 0
            ? `
        <div class="section">
            <div class="section-title">Professional Experience</div>
            ${experience
              .map(
                (exp) => `
            <div class="entry">
                <div class="entry-header">
                    <div>
                        <div class="entry-title">${escapeHtml(exp.position || "")}</div>
                        <div class="entry-company">${escapeHtml(exp.company || "")}</div>
                    </div>
                    <div class="entry-date">
                        ${escapeHtml(exp.start_date || "")} - ${escapeHtml(exp.end_date || "Present")}
                    </div>
                </div>
                ${exp.location ? `<div class="entry-location">${escapeHtml(exp.location)}</div>` : ""}
                ${
                  exp.responsibilities && exp.responsibilities.length > 0
                    ? `
                <ul class="responsibilities">
                    ${exp.responsibilities.map((resp) => `<li>${escapeHtml(resp)}</li>`).join("")}
                </ul>
                `
                    : ""
                }
            </div>
            `
              )
              .join("")}
        </div>
        `
            : ""
        }
        
        <!-- Projects -->
        ${
          projects && projects.length > 0
            ? `
        <div class="section">
            <div class="section-title">Projects</div>
            ${projects
              .map(
                (project) => `
            <div class="entry">
                <div class="entry-header">
                    <div class="entry-title">${escapeHtml(project.name || "")}</div>
                </div>
                ${
                  project.technologies && project.technologies.length > 0
                    ? `
                <div class="project-tech">Technologies: ${project.technologies.map((tech) => escapeHtml(tech)).join(", ")}</div>
                `
                    : ""
                }
                ${project.description ? `<div class="professional-summary" style="margin-bottom: 5px;">${escapeHtml(project.description)}</div>` : ""}
                ${
                  project.achievements && project.achievements.length > 0
                    ? `
                <ul class="responsibilities">
                    ${project.achievements.map((achievement) => `<li>${escapeHtml(achievement)}</li>`).join("")}
                </ul>
                `
                    : ""
                }
            </div>
            `
              )
              .join("")}
        </div>
        `
            : ""
        }
        
        <!-- Education -->
        ${
          education && education.length > 0
            ? `
        <div class="section">
            <div class="section-title">Education</div>
            ${education
              .map(
                (edu) => `
            <div class="education-entry">
                <div class="entry-header">
                    <div>
                        <div class="entry-title">${escapeHtml(edu.degree || "")}</div>
                        <div class="entry-company">${escapeHtml(edu.institution || "")}</div>
                    </div>
                    ${edu.graduation_date ? `<div class="entry-date">${escapeHtml(edu.graduation_date)}</div>` : ""}
                </div>
                ${edu.location ? `<div class="entry-location">${escapeHtml(edu.location)}</div>` : ""}
                ${
                  edu.relevant_coursework && edu.relevant_coursework.length > 0
                    ? `
                <div class="coursework">Relevant Coursework: ${edu.relevant_coursework.map((course) => escapeHtml(course)).join(", ")}</div>
                `
                    : ""
                }
            </div>
            `
              )
              .join("")}
        </div>
        `
            : ""
        }
    </div>
</body>
</html>
`;
};

// Helper function to escape HTML
function escapeHtml(text) {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
