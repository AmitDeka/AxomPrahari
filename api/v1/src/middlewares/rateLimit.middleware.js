import rateLimit from 'express-rate-limit';

/**
 * Specific rate limiter for OTP login endpoints.
 * Limits to 3 requests per 5 minutes per IP address.
 */
export const otpRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 3 requests per `windowMs`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 'error',
    message: 'Too many OTP requests from this IP. Please try again after 5 minutes.',
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});

/**
 * General API rate limiter (optional but recommended for global protection)
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `windowMs`
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  }
});

/**
 * Specific rate limiter for Citizen Violation Reports & Uploads.
 * Limits to 5 reports per hour per IP.
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per `windowMs`
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'You have reached the maximum number of violation reports allowed per hour to prevent spam. Please try again later.',
  },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});
