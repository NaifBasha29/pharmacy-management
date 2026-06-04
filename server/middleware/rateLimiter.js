import rateLimit from 'express-rate-limit';

// Rate limiter for login attempts - prevents brute force attacks
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    validate: { xForwardedForHeader: false },
    keyGenerator: (req) => {
        const identifier = req.body.email || req.body.username || req.body.patientId || '';
        return `${req.ip}-${identifier}`;
    }
});

// General API rate limiter - prevents abuse
export const apiRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: {
        success: false,
        message: 'Too many requests. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Strict rate limiter for sensitive operations
export const strictRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 attempts per hour
    message: {
        success: false,
        message: 'Too many attempts. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

export default { loginRateLimiter, apiRateLimiter, strictRateLimiter };
