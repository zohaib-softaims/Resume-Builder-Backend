# Scrapefly Web Scraping Service

## Overview

Scrapefly is a powerful web scraping API that bypasses anti-scraping systems, rotates proxies automatically, and renders JavaScript-heavy websites. This service provides a clean interface to scrape job postings and other web content.

## Features

- ✅ **Anti-Bot Protection Bypass** - Automatically handles Cloudflare, reCAPTCHA, and other anti-scraping systems
- ✅ **JavaScript Rendering** - Full browser rendering for dynamic websites
- ✅ **Automatic Proxy Rotation** - 130M+ proxies from 120+ countries
- ✅ **Multiple Output Formats** - HTML, Markdown, JSON, Plain Text
- ✅ **Screenshot Capture** - Take full-page or element-specific screenshots
- ✅ **Structured Data Extraction** - Extract specific data using CSS selectors or XPath
- ✅ **Session Management** - Maintain cookies and fingerprints across requests
- ✅ **Caching** - Built-in caching with configurable TTL

## Setup

### 1. Install Dependencies

The project already includes the required dependency (`axios`). No additional installation needed.

### 2. Configure API Key

Add your Scrapefly API key to the `.env` file:

```bash
SCRAPEFLY_API_KEY=scp-live-a2fa9c50474f41ddaa0f9169f3a0f222
```

### 3. Import the Service

```javascript
import {
  scrapeWebsiteWithScrapfly,
  scrapeJobWithScrapfly,
  screenshotWithScrapfly,
  extractDataWithScrapfly,
} from './src/services/scrapeflyWebScraper.service.js';
```

## Usage Examples

### Basic Website Scraping

```javascript
const content = await scrapeWebsiteWithScrapfly('https://example.com', {
  renderJs: false,
  asp: true,
  proxyPool: 'public_datacenter_pool',
  country: 'US',
});

console.log(content); // Raw HTML
```

### Job Posting Scraping (Returns Clean Text)

```javascript
const jobText = await scrapeJobWithScrapfly('https://pk.indeed.com/viewjob?jk=636b6f09f1f80026', {
  renderJs: true,
  asp: true,
  proxyPool: 'public_residential_pool',
  country: 'PK',
});

console.log(jobText); // Cleaned job description text
```

### JavaScript-Heavy Websites

```javascript
const content = await scrapeWebsiteWithScrapfly('https://linkedin.com/jobs/view/12345', {
  renderJs: true,
  asp: true,
  proxyPool: 'public_residential_pool',
  country: 'US',
  timeout: 60000,
});
```

### Markdown Format Output

```javascript
const markdown = await scrapeWebsiteWithScrapfly('https://example.com', {
  renderJs: true,
  format: 'markdown', // Returns markdown instead of HTML
});
```

### Screenshot Capture

```javascript
const screenshotBase64 = await screenshotWithScrapfly('https://example.com', {
  format: 'png',
  fullPage: true,
  resolution: '1920:1080',
  waitForSelector: '.main-content',
});

// Save to file
import fs from 'fs/promises';
const buffer = Buffer.from(screenshotBase64, 'base64');
await fs.writeFile('screenshot.png', buffer);
```

### Structured Data Extraction

```javascript
// Define what data to extract using CSS selectors
const extractionRules = {
  title: 'h1.job-title',
  company: '.company-name',
  location: '.job-location',
  salary: '.salary-info',
  description: '.job-description',
};

const jobData = await extractDataWithScrapfly(
  'https://example.com/job/12345',
  extractionRules,
  {
    renderJs: true,
    asp: true,
  }
);

console.log(jobData);
// Output: { title: "...", company: "...", location: "...", ... }
```

### Session Management (Multiple Requests)

```javascript
const sessionId = `session_${Date.now()}`;

// First request - establishes session
const page1 = await scrapeWebsiteWithScrapfly('https://example.com/login', {
  session: sessionId,
  renderJs: true,
});

// Second request - reuses cookies and fingerprint
const page2 = await scrapeWebsiteWithScrapfly('https://example.com/dashboard', {
  session: sessionId,
  renderJs: true,
});
```

### Caching (Reduce API Calls)

