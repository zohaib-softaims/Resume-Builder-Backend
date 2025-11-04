import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchJobFromLinkedInApi } from '../src/services/jobApiClient.service.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test Script for LinkedIn Service
 * Fetches LinkedIn job data and saves it to a file
 */

/**
 * Saves data to a text file
 * @param {string} jobId - The job ID (used for filename)
 * @param {object} data - The data to save
 * @returns {Promise<string>} The path to the saved file
 */
const saveDataToFile = async (jobId, data) => {
  const outputDir = path.join(__dirname, '../output');

  // Create output directory if it doesn't exist
  try {
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`Output directory ready: ${outputDir}`);
  } catch (error) {
    console.error('Error creating output directory:', error);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `linkedin_job_${jobId}_${timestamp}.txt`;
  const filepath = path.join(outputDir, filename);

  // Convert data to formatted string
  const fileContent = JSON.stringify(data, null, 2);

  await fs.writeFile(filepath, fileContent, 'utf-8');
  console.log(`✓ Data saved to: ${filepath}`);

  return filepath;
};

/**
 * Main test function
 */
const runTest = async () => {
  // Get job ID from command line argument or use default
  const jobId = process.argv[2] || '4259182341';

  console.log('='.repeat(60));
  console.log('LinkedIn Service Test');
  console.log('='.repeat(60));
  console.log(`Job ID: ${jobId}`);
  console.log('='.repeat(60));
  console.log('');

  try {
    // Fetch data from LinkedIn
    const data = await fetchJobFromLinkedInApi(jobId);

    console.log('');
    console.log('='.repeat(60));
    console.log('Data fetched successfully!');
    console.log('='.repeat(60));
    console.log('');

    // Save data to file
    const filepath = await saveDataToFile(jobId, data);

    console.log('');
    console.log('='.repeat(60));
    console.log('Test completed successfully!');
    console.log('='.repeat(60));
    console.log(`File location: ${filepath}`);
    console.log('');

    return {
      success: true,
      data: data,
      filepath: filepath,
    };
  } catch (error) {
    console.error('');
    console.error('='.repeat(60));
    console.error('Test failed!');
    console.error('='.repeat(60));
    console.error('Error:', error.message);
    console.error('');
    process.exit(1);
  }
};

// Run the test
runTest();
