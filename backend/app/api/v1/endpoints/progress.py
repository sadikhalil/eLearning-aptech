from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.lesson import Lesson
from app.models.progress import Progress
from app.models.enrollment import Enrollment
from app.schemas.course import ProgressUpdate, ProgressResponse, CourseProgressResponse

router = APIRouter(prefix="/progress", tags=["Progress Tracking"])


@router.post("/{lesson_id}", response_model=ProgressResponse)
def update_progress(
    lesson_id: int,
    payload: ProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Called by the video player every few seconds.
    - Creates or updates the progress record for this lesson
    - Auto-marks lesson complete when watched >= 90%
    - Updates course completion status
    Frontend sends: { watched_percent: 45.5, watch_time_seconds: 273 }
    """
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Must be enrolled
    enrolled = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == lesson.course_id
    ).first()
    if not enrolled:
        raise HTTPException(status_code=403, detail="Not enrolled in this course")

    # Get or create progress record
    prog = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.lesson_id == lesson_id
    ).first()

    if not prog:
        prog = Progress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            course_id=lesson.course_id
        )
        db.add(prog)

    # Only update if further ahead than before
    if payload.watched_percent > prog.watched_percent:
        prog.watched_percent = payload.watched_percent
        prog.watch_time_seconds = payload.watch_time_seconds

    prog.last_watched_at = datetime.utcnow()

    # Auto-complete at 90%
    if payload.watched_percent >= 90 and not prog.is_completed:
        prog.is_completed = True
        prog.completed_at = datetime.utcnow()

        # Check if entire course is now complete
        all_lessons = db.query(Lesson).filter(
            Lesson.course_id == lesson.course_id,
            Lesson.is_published == True
        ).all()
        lesson_ids = [l.id for l in all_lessons]

        completed = db.query(Progress).filter(
            Progress.user_id == current_user.id,
            Progress.lesson_id.in_(lesson_ids),
            Progress.is_completed == True
        ).count()

        if completed >= len(lesson_ids):
            enrolled.is_completed = True
            enrolled.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(prog)
    return prog


@router.get("/course/{course_id}", response_model=CourseProgressResponse)
def get_course_progress(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get full progress breakdown for a course.
    Returns per-lesson progress + overall completion percentage.
    """
    lessons = db.query(Lesson).filter(
        Lesson.course_id == course_id,
        Lesson.is_published == True
    ).order_by(Lesson.order).all()

    if not lessons:
        raise HTTPException(status_code=404, detail="No lessons found")

    progress_records = db.query(Progress).filter(
        Progress.user_id == current_user.id,
        Progress.course_id == course_id
    ).all()

    progress_map = {p.lesson_id: p for p in progress_records}
    completed = sum(1 for p in progress_records if p.is_completed)

    lesson_data = []
    for lesson in lessons:
        p = progress_map.get(lesson.id)
        lesson_data.append({
            "id": lesson.id,
            "title": lesson.title,
            "description": lesson.description,
            "video_url": lesson.video_url,
            "duration": lesson.duration,
            "order": lesson.order,
            "is_preview": lesson.is_preview,
            "is_published": lesson.is_published,
            "watched_percent": p.watched_percent if p else 0.0,
            "is_completed": p.is_completed if p else False,
            "watch_time_seconds": p.watch_time_seconds if p else 0
        })

    overall = (completed / len(lessons) * 100) if lessons else 0

    return CourseProgressResponse(
        course_id=course_id,
        total_lessons=len(lessons),
        completed_lessons=completed,
        overall_percent=round(overall, 1),
        lessons=lesson_data
    )