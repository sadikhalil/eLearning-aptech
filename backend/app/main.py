from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.api.v1.router import api_router

# Import all models so Alembic and Base.metadata.create_all can see them
from app.models import user, course, lesson, enrollment, progress, assignment  # noqa

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="E-Learning Platform API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ─── CORS Middleware ───────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ────────────────────────────────────────────────────────────────────
app.include_router(api_router)


# ─── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    # Creates all tables if they don't exist
    # In production use Alembic migrations instead
    Base.metadata.create_all(bind=engine)
    print(f"✅ {settings.APP_NAME} started")
    print(f"📚 Docs available at http://localhost:8000/docs")


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health")
def health():
    return {"status": "ok"}