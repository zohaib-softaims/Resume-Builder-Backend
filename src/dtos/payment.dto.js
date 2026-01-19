export const checkoutSessionDto = (session) => {
  return {
    sessionId: session.id,
    url: session.url,
  };
};
