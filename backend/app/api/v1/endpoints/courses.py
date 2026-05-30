from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.core.dependencies import get_current_user, require_instructor
from app.models.user import User
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.enrollment import Enrollment
from app.models.progress import Progress
from app.models.assignment import Assignment
from app.schemas.course import (
    CourseCreate, CourseUpdate, CourseResponse, CourseListResponse,
    LessonCreate, LessonResponse, AssignmentCreate, AssignmentResponse
)
from app.services.upload_service import upload_video, upload_image

router = APIRouter(prefix="/courses", tags=["Courses"])


# ── List & Get Courses (Public) ────────────────────────────────────────────────

@router.get("/", response_model=List[CourseListResponse])
def list_courses(
    category: Optional[str] = None,
    level:    Optional[str] = None,
    search:   Optional[str] = None,
    skip:     int = 0,
    limit:    int = 20,
    db: Session = Depends(get_db)
):
    """
    Public course catalog.
    Shows ALL courses (published and unpublished) during development.
    In production change to: filter(Course.is_published == True)
    """
    query = db.query(Course)

    if category:
        query = query.filter(Course.category == category)
    if level:
        query = query.filter(Course.level == level)
    if search:
        query = query.filter(Course.title.ilike(f"%{search}%"))

    return query.offset(skip).limit(limit).all()


@router.get("/my-courses", response_model=List[CourseListResponse])
def get_my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor)
):
    """Get all courses created by the logged in instructor/admin."""
    return db.query(Course).filter(
        Course.instructor_id == current_user.id
    ).all()


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get a single course with all its lessons."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.get("/{course_id}/assignments", response_model=List[AssignmentResponse])
def get_course_assignments(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not your course")
    return course.assignments


@router.post("/{course_id}/assignments", response_model=AssignmentResponse, status_code=201)
def create_assignment(
    course_id: int,
    payload: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not your course")

    assignment = Assignment(course_id=course_id, **payload.model_dump(exclude_none=True))
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.get("/{course_id}/students")
def get_course_students(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor)
):
    """Get enrolled students and their course progress."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not your course")

    students = []
    total_lessons = len(course.lessons)

    for enrollment in course.enrollments:
        student = enrollment.student
        if not student:
            continue

        progress_rows = db.query(Progress).filter(
            Progress.user_id == student.id,
            Progress.course_id == course_id
        ).all()

        completed_lessons = sum(1 for p in progress_rows if p.is_completed)
        overall_percent = (
            round((completed_lessons / total_lessons) * 100, 1)
            if total_lessons > 0 else 0.0
        )
        last_activity = None
        if progress_rows:
            last_activity = max(p.last_watched_at for p in progress_rows if p.last_watched_at)

        students.append({
            "id": student.id,
            "full_name": student.full_name,
            "email": student.email,
            "overall_percent": overall_percent,
            "completed_lessons": completed_lessons,
            "total_lessons": total_lessons,
            "last_activity": last_activity,
        })

    return students


# ── Create & Manage Courses (Instructor/Admin only) ────────────────────────────

@router.post("/", response_model=CourseResponse, status_code=201)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor)
):
    """
    Create a new course.
    Auto-published so it immediately appears in the catalog.
    Instructor/Admin only.
    """
    course = Course(
        **payload.model_dump(),
        instructor_id=current_user.id,
        is_published=True       # auto publish so it shows immediately
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.put("/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    payload: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor)
):
    """Update course details. Only the course owner or admin can update."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not your course")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(course, field, value)

    db.commit()
    db.refresh(course)
    return course


@router.patch("/{course_id}/publish")
def publish_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor)
):
    """Publish a course so it appears in the catalog."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not your course")
    course.is_published = True
    db.commit()
    return {"message": "Course published successfully", "course_id": course_id}


@router.patch("/{course_id}/unpublish")
def unpublish_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor)
):
    """Unpublish a course — hides it from the catalog."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not your course")
    course.is_published = False
    db.commit()
    return {"message": "Course unpublished", "course_id": course_id}


@router.delete("/{course_id}", status_code=204)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor)
):
    """Delete a course and all its lessons."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not your course")
    db.delete(course)
    db.commit()


@router.post("/{course_id}/thumbnail")
async def upload_thumbnail(
    course_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor)
):
    """Upload course thumbnail image to Cloudinary."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    url = await upload_image(file, folder="course_thumbnails")
    course.thumbnail_url = url
    db.commit()
    return {"thumbnail_url": url}


# ── Lesson Management ──────────────────────────────────────────────────────────

@router.post("/{course_id}/lessons", response_model=LessonResponse, status_code=201)
def add_lesson(
    course_id: int,
    payload: LessonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor)
):
    """Add a new lesson to a course."""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    if course.instructor_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not your course")

    lesson = Lesson(course_id=course_id, **payload.model_dump())
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.post("/{course_id}/lessons/{lesson_id}/video")
async def upload_lesson_video(
    course_id: int,
    lesson_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_instructor)
):
    """Upload a video file for a lesson to Cloudinary."""
    lesson = db.query(Lesson).filter(
        Lesson.id == lesson_id,
        Lesson.course_id == course_id
    ).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    result = await upload_video(file, folder=f"courses/{course_id}/lessons")
    lesson.video_url      = result["url"]
    lesson.video_public_id = result["public_id"]
    lesson.duration       = result.get("duration", 0)
    lesson.is_published   = True

    # Update total course duration
    course = db.query(Course).filter(Course.id == course_id).first()
    all_lessons = db.query(Lesson).filter(Lesson.course_id == course_id).all()
    course.total_duration = sum(l.duration for l in all_lessons)

    db.commit()
    return {"video_url": result["url"], "duration": result.get("duration", 0)}