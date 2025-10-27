export const sanitizedText = (str) => {
  return str.replace(/\u0000/g, "");
};
