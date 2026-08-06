export class ApiResponse {
    static success(res, data = null, message = 'Success', statusCode = 200) {
      return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
      });
    }
  
    static error(res, message = 'Error', statusCode = 400, errors = null) {
      return res.status(statusCode).json({
        success: false,
        message,
        errors,
        timestamp: new Date().toISOString(),
      });
    }
  
    static paginated(res, data, total, page, limit, message = 'Success') {
      const totalPages = Math.ceil(total / limit);
      return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  export default ApiResponse;