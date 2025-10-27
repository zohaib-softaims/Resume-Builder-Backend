export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const errorMessage = result.error.errors[0].message;
    return res.status(400).json({
      success: false,
      message: errorMessage,
    });
  }

  req.body = result.data;
  next();
};
