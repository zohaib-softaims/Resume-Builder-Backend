import puppeteer from 'puppeteer';
import { convert } from 'html-to-text';
import { sanitizedText } from '../src/utils/sanitizedText.js';

export const scrapeJobFromWeb = async (jobUrl) => {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.goto(jobUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    const html = await page.content();

    let jobText = convert(html, { wordwrap: false, preserveNewlines: true });
    jobText = sanitizedText(jobText);

    if (jobText.length > 100000) {
      jobText = jobText.substring(0, 100000);
    }

    return jobText;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
