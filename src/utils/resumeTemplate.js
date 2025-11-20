export function resumeHtmlTemplate(resume) {
  const style = `
    <style>
      body {
        font-family: 'Arial', sans-serif;
        color: #000;
        padding: 16px;
        max-width: 800px;
        margin: auto;
        line-height: 1.5;
        font-size: 14px;
      }

      h1 {
        font-size: 28px;
        text-align: center;
        margin: 0;
      }

      .contact {
        text-align: center;
        font-size: 13px;
        margin-top: 8px;
        margin-bottom: 20px;
      }

      h2 {
        font-size: 17px;
        margin-bottom: 2px;
        margin-top: 20px;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: bold;
      }

      hr {
        border: none;
        border-top: 1px solid #333;
        margin: 2px 0 12px 0;
      }

      .section {
        margin-bottom: 16px;
      }

      .subheading {
        font-weight: bold;
        font-size: 15px;
      }

      .meta {
        font-size: 12px;
        color: #555;
        margin-bottom: 4px;
      }

      ul {
        padding-left: 18px;
        margin: 6px 0;
      }

      ul li {
        margin-bottom: 4px;
      }

      .skill-line {
        margin-bottom: 4px;
      }

      .project-meta {
        font-size: 12px;
        color: #555;
        margin-top: 2px;
      }

      .project-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 4px;
      }

      .project-title {
        font-weight: bold;
        font-size: 15px;
        flex: 1;
      }

      .project-link {
        font-size: 12px;
        margin-left: 12px;
        white-space: nowrap;
      }

      .project-link a {
        color: #000;
        text-decoration: underline;
      }

      .tech-stack {
        font-size: 12px;
        color: #666;
        font-style: italic;
        margin-bottom: 6px;
        font-weight: normal;
      }

      .tech-stack::before {
        content: "Tech: ";
        font-weight: bold;
        color: #888;
      }

      .awards-certs ul, .achievements ul {
        list-style-type: disc;
        margin-left: 18px;
      }

      .achievement-item {
        margin-bottom: 12px;
      }

      .achievement-heading {
        font-weight: bold;
        font-size: 15px;
        margin-bottom: 4px;
      }

      .award-item, .cert-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
        padding: 6px 0;
        border-bottom: 1px solid #eee;
        min-height: 40px;
      }

      .award-content, .cert-content {
        flex: 1;
      }

      .award-title, .cert-name {
        font-weight: bold;
        font-size: 14px;
      }

      .award-issuer, .cert-issuer {
        font-size: 12px;
        color: #666;
        margin-top: 2px;
      }

      .award-year, .cert-year {
        font-size: 12px;
        color: #888;
        font-weight: bold;
        background: #f5f5f5;
        padding: 2px 8px;
        border-radius: 12px;
      }

      .languages-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 8px;
      }

      .language-tag {
        background: #f0f0f0;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 13px;
        font-weight: 500;
        border: 1px solid #ddd;
      }

      a {
        color: #000;
        text-decoration: underline;
      }
    </style>
  `;

  const formatList = (items) => items?.map((i) => `<li>${i}</li>`).join("") || "";

  // Build contact info array with social links
  const contactInfo = [resume.email, resume.phone, resume.linkedin, resume.location].filter(Boolean);

  // Add social links if available
  if (resume.socialLinks && Array.isArray(resume.socialLinks)) {
    resume.socialLinks.forEach(link => {
      if (link.url) {
        contactInfo.push(link.url);
      }
    });
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${resume.name || "Resume"}</title>
  ${style}
</head>
<body>
  <h1>${resume.name || ""}</h1>
  <div class="contact">
    ${contactInfo.join(" | ")}
  </div>

  ${
    resume.summary
      ? `
    <div class="section">
      <h2>Summary</h2>
      <hr />
      <p>${resume.summary}</p>
    </div>`
      : ""
  }

  ${
    resume.skills?.length
      ? `
    <div class="section">
      <h2>Skills</h2>
      <hr />
      ${resume.skills
        .map(
          (skill) => `
        <div class="skill-line">
          <strong>${skill.category}:</strong> ${skill.items.join(", ")}
        </div>
      `
        )
        .join("")}
    </div>`
      : ""
  }

  ${
    resume.experience?.length
      ? `
    <div class="section">
      <h2>Experience</h2>
      <hr />
      ${resume.experience
        .map(
          (exp) => `
        <div class="entry">
          <div class="subheading">${exp.position} at ${exp.company}</div>
          <div class="meta">${exp.years}${exp.location ? " | " + exp.location : ""}</div>
          ${exp.description_points?.length ? `<ul>${formatList(exp.description_points)}</ul>` : ""}
        </div>
      `
        )
        .join("")}
    </div>`
      : ""
  }

  ${
    resume.projects?.length
      ? `
    <div class="section">
      <h2>Projects</h2>
      <hr />
      ${resume.projects
        .map(
          (proj) => `
        <div class="entry">
          <div class="project-header">
            <div class="project-title">${proj.title}</div>
            ${proj.link ? `<div class="project-link"><a href="${proj.link}" target="_blank">${proj.link}</a></div>` : ""}
          </div>
          ${proj.tech_stack?.length ? `<div class="tech-stack">${proj.tech_stack.join(", ")}</div>` : ""}
          ${proj.description_points?.length ? `<ul>${formatList(proj.description_points)}</ul>` : ""}
        </div>
      `
        )
        .join("")}
    </div>`
      : ""
  }

  ${
    resume.education?.length
      ? `
    <div class="section">
      <h2>Education</h2>
      <hr />
      ${resume.education
        .map(
          (edu) => `
        <div class="entry">
          <div class="subheading">${edu.degree}</div>
          <div class="meta">${edu.institution}${edu.location ? " | " + edu.location : ""} (${edu.years})</div>
        </div>
      `
        )
        .join("")}
    </div>`
      : ""
  }

  ${
    resume.achievements?.length
      ? `
    <div class="section achievements">
      <h2>Achievements</h2>
      <hr />
      ${resume.achievements
        .map(
          (achievement) => `
        <div class="achievement-item">
          <div class="achievement-heading">${achievement.heading}</div>
          <ul>${formatList(achievement.description_points)}</ul>
        </div>
      `
        )
        .join("")}
    </div>`
      : ""
  }

  ${
    resume.certifications?.length
      ? `
    <div class="section">
      <h2>Certifications</h2>
      <hr />
      ${resume.certifications
        .map(
          (cert) => `
        <div class="entry">
          <div class="subheading">${cert.name}${cert.year ? ` (${cert.year})` : ""}</div>
          <div class="meta">${cert.issuer}</div>
          ${cert.description_points?.length ? `<ul>${formatList(cert.description_points)}</ul>` : ""}
        </div>
      `
        )
        .join("")}
    </div>`
      : ""
  }

  ${
    resume.awards?.length
      ? `
    <div class="section">
      <h2>Awards</h2>
      <hr />
      ${resume.awards
        .map(
          (award) => `
        <div class="entry">
          <div class="subheading">${award.title}${award.year ? ` (${award.year})` : ""}</div>
          <div class="meta">${award.issuer}</div>
          ${award.description_points?.length ? `<ul>${formatList(award.description_points)}</ul>` : ""}
        </div>
      `
        )
        .join("")}
    </div>`
      : ""
  }

  ${
    resume.languages?.length
      ? `
    <div class="section">
      <h2>Languages</h2>
      <hr />
      <div class="languages-grid">
        ${resume.languages.map((language) => `<span class="language-tag">${language}</span>`).join("")}
      </div>
    </div>`
      : ""
  }

  ${
    resume.interests?.length
      ? `
    <div class="section">
      <h2>Interests</h2>
      <hr />
      <ul>${formatList(resume.interests)}</ul>
    </div>`
      : ""
  }
</body>
</html>
  `;
}