```javascript
const content = await scrapeWebsiteWithScrapfly('https://example.com', {
  cacheTtl: 3600, // Cache for 1 hour (in seconds)
  renderJs: true,
});
```

## Configuration Options

### scrapeWebsiteWithScrapfly(url, options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `renderJs` | boolean | `false` | Enable JavaScript rendering with headless browser |
| `proxyPool` | string | `'public_datacenter_pool'` | Proxy type: `'public_datacenter_pool'`, `'public_residential_pool'` |
| `country` | string | `'US'` | Proxy country code (ISO 3166): `'US'`, `'GB'`, `'CA'`, `'PK'`, etc. |
| `asp` | boolean | `true` | Enable anti-scraping protection bypass |
| `format` | string | `'raw'` | Output format: `'raw'`, `'clean_html'`, `'markdown'`, `'text'`, `'json'` |
| `cacheTtl` | number | `0` | Cache TTL in seconds (0 = no cache) |
| `session` | string | `null` | Session ID to maintain cookies across requests |
| `timeout` | number | `30000` | Request timeout in milliseconds |

### scrapeJobWithScrapfly(jobUrl, options)

Same options as above, but returns cleaned text suitable for job descriptions.

**Defaults for job scraping:**
- `renderJs: true`
- `asp: true`
- `format: 'raw'` (then converted to clean text)

### screenshotWithScrapfly(url, options)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `format` | string | `'png'` | Screenshot format: `'png'`, `'jpg'` |
| `fullPage` | boolean | `true` | Capture full page or just viewport |
| `resolution` | string | `'1920:1080'` | Screen resolution `'width:height'` |
| `waitForSelector` | string | `null` | CSS selector to wait for before screenshot |

### extractDataWithScrapfly(url, extractionRules, options)

- `extractionRules`: Object with field names as keys and CSS selectors as values
- `options`: Same as `scrapeWebsiteWithScrapfly`

## Test Scripts

### Run All Tests

```bash
node scripts/test-scrapefly.js
```

This runs comprehensive tests including:
- Basic scraping
- JavaScript rendering
- Job posting scraping
- Screenshot capture
- Data extraction
- Multiple URLs (parallel)
- Proxy configuration
- Real-world examples

### Run Indeed Job Test

```bash
node scripts/test-scrapefly-indeed.js
```

This scrapes a specific Indeed job and saves results to the `output/` directory:
- Raw HTML file
- Clean text file
- Markdown file
- Summary JSON

## Output Files

All scraping results are saved to the `/output/` directory with timestamps:

```
output/
├── indeed_job_2025-01-06T12-30-45-123Z_raw.html
├── indeed_job_2025-01-06T12-30-45-123Z_clean.txt
├── indeed_job_2025-01-06T12-30-45-123Z.md
├── indeed_job_2025-01-06T12-30-45-123Z_summary.json
└── screenshot_1704542345678.png
```

## Proxy Pools

### Datacenter Proxies (`public_datacenter_pool`)
- ✅ Fast and reliable
- ✅ Lower cost
- ❌ Easier to detect
- **Use for:** Non-restrictive websites, general scraping

### Residential Proxies (`public_residential_pool`)
- ✅ Real residential IPs
- ✅ Harder to detect and block
- ❌ Higher cost
- ❌ Slightly slower
- **Use for:** LinkedIn, Indeed, protected job sites

## Supported Countries

Common country codes:
- `US` - United States
- `GB` - United Kingdom
- `CA` - Canada
- `PK` - Pakistan
- `IN` - India
- `AU` - Australia
- `DE` - Germany
- `FR` - France
- `SG` - Singapore

