export default {
  apps: [
    {
      name: "api",
      script: "src/index.js",
    },
    {
      name: "generate-coach-insights-worker",
      script: "src/bull/workers/coachInsights.worker.js",
    },
  ],
};
