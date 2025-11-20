/**
 * EMAIL TEMPLATE TESTER - Simple Sequential Testing
 *
 * This file sends all email templates to zohaib@thesoftaims.com in sequence
 * Comment out any template you don't want to test
 *
 * Usage: node emailTester.js
 */

import dotenv from "dotenv";
import { sendEmail } from "./src/utils/brevo.service.js";

// Import all email templates
import { generateWelcomeEmailTemplate } from "./src/emailTemplates/welcomeEmail.template.js";
import { platformTourEmailTemplate } from "./src/emailTemplates/platformTourEmail.template.js";
import { weeklyCareerKickoffEmailTemplate } from "./src/emailTemplates/weeklyCareerKickoffEmail.template.js";
import { weeklyCareerReflectionEmailTemplate } from "./src/emailTemplates/weeklyCareerReflectionEmail.template.js";
import { weeklyMidWeekCheckInEmailTemplate } from "./src/emailTemplates/weeklyMidWeekCheckInEmail.template.js";
import { generate2HourOnboardingAbandonmentTemplate } from "./src/emailTemplates/2hourOnboardingAbandonmentEmail.template.js";
import { generate24HourOnboardingAbandonmentTemplate } from "./src/emailTemplates/24hourOnboardingAbandonmentEmail.template.js";
import { generate48HourOnboardingAbandonmentTemplate } from "./src/emailTemplates/48hourOnboardingAbandonmentEmail.template.js";
import { generate72HourOnboardingAbandonmentTemplate } from "./src/emailTemplates/72hourOnboardingAbandonmentEmail.template.js";
import { threeDayInactivityEmailTemplate } from "./src/emailTemplates/3dayInactivityEmail.template.js";
import { sevenDayInactivityEmailTemplate } from "./src/emailTemplates/7dayInactivityEmail.template.js";
import { twoWeekInactivityEmailTemplate } from "./src/emailTemplates/2weekInactivityEmail.template.js";
import { threeWeekInactivityEmailTemplate } from "./src/emailTemplates/3weekInactivityEmail.template.js";
import { chatbotNotUsedEmailTemplate } from "./src/emailTemplates/chatbotNotUsedEmail.template.js";
import { careerGoalsTabNotUsedEmailTemplate } from "./src/emailTemplates/careerGoalsTabNotUsedEmail.template.js";
import { careerRoadmapTabNotUsedEmailTemplate } from "./src/emailTemplates/careerRoadmapTabNotUsedEmail.template.js";
import { salaryTabNotUsedEmailTemplate } from "./src/emailTemplates/salaryTabNotUsedEmail.template.js";
import { improvedResumeCompletedEmailTemplate } from "./src/emailTemplates/improvedResumeCompletedEmail.template.js";
q
dotenv.config();

const TEST_EMAIL = "zohaib@thesoftaims.com";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Dummy data
const name = "John Doe";
const careerData = {
  currentRole: "Software Developer",
  targetRole: "Senior Software Engineer",
  isAtCareerPeak: false,
  industry: "Technology",
  careerScore: 75,
};
const salaryData = {
  currentSalary: 75000,
  marketSalary: 85000,
  industry: "Technology",
  role: "Software Developer",
  isUnderpaid: true,
};
const resumeUrl = "https://example.com/resume.pdf";

