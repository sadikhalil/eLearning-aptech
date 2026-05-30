from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.lesson import Lesson


def get_course_or_404(db: Session, course_id: int) -> Course:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


def is_enrolled(db: Session, user_id: int, course_id: int) -> bool:
    return db.query(Enrollment).filter(
        Enrollment.student_id == user_id,
        Enrollment.course_id  == course_id
    ).first() is not None


def get_course_completion_percent(db: Session, user_id: int, course_id: int) -> float:
    """Calculate overall completion percent for a user in a course."""
    total = db.query(Lesson).filter(
        Lesson.course_id    == course_id,
        Lesson.is_published == True
    ).count()
    if total == 0:
        return 0.0
    from app.models.progress import Progress
    completed = db.query(Progress).filter(
        Progress.user_id   == user_id,
        Progress.course_id == course_id,
        Progress.is_completed == True
    ).count()
    return round((completed / total) * 100, 1)


def update_course_duration(db: Session, course_id: int):
    """Recalculate and update total course duration from all lessons."""
    lessons = db.query(Lesson).filter(Lesson.course_id == course_id).all()
    total   = sum(l.duration or 0 for l in lessons)
    db.query(Course).filter(Course.id == course_id).update({"total_duration": total})
    db.commit()