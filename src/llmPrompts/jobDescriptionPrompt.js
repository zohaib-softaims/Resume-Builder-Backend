export const jobDescriptionPrompt = (jobContent) => {
  return `
You are an expert at analyzing job postings and extracting job descriptions from content.

==========================
**Content**:
${jobContent}
==========================

The content above contains a job description (JD). Your task is to extract ONLY the job description, job title and the company details portion from this content and return it as complete as possible. 

Remove everything that is NOT part of the job description (like navigation elements, ads, website headers/footers, unrelated text, etc.).

Return the job description exactly as it appears in the content, just cleaned up by removing unnecessary surrounding text. Do not summarize, modify, or rephrase anything - keep the original job description intact and complete.
`;
};
