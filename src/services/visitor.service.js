import prisma from "../lib/prisma.js";

export const incrementAppVisits = async () => {
  const analytics = await prisma.appAnalytics.upsert({
    where: { id: 1 },
    update: {
      totalAppVisits: {
        increment: 1,
      },
    },
    create: {
      id: 1,
      totalAppVisits: 1,
    },
  });

  return analytics;
};

export const incrementGuestResumeAnalysis = async () => {
  const analytics = await prisma.appAnalytics.upsert({
    where: { id: 1 },
    update: {
      totalGuestResumeAnalysis: {
        increment: 1,
      },
    },
    create: {
      id: 1,
      totalGuestResumeAnalysis: 1,
    },
  });

  return analytics;
};

export const incrementFixAtsOrCustomizeClicked = async () => {
  const analytics = await prisma.appAnalytics.upsert({
    where: { id: 1 },
    update: {
      fixAtsOrCustomizedClicked: {
        increment: 1,
      },
    },
    create: {
      id: 1,
      fixAtsOrCustomizedClicked: 1,
    },
  });

  return analytics;
};

export const incrementSignupButtonClicked = async () => {
  const analytics = await prisma.appAnalytics.upsert({
    where: { id: 1 },
    update: {
      signupButtonClicked: {
        increment: 1,
      },
    },
    create: {
      id: 1,
      signupButtonClicked: 1,
    },
  });

  return analytics;
};

export const getVisitorStats = async () => {
  const appAnalytics = await prisma.appAnalytics.findUnique({
    where: { id: 1 },
  });

  const totalSignedUpUsers = await prisma.user.count();

  const totalConsiliariClicks = await prisma.user.count({
    where: {
      consiliari_clicked: true,
    },
  });

  const totalJobAnalyses = await prisma.job.count();

  const averageJobAnalysisPerUser =
    totalSignedUpUsers > 0
      ? (totalJobAnalyses / totalSignedUpUsers).toFixed(2)
      : 0;

  return {
    totalAppVisits: appAnalytics?.totalAppVisits || 0,
    totalGuestResumeAnalysis: appAnalytics?.totalGuestResumeAnalysis || 0,
    fixAtsOrCustomizedClicked: appAnalytics?.fixAtsOrCustomizedClicked || 0,
    signupButtonClicked: appAnalytics?.signupButtonClicked || 0,
    totalSignedUpUsers,
    totalConsiliariClicks,
    totalJobAnalyses,
    averageJobAnalysisPerUser: parseFloat(averageJobAnalysisPerUser),
  };
};

