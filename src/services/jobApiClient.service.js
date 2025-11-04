import { LINKEDIN_HEADER_CONFIGS } from '../config/linkedin.headers.js';

const buildLinkedInUrl = (jobId) => {
  const encodedUrn = encodeURIComponent(`urn:li:fsd_jobPosting:${jobId}`);
  return `https://www.linkedin.com/voyager/api/graphql?variables=(cardSectionTypes:List(JOB_DESCRIPTION_CARD),jobPostingUrn:${encodedUrn},includeSecondaryActionsV2:true)&queryId=voyagerJobsDashJobPostingDetailSections.5b0469809f45002e8d68c712fd6e6285`;
};

const fetchWithHeaders = async (url, headers) => {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

const parseJobDescription = (data) => {
  if (!data?.included || !Array.isArray(data.included)) {
    return 'Description not found';
  }

  for (const item of data.included) {
    if (item.descriptionText?.text) {
      return item.descriptionText.text;
    }

    if (item.description?.text) {
      return item.description.text;
    }
  }

  return 'Description not found';
};

export const fetchJobFromLinkedInApi = async (jobId) => {
  const url = buildLinkedInUrl(jobId);
  let lastError;

  for (const headerConfig of LINKEDIN_HEADER_CONFIGS) {
    try {
      const data = await fetchWithHeaders(url, headerConfig);
      return parseJobDescription(data);
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(`All header configurations failed. Last error: ${lastError?.message || 'Unknown error'}`);
};