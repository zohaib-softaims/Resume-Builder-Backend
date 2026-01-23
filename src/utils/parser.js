// Extract filename from S3 URL and clean name before first underscore
  export const getFileNameFromUrl = (url) => {
    if (!url) return "Unknown Resume.pdf";
    try {
      const urlParts = url.split("/");
      const filename = decodeURIComponent(urlParts[urlParts.length - 1]);
      const match = filename.match(/^(.*?)_/);
      if (match && match[1]) {
        return match[1].trim();
      }
      return filename;
    } catch (error) {
      return "Resume.pdf";
    }
  };