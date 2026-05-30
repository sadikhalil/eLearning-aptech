from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ── Lesson Schemas ─────────────────────────────────────────────────────────────

class LessonCreate(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    order: int = 0
    is_preview: bool = False


class LessonResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    video_url: Optional[str]
    duration: int
    order: int
    is_preview: bool
    is_published: bool

    class Config:
        from_attributes = True


class LessonProgressResponse(LessonResponse):
    watched_percent: float = 0.0
    is_completed: bool = False
    watch_time_seconds: int = 0


# ── Assignment Schemas ─────────────────────────────────────────────────────────

class AssignmentCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    due_date: Optional[datetime] = None


class AssignmentResponse(BaseModel):
    id: int
    course_id: int
    title: str
    description: Optional[str]
    due_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Course Schemas ─────────────────────────────────────────────────────────────

class CourseCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    price: float = Field(default=0.0, ge=0)
    is_free: bool = False
    level: str = "beginner"
    category: Optional[str] = None


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    is_free: Optional[bool] = None
    level: Optional[str] = None
    category: Optional[str] = None
    is_published: Optional[bool] = None


class CourseResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    thumbnail_url: Optional[str]
    price: float
    is_free: bool
    is_published: bool
    level: str
    category: Optional[str]
    total_duration: int
    instructor_id: int
    created_at: datetime
    lessons: List[LessonResponse] = []
    assignments: List[AssignmentResponse] = []

    class Config:
        from_attributes = True


class CourseListResponse(BaseModel):
    id: int
    title: str
    thumbnail_url: Optional[str]
    price: float
    is_free: bool
    level: str
    category: Optional[str]
    instructor_id: int
    total_duration: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Enrollment Schemas ─────────────────────────────────────────────────────────

class EnrollmentResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    is_paid: bool
    enrolled_at: datetime
    is_completed: bool

    class Config:
        from_attributes = True


# ── Progress Schemas ───────────────────────────────────────────────────────────

class ProgressUpdate(BaseModel):
    watched_percent: float = Field(..., ge=0, le=100)
    watch_time_seconds: int = Field(..., ge=0)


class ProgressResponse(BaseModel):
    lesson_id: int
    course_id: int
    watched_percent: float
    watch_time_seconds: int
    is_completed: bool
    last_watched_at: datetime

    class Config:
        from_attributes = True


class CourseProgressResponse(BaseModel):
    course_id: int
    total_lessons: int
    completed_lessons: int
    overall_percent: float
    lessons: List[LessonProgressResponse] = []