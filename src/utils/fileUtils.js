export const extractOriginalFileName = (fileUrl) => {
  if (!fileUrl) return "";

  const urlParts = fileUrl.split("/");
  const fileNameWithUuid = urlParts[urlParts.length - 1] || "";

  // Remove UUID from filename (format: originalName_uuid.pdf)
  const lastUnderscoreIndex = fileNameWithUuid.lastIndexOf("_");

  return lastUnderscoreIndex !== -1
    ? fileNameWithUuid.substring(0, lastUnderscoreIndex) +
        fileNameWithUuid.substring(fileNameWithUuid.lastIndexOf("."))
    : fileNameWithUuid;
};
