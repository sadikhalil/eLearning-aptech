from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.api.v1.router import api_router

# Import all models so tables get created
from app.models.user       import User       # noqa
from app.models.course     import Course     # noqa
from app.models.lesson     import Lesson     # noqa
from app.models.enrollment import Enrollment # noqa
from app.models.progress   import Progress   # noqa

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="LearnFlow E-Learning Platform API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # allow all origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ─────────────────────────────────────────────────────────────────────
app.include_router(api_router)


# ── Startup ────────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)
    print(f"✅ {settings.APP_NAME} started successfully")


# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "app":     settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status":  "running",
        "docs":    "/docs"
    }


@app.get("/health")
def health():
    return {"status": "ok"}