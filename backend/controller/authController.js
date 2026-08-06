import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import authService from '../services/authServices.js';

export const authController = {
  register: asyncHandler(async (req, res) => {
    const { email, password, full_name } = req.body;
    const result = await authService.register(email, password, full_name);
console.log('User registered successfully', result);
    return ApiResponse.success(
      res,
      result,
      'User registered successfully',
      201
    );
  }),

  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return ApiResponse.success(res, result, 'Login successful');
  }),

  logout: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    await authService.logout(userId);

    res.clearCookie('refreshToken');

    return ApiResponse.success(res, null, 'Logout successful');
  }),

  refreshToken: asyncHandler(async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return ApiResponse.error(res, 'Refresh token not found', 401);
    }

    const result = await authService.refreshAccessToken(refreshToken);

    return ApiResponse.success(res, result, 'Token refreshed successfully');
  }),

  logoutAllDevices: asyncHandler(async (req, res) => {
    const userId = req.user.id;
    await authService.logout(userId);

    res.clearCookie('refreshToken');

    return ApiResponse.success(res, null, 'Logged out from all devices');
  }),

  googleCallback: asyncHandler(async (req, res) => {
    const result = await authService.handleGoogleAuth(req.user);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Redirect to frontend with tokens
    // const redirectUrl =  `${process.env.FRONTEND_URL}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
    const redirectUrl =
  `${process.env.FRONTEND_URL}/auth/callback` +
  `?accessToken=${encodeURIComponent(result.accessToken)}` +
  `&refreshToken=${encodeURIComponent(result.refreshToken)}`;
    res.redirect(redirectUrl);
  }),

  githubCallback: asyncHandler(async (req, res) => {
    const result = await authService.handleGithubAuth(req.user);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const redirectUrl = `${process.env.FRONTEND_URL}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
    res.redirect(redirectUrl);
  }),

  getCurrentUser: asyncHandler(async (req, res) => {
    return ApiResponse.success(res, req.user, 'User fetched successfully');
  }),
};

export default authController;