[Full list of 120+ countries available](https://scrapfly.io/docs/scrape-api/country)

## Best Practices

### 1. Use Appropriate Proxy Pool

```javascript
// For protected sites (LinkedIn, Indeed, etc.)
{ proxyPool: 'public_residential_pool', country: 'US' }

// For general websites
{ proxyPool: 'public_datacenter_pool', country: 'US' }
```

### 2. Enable JavaScript When Needed

```javascript
// Only enable renderJs if the site requires it (costs more credits)
{ renderJs: true } // For dynamic sites
{ renderJs: false } // For static sites
```

### 3. Handle Errors Gracefully

```javascript
try {
  const content = await scrapeWebsiteWithScrapfly(url, options);
  // Process content
} catch (error) {
  logger.error('Scraping failed', { url, error: error.message });
  // Fallback to puppeteer or retry
}
```

### 4. Use Caching for Static Content

```javascript
// Cache job postings for 1 hour
{ cacheTtl: 3600 }
```

### 5. Match Proxy Country to Target Site

```javascript
// For pk.indeed.com
{ country: 'PK' }

// For uk.linkedin.com
{ country: 'GB' }
```

### 6. Parallel Scraping

```javascript
// Scrape multiple jobs in parallel
const jobs = await Promise.all(
  jobUrls.map(url => scrapeJobWithScrapfly(url, options))
);
```

### 7. Use Sessions for Multi-Step Scraping

```javascript
const session = `session_${userId}_${Date.now()}`;

// Login page
await scrapeWebsiteWithScrapfly(loginUrl, { session });

// Dashboard (reuses login cookies)
await scrapeWebsiteWithScrapfly(dashboardUrl, { session });
```

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| `SCRAPEFLY_API_KEY is not configured` | Missing API key | Add to `.env` file |
| `Failed to scrape: 401` | Invalid API key | Check API key is correct |
| `Failed to scrape: 422` | Invalid parameters | Verify URL encoding and parameters |
| `Failed to scrape: 429` | Rate limit exceeded | Wait or upgrade plan |
| `Failed to scrape: timeout` | Request took too long | Increase `timeout` option |

## Integration with Existing Services

### Replace Puppeteer with Scrapefly

**Before (Puppeteer):**
```javascript
import { scrapeJobFromWeb } from './services/jobWebScraper.service.js';
const jobText = await scrapeJobFromWeb(jobUrl);
```

**After (Scrapefly):**
```javascript
import { scrapeJobWithScrapfly } from './services/scrapeflyWebScraper.service.js';
const jobText = await scrapeJobWithScrapfly(jobUrl, {
  renderJs: true,
  asp: true,
  proxyPool: 'public_residential_pool',
});
```

### Use in Controllers

```javascript
import { scrapeJobWithScrapfly } from '../services/scrapeflyWebScraper.service.js';
import { catchAsync } from '../utils/catchAsync.js';

export const fetchJobDescription = catchAsync(async (req, res) => {
  const { jobUrl } = req.body;

  const jobDescription = await scrapeJobWithScrapfly(jobUrl, {
    renderJs: true,
    asp: true,
    proxyPool: 'public_residential_pool',
  });

  res.status(200).json({
    success: true,
    data: { jobDescription },
  });
});
```

## Performance Comparison

| Method | Speed | Success Rate | Cost | Anti-Bot Bypass |
|--------|-------|--------------|------|-----------------|
| Puppeteer | Slow | 60-70% | Free (server resources) | Limited |
| Scrapefly (Datacenter) | Fast | 90-95% | Low | Excellent |
| Scrapefly (Residential) | Medium | 95-99% | Higher | Excellent |

## Pricing Considerations

- **API Credits**: Each request consumes credits based on features used
- **JavaScript Rendering**: Costs more credits than static scraping
- **Residential Proxies**: Cost more than datacenter proxies
- **Screenshots**: Additional credit cost

**Optimization Tips:**
- Use `renderJs: false` for static sites
- Use datacenter proxies when possible
- Implement caching for frequently accessed pages
- Only scrape when necessary (not on every request)

## Additional Resources

- [Scrapefly Official Documentation](https://scrapfly.io/docs)
- [API Specification](https://scrapfly.io/docs/scrape-api/getting-started)
- [Example Scrapers GitHub](https://github.com/scrapfly/scrapfly-scrapers)
- [Pricing Calculator](https://scrapfly.io/pricing)

## Support

For issues with Scrapefly service, contact:
- Dashboard: https://scrapfly.io/dashboard
- Documentation: https://scrapfly.io/docs
- GitHub Issues: https://github.com/scrapfly/python-scrapfly/issues
