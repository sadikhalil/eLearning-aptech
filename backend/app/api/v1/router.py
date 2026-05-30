from fastapi import APIRouter
from app.api.v1.endpoints import auth, courses, enrollments, progress, users, admin

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(courses.router)
api_router.include_router(enrollments.router)
api_router.include_router(progress.router)
api_router.include_router(users.router)
api_router.include_router(admin.router)