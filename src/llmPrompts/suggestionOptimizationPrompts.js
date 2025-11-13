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
You are a professional resume writer. Optimize the summary section by applying the user's accepted suggestions.

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
${acceptedSuggestions.map((s, i) => `${i + 1}. ${s.preview}\n   Current: ${s.target.current}\n   Proposed: ${s.proposed}`).join('\n\n')}
==========================

**Your Task**:
Rewrite the summary by applying ALL the accepted suggestions above. The new summary must:
1. Incorporate all the proposed changes from the suggestions
2. Maintain a professional, cohesive tone
3. Be concise (3-5 sentences)
4. Flow naturally despite multiple changes

**Important**:
- Apply EVERY suggestion listed above
- Use the "proposed" content from each suggestion
- Blend all changes into a coherent paragraph
- Don't add anything not in the suggestions or original summary

Return ONLY the optimized summary text, no additional commentary.
`;
};

export const getOptimizedSkillsWithSuggestionsPrompt = (
  resumeText,
  currentSkills,
  acceptedSuggestions
) => {
  return `
You are a professional resume writer. Optimize the skills section by applying the user's accepted suggestions.

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
${acceptedSuggestions.map((s, i) => `${i + 1}. ${s.preview}\n   Current: ${s.target.current}\n   Proposed: ${s.proposed}`).join('\n\n')}
==========================

**Your Task**:
Rewrite the skills section by applying ALL the accepted suggestions above. The new skills section must:
1. Apply all additions, removals, or changes from the suggestions
2. Maintain logical groupings/categories
3. Keep skills organized and easy to scan
4. Preserve all skills not mentioned in suggestions

**Important**:
- Apply EVERY suggestion listed above
- For "add" suggestions: add the new skills to appropriate categories
- For "remove" suggestions: remove those skills
- For "enhance" suggestions: expand/modify as proposed
- Keep the format clean and professional

Return the optimized skills section with categories and items clearly listed.
`;
};

export const getOptimizedExperienceWithSuggestionsPrompt = (
  resumeText,
  currentExperience,
  acceptedSuggestions
) => {
  return `
You are a professional resume writer. Optimize the experience section by applying the user's accepted suggestions.

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
${acceptedSuggestions.map((s, i) => `${i + 1}. Field: ${s.target.field}\n   ${s.preview}\n   Current: ${s.target.current}\n   Proposed: ${s.proposed}`).join('\n\n')}
==========================

**Your Task**:
Rewrite the experience section by applying ALL the accepted suggestions above. For each suggestion:
1. Locate the specific bullet point or section referenced in "Field"
2. Replace the "Current" content with the "Proposed" content
3. Maintain the structure (company, position, dates, bullets)
4. Keep all other bullets/content unchanged

**Important**:
- Apply EVERY suggestion listed above
- Preserve all company names, positions, and dates exactly
- Only modify the specific bullets mentioned in suggestions
- Keep unchanged bullets exactly as they are
- Maintain professional formatting

Return the complete optimized experience section with all jobs and bullets.
`;
};

export const getOptimizedProjectsWithSuggestionsPrompt = (
  resumeText,
  currentProjects,
  acceptedSuggestions
) => {
  return `
You are a professional resume writer. Optimize the projects section by applying the user's accepted suggestions.

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
${acceptedSuggestions.map((s, i) => `${i + 1}. Field: ${s.target.field}\n   ${s.preview}\n   Current: ${s.target.current}\n   Proposed: ${s.proposed}`).join('\n\n')}
==========================

**Your Task**:
Rewrite the projects section by applying ALL the accepted suggestions above. For each suggestion:
1. Locate the specific project/bullet referenced in "Field"
2. Replace the "Current" content with the "Proposed" content
3. Maintain project structure (title, description, tech stack)
4. Keep all other content unchanged

**Important**:
- Apply EVERY suggestion listed above
- Preserve all project names and tech stacks exactly
- Only modify the specific parts mentioned in suggestions
- Keep unchanged content exactly as is
- Maintain professional formatting

Return the complete optimized projects section.
`;
};

export const getOptimizedAchievementsWithSuggestionsPrompt = (
  resumeText,
  currentAchievements,
  acceptedSuggestions
) => {
  return `
You are a professional resume writer. Optimize the achievements section by applying the user's accepted suggestions.

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
${acceptedSuggestions.map((s, i) => `${i + 1}. ${s.preview}\n   Current: ${s.target.current}\n   Proposed: ${s.proposed}`).join('\n\n')}
==========================

**Your Task**:
Rewrite the achievements section by applying ALL the accepted suggestions above.

**Important**:
- Apply EVERY suggestion listed above
- Maintain bullet point format
- Keep all other achievements unchanged
- Be specific and quantifiable

Return the complete optimized achievements section.
`;
};

export const getOptimizedEducationWithSuggestionsPrompt = (
  resumeText,
  currentEducation,
  acceptedSuggestions
) => {
  return `
You are a professional resume writer. Optimize the education section by applying the user's accepted suggestions.

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
${acceptedSuggestions.map((s, i) => `${i + 1}. ${s.preview}\n   Current: ${s.target.current}\n   Proposed: ${s.proposed}`).join('\n\n')}
==========================

**Your Task**:
Update the education section by applying ALL the accepted suggestions above.

**Important**:
- Apply EVERY suggestion listed above
- Preserve degree names, universities, and dates
- Add relevant coursework or details as suggested
- Keep format professional

Return the complete optimized education section.
`;
};

export const getOptimizedCertificationsWithSuggestionsPrompt = (
  resumeText,
  currentCertifications,
  acceptedSuggestions
) => {
  return `
You are a professional resume writer. Optimize the certifications section by applying the user's accepted suggestions.

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
${acceptedSuggestions.map((s, i) => `${i + 1}. ${s.preview}\n   Current: ${s.target.current}\n   Proposed: ${s.proposed}`).join('\n\n')}
==========================

**Your Task**:
Update the certifications section by applying ALL the accepted suggestions above.

**Important**:
- Apply EVERY suggestion listed above
- Add new certifications as proposed
- Include certification name, issuer, and year
- Keep format professional

Return the complete optimized certifications section with all certifications listed.
`;
};
