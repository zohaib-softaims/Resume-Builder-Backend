/**
 * Helper function to convert JSON resume data to text format for LLM analysis
 * @param {Object} jsonData - The structured resume JSON data
 * @returns {string} - Formatted resume text
 */
export function convertJsonToResumeText(jsonData) {
  let text = '';

  // Personal Information
  if (jsonData.name) text += `${jsonData.name}\n`;
  if (jsonData.email) text += `${jsonData.email}\n`;
  if (jsonData.phone) text += `${jsonData.phone}\n`;
  if (jsonData.location) text += `${jsonData.location}\n`;
  if (jsonData.linkedin) text += `${jsonData.linkedin}\n`;
  text += '\n';

  // Summary/Profile
  if (jsonData.summary) {
    text += `PROFESSIONAL SUMMARY\n${jsonData.summary}\n\n`;
  }

  // Skills
  if (jsonData.skills && jsonData.skills.length > 0) {
    text += 'SKILLS\n';
    jsonData.skills.forEach(skillGroup => {
      if (skillGroup.category) text += `${skillGroup.category}: `;
      if (skillGroup.items && skillGroup.items.length > 0) {
        text += skillGroup.items.join(', ') + '\n';
      }
    });
    text += '\n';
  }

  // Experience
  if (jsonData.experience && jsonData.experience.length > 0) {
    text += 'WORK EXPERIENCE\n';
    jsonData.experience.forEach(exp => {
      if (exp.position) text += `${exp.position}\n`;
      if (exp.company) text += `${exp.company}`;
      if (exp.location) text += ` - ${exp.location}`;
      text += '\n';
      if (exp.years) text += `${exp.years}\n`;
      if (exp.description_points && exp.description_points.length > 0) {
        exp.description_points.forEach(point => {
          text += `• ${point}\n`;
        });
      }
      text += '\n';
    });
  }

  // Education
  if (jsonData.education && jsonData.education.length > 0) {
    text += 'EDUCATION\n';
    jsonData.education.forEach(edu => {
      if (edu.degree) text += `${edu.degree}\n`;
      if (edu.institution) text += `${edu.institution}`;
      if (edu.location) text += ` - ${edu.location}`;
      text += '\n';
      if (edu.years) text += `${edu.years}\n`;
      text += '\n';
    });
  }

  // Certifications
  if (jsonData.certifications && jsonData.certifications.length > 0) {
    text += 'CERTIFICATIONS\n';
    jsonData.certifications.forEach(cert => {
      text += `• ${cert}\n`;
    });
    text += '\n';
  }

  // Projects
  if (jsonData.projects && jsonData.projects.length > 0) {
    text += 'PROJECTS\n';
    jsonData.projects.forEach(project => {
      if (project.name) text += `${project.name}\n`;
      if (project.description) text += `${project.description}\n`;
      text += '\n';
    });
  }

  // Achievements
  if (jsonData.achievements && jsonData.achievements.length > 0) {
    text += 'ACHIEVEMENTS\n';
    jsonData.achievements.forEach(achievement => {
      text += `• ${achievement}\n`;
    });
    text += '\n';
  }

  // Awards
  if (jsonData.awards && jsonData.awards.length > 0) {
    text += 'AWARDS\n';
    jsonData.awards.forEach(award => {
      text += `• ${award}\n`;
    });
    text += '\n';
  }

  // Interests
  if (jsonData.interests && jsonData.interests.length > 0) {
    text += 'INTERESTS\n';
    text += jsonData.interests.join(', ') + '\n';
  }

  return text;
}
