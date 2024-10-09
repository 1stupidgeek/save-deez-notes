import { NextRequest } from "next/server";

interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
}

interface RequestData {
  count: number;
  resetTime: number;
}

const ipRequestMap = new Map<string, RequestData>();

export function createRateLimiter({
  maxRequests,
  windowMs,
}: RateLimiterOptions) {
  return function rateLimiter(req: NextRequest) {
    const now = Date.now();
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    let requestData = ipRequestMap.get(ip) || {
      count: 0,
      resetTime: now + windowMs,
    };

    if (now > requestData.resetTime) {
      requestData = { count: 1, resetTime: now + windowMs };
    } else {
      requestData.count++;
    }

    ipRequestMap.set(ip, requestData);

    if (requestData.count > maxRequests) {
      return false;
    }
    return true;
  };
}
