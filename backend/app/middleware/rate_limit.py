from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
from datetime import datetime, timedelta
import asyncio


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    IP-based rate limiting middleware.

    Tracks request counts per IP per minute using an in-memory dict.
    Two tiers of limits:
      - Auth routes  (/auth/login, /auth/register): 10 requests/minute
      - All other routes: 100 requests/minute

    How it works:
      1. Every request comes in with a client IP
      2. We check how many requests that IP made in the last 60 seconds
      3. If over the limit → return 429 with retry-after header
      4. Expired entries are cleaned up every 5 minutes

    Note: For production with multiple workers, use Redis instead
    of this in-memory store so limits are shared across processes.

    Usage in main.py:
        from app.middleware.rate_limit import RateLimitMiddleware
        app.add_middleware(RateLimitMiddleware)
    """

    def __init__(self, app):
        super().__init__(app)
        # { ip: [(timestamp, count), ...] }
        self.request_log: dict = defaultdict(list)
        self.window_seconds = 60

        # Route-specific limits
        self.strict_limit = 10    # for auth routes
        self.default_limit = 100  # for all other routes

        # Strict paths (brute-force targets)
        self.strict_paths = [
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/refresh",
        ]

        # Start background cleanup task
        asyncio.create_task(self._cleanup_loop())

    def _get_limit(self, path: str) -> int:
        """Return the rate limit for this path."""
        for strict_path in self.strict_paths:
            if path.startswith(strict_path):
                return self.strict_limit
        return self.default_limit

    def _count_recent(self, ip: str) -> int:
        """Count requests from this IP in the last 60 seconds."""
        now = datetime.utcnow()
        cutoff = now - timedelta(seconds=self.window_seconds)
        # Keep only entries within the window
        self.request_log[ip] = [
            ts for ts in self.request_log[ip] if ts > cutoff
        ]
        return len(self.request_log[ip])

    async def dispatch(self, request: Request, call_next):
        # Get real client IP (handles proxies/load balancers)
        client_ip = (
            request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
            or request.headers.get("X-Real-IP", "")
            or (request.client.host if request.client else "unknown")
        )

        path = request.url.path
        limit = self._get_limit(path)
        count = self._count_recent(client_ip)

        if count >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Limit is {limit} per minute.",
                headers={"Retry-After": "60"}
            )

        # Log this request
        self.request_log[client_ip].append(datetime.utcnow())

        # Add rate limit headers to response
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, limit - count - 1))
        response.headers["X-RateLimit-Window"] = "60s"
        return response

    async def _cleanup_loop(self):
        """Remove stale IPs from memory every 5 minutes."""
        while True:
            await asyncio.sleep(300)
            now = datetime.utcnow()
            cutoff = now - timedelta(seconds=self.window_seconds)
            stale = [
                ip for ip, timestamps in self.request_log.items()
                if not any(ts > cutoff for ts in timestamps)
            ]
            for ip in stale:
                del self.request_log[ip]