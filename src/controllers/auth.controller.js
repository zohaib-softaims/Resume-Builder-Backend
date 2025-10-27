import { catchAsync } from "../utils/error.js";
import { userDto } from "../dtos/auth.dto.js";

export const signup = catchAsync(async (req, res, next) => {
  const { email, password, full_name } = req.body;

  res.status(201).json({
    success: true,
    message: "Registration successful. Please check your email for verification.",
    data: {
      user: userDto(req.body),
    },
  });
});
