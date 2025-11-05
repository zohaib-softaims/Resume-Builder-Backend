export const coverLetterHtmlTemplate = (coverLetterData, resumeJson) => {
  const { opening_paragraph, body_paragraphs, closing_paragraph } = coverLetterData;
  const { name, email, phone, location, linkedin } = resumeJson;

  // Get current date in format: January 4, 2025
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cover Letter - ${name || 'Candidate'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333;
      background: white;
      padding: 0.5in;
    }

    .header {
      margin-bottom: 30px;
    }

    .contact-info {
      text-align: center;
      margin-bottom: 20px;
    }

    .contact-info h1 {
      font-size: 18pt;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 8px;
    }

    .contact-details {
      font-size: 10pt;
      color: #555;
      line-height: 1.4;
    }

    .contact-details a {
      color: #2c3e50;
      text-decoration: none;
    }

    .date {
      font-size: 10pt;
      margin-bottom: 30px;
      color: #555;
    }

    .letter-body {
      margin-bottom: 30px;
    }

    .paragraph {
      margin-bottom: 15px;
      text-align: justify;
      text-justify: inter-word;
    }

    .closing {
      margin-top: 30px;
    }

    .signature-line {
      margin-top: 50px;
      font-weight: 600;
    }

    @media print {
      body {
        padding: 0.5in;
      }
    }

    @page {
      size: letter;
      margin: 0.5in;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="contact-info">
      <h1>${name || 'Candidate Name'}</h1>
      <div class="contact-details">
        ${location ? `${location}` : ''}
        ${email ? `<br>${email}` : ''}
        ${phone ? ` | ${phone}` : ''}
        ${linkedin ? `<br><a href="${linkedin}" target="_blank">${linkedin}</a>` : ''}
      </div>
    </div>
    <div class="date">${currentDate}</div>
  </div>

  <div class="letter-body">
    <div class="paragraph">
      ${opening_paragraph}
    </div>

    ${body_paragraphs.map(paragraph => `
    <div class="paragraph">
      ${paragraph}
    </div>
    `).join('')}

    <div class="paragraph">
      ${closing_paragraph}
    </div>
  </div>

  <div class="closing">
    <div>Sincerely,</div>
    <div class="signature-line">${name || 'Candidate Name'}</div>
  </div>
</body>
</html>
  `.trim();
};
