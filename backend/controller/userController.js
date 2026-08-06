import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import userService from '../services/userServices.js';

export const userController = {
  getProfile: asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user.id);
    return ApiResponse.success(res, user, 'Profile fetched successfully');
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user.id, req.body);
    return ApiResponse.success(res, user, 'Profile updated successfully');
  }),

  deleteAccount: asyncHandler(async (req, res) => {
    console.log("req.user.id", req.user.id);
    const result = await userService.deleteAccount(req.user.id);
    return ApiResponse.success(res, result, 'Account deleted successfully');
  }),

  getDashboard: asyncHandler(async (req, res) => {
    const dashboard = await userService.getDashboard(req.user.id);
    return ApiResponse.success(res, dashboard, 'Dashboard data fetched successfully');
  }),

  getActivity: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const activity = await userService.getUserActivity(
      req.user.id,
      (page - 1) * limit,
      limit
    );

    return ApiResponse.paginated(
      res,
      activity.activity,
      activity.total,
      page,
      limit,
      'Activity fetched successfully'
    );
  }),

  getAllUsers: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { users, total } = await userService.getAllUsers(
      (page - 1) * limit,
      limit
    );

    return ApiResponse.paginated(
      res,
      users,
      total,
      page,
      limit,
      'Users fetched successfully'
    );
  }),

  changePassword: asyncHandler(async (req, res) => {
    const result = await userService.changePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword
    );
  
    return ApiResponse.success(res, result, 'Password updated successfully');
  }),

  getUserAnalytics: asyncHandler(async (req, res) => {
    const analytics = await userService.getUserAnalytics(req.user.id);
    return ApiResponse.success(res, analytics, 'Analytics fetched successfully');
  }),
};

export default userController;