from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings


def setup_cors(app):
    """
    Configure Cross-Origin Resource Sharing (CORS).

    This allows the React frontend (localhost:5173) to make
    requests to the FastAPI backend (localhost:8000).

    In production:
    - Replace localhost origins with your actual domain
    - Be more restrictive with allowed methods if needed

    Called once in main.py:
        from app.middleware.cors import setup_cors
        setup_cors(app)
    """
    app.add_middleware(
        CORSMiddleware,
        # Allowed frontend origins
        allow_origins=settings.CORS_ORIGINS,

        # Required for sending cookies or Authorization headers
        allow_credentials=True,

        # Allow all standard HTTP methods
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

        # Allow all headers including Authorization (Bearer token)
        allow_headers=[
            "Content-Type",
            "Authorization",
            "Accept",
            "Origin",
            "X-Requested-With",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers",
        ],

        # How long browser can cache the preflight response (1 hour)
        max_age=3600,
    )