async function runAllTests() {
  console.log("🚀 Starting email template tests...\n");

  // 1. Welcome Email
  console.log("📧 Sending Welcome Email...");
  await sendEmail({
    to: TEST_EMAIL,
    subject: "Welcome to Consiliārī!",
    htmlContent: generateWelcomeEmailTemplate(name),
  });
  await delay(2000);

  // 2. Platform Tour Email
  console.log("📧 Sending Platform Tour Email...");
  await sendEmail({
    to: TEST_EMAIL,
    subject: "Your career command center tour",
    htmlContent: platformTourEmailTemplate(name),
  });
  await delay(2000);

  // 3. Weekly Career Kickoff Email
  console.log("📧 Sending Weekly Career Kickoff Email...");
  await sendEmail({
    to: TEST_EMAIL,
    subject: "Your career focus for this week",
    htmlContent: weeklyCareerKickoffEmailTemplate(name, careerData),
  });
  await delay(2000);

  // 4. Weekly Career Reflection Email
  console.log("📧 Sending Weekly Career Reflection Email...");
  await sendEmail({
    to: TEST_EMAIL,
    subject: "Weekly Career Reflection",
    htmlContent: weeklyCareerReflectionEmailTemplate(name),
  });
  await delay(2000);

  // 5. Weekly Mid-Week Check-In Email
  console.log("📧 Sending Weekly Mid-Week Check-In Email...");
  await sendEmail({
    to: TEST_EMAIL,
    subject: "Mid-Week Career Check-In",
    htmlContent: weeklyMidWeekCheckInEmailTemplate(name),
  });
  await delay(2000);

  // 6. 2-Hour Onboarding Abandonment Email
  console.log("📧 Sending 2-Hour Onboarding Abandonment Email...");
  await sendEmail({
    to: TEST_EMAIL,
    subject: "Complete your setup in 2 minutes",
    htmlContent: generate2HourOnboardingAbandonmentTemplate(name),
  });
  await delay(2000);

  // 7. 24-Hour Onboarding Abandonment Email
  console.log("📧 Sending 24-Hour Onboarding Abandonment Email...");
  await sendEmail({
    to: TEST_EMAIL,
    subject: "Your career insights are waiting",
    htmlContent: generate24HourOnboardingAbandonmentTemplate(name),
  });
  await delay(2000);

  // 8. 48-Hour Onboarding Abandonment Email
  console.log("📧 Sending 48-Hour Onboarding Abandonment Email...");
  await sendEmail({
    to: TEST_EMAIL,
    subject: "Don't miss your career breakthrough",
    htmlContent: generate48HourOnboardingAbandonmentTemplate(name),
  });
  await delay(2000);

  // 9. 72-Hour Onboarding Abandonment Email
  console.log("📧 Sending 72-Hour Onboarding Abandonment Email...");
  await sendEmail({
    to: TEST_EMAIL,
    subject: "Final reminder: Your career coach awaits",
    htmlContent: generate72HourOnboardingAbandonmentTemplate(name),
  });
  await delay(2000);

  // 10. 3-Day Inactivity Email
  console.log("📧 Sending 3-Day Inactivity Email...");
  await sendEmail({
    to: TEST_EMAIL,
    subject: "Ready to get back to your career goals?",
    htmlContent: threeDayInactivityEmailTemplate(name),
  });
  await delay(2000);

  // 11. 7-Day Inactivity Email
  console.log("📧 Sending 7-Day Inactivity Email...");
  await sendEmail({
    to: TEST_EMAIL,
    subject: "Miss us? Your career coach has updates",
    htmlContent: sevenDayInactivityEmailTemplate(name),
  });
  await delay(2000);

  // 12. 2-Week Inactivity Email
  console.log("📧 Sending 2-Week Inactivity Email...");
  await sendEmail({
    to: TEST_EMAIL,
    subject: "Your career shouldn't be on pause",
    htmlContent: twoWeekInactivityEmailTemplate(name),
  });
  await delay(2000);

  // 13. 3-Week Inactivity Email
  console.log("📧 Sending 3-Week Inactivity Email...");
  await sendEmail({
    to: TEST_EMAIL,
    subject: "Last chance: Your career tools await",
    htmlContent: threeWeekInactivityEmailTemplate(name),
  });
  await delay(2000);

  // 14. Chatbot Not Used Email
  console.log("📧 Sending Chatbot Not Used Email...");
  await sendEmail({
    to: TEST_EMAIL,
    subject: "Your AI career coach is ready to help",
    htmlContent: chatbotNotUsedEmailTemplate(name),
  });
  await delay(2000);

  // 15. Career Goals Tab Not Used Email
  console.log("📧 Sending Career Goals Tab Not Used Email...");
  await sendEmail({
    to: TEST_EMAIL,
    subject: "Set your career goals and see magic happen",
    htmlContent: careerGoalsTabNotUsedEmailTemplate(name),
  });
  await delay(2000);

  // 16. Career Roadmap Tab Not Used Email
  console.log("📧 Sending Career Roadmap Tab Not Used Email...");
  await sendEmail({
    to: TEST_EMAIL,
    subject: "Your career roadmap is waiting",
    htmlContent: careerRoadmapTabNotUsedEmailTemplate(name, careerData),
  });
  await delay(2000);

  // 17. Salary Tab Not Used Email
  console.log("📧 Sending Salary Tab Not Used Email...");
  await sendEmail({
    to: TEST_EMAIL,
    subject: "Are you earning what you're worth?",
    htmlContent: salaryTabNotUsedEmailTemplate(name, salaryData),
  });
  await delay(2000);

  // 18. Improved Resume Completed Email
  console.log("📧 Sending Improved Resume Completed Email...");
  await sendEmail({
    to: TEST_EMAIL,
    subject: "Your enhanced resume is ready – download now - TEST",
    htmlContent: improvedResumeCompletedEmailTemplate(name, resumeUrl),
  });

  console.log("\n✅ All email templates sent successfully!");
  console.log(`📧 Check your inbox at ${TEST_EMAIL}`);
}

runAllTests().catch((error) => {
  console.error("❌ Error:", error);
  process.exit(1);
});
