const throttleData = new Map();

export function throttle({
  windowMs = 60 * 1000,
  delayAfter = 10,
  delayMs = 100,
  maxRequests = 50,
} = {}) {
  return (req, res, next) => {
    const now = Date.now();
    const ip = req.ip;

    let data = throttleData.get(ip);

    // Start a new request window
    if (!data || now - data.windowStart >= windowMs) {
      data = {
        requestCount: 0,
        windowStart: now,
      };
    }

    // Hard request limit
    if (data.requestCount >= maxRequests) {
      return res.status(429).json({
        message: "Too many requests. Please try again later.",
      });
    }

    data.requestCount++;

    throttleData.set(ip, data);

    // No delay before delayAfter
    if (data.requestCount <= delayAfter) {
      return next();
    }

    // Progressive delay after delayAfter
    const delay = (data.requestCount - delayAfter) * delayMs;

    setTimeout(next, delay);
  };
}
