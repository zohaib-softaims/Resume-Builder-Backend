export const userDto = (user) => {
  return {
    id: user?.id,
    email: user?.email,
    full_name: user?.full_name || "",
    email_verified: user?.email_verified || false,
    is_onboarding_completed: user?.is_onboarding_completed || false,
    profile_picture: user?.profile_picture || null,
    stripeCustomerId: user?.stripeCustomerId,
  };
};
