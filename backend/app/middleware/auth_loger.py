from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
import time
import logging

# Configure logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("learnflow")


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    """
    Logs every incoming HTTP request with:
      - HTTP method + path
      - Client IP address
      - Response status code
      - Time taken in milliseconds

    Specifically warns on:
      - 401 Unauthorized  → invalid/missing JWT
      - 403 Forbidden     → valid JWT but wrong role
      - 429 Too Many Req  → rate limit hit
      - 500 Server Error  → unhandled exception

    Usage in main.py:
        from app.middleware.auth_logger import RequestLoggerMiddleware
        app.add_middleware(RequestLoggerMiddleware)
    """

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        # Get client IP
        client_ip = (
            request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
            or (request.client.host if request.client else "unknown")
        )

        # Process the request
        response = await call_next(request)

        # Calculate duration
        duration_ms = round((time.time() - start_time) * 1000, 2)
        status_code = response.status_code
        method = request.method
        path = request.url.path

        log_msg = f"{method} {path} | {status_code} | {duration_ms}ms | IP: {client_ip}"

        # Log level based on status code
        if status_code >= 500:
            logger.error(f"SERVER ERROR   | {log_msg}")
        elif status_code == 429:
            logger.warning(f"RATE LIMITED   | {log_msg}")
        elif status_code == 403:
            logger.warning(f"FORBIDDEN      | {log_msg}")
        elif status_code == 401:
            logger.warning(f"UNAUTHORIZED   | {log_msg}")
        elif status_code >= 400:
            logger.warning(f"CLIENT ERROR   | {log_msg}")
        else:
            logger.info(f"OK             | {log_msg}")

        return response