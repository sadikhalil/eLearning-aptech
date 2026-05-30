from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.progress import Progress

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats")
def get_platform_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """
    Platform-wide analytics. Admin only.
    Returns total users, courses, enrollments, revenue.
    """
    total_users       = db.query(func.count(User.id)).scalar()
    total_courses     = db.query(func.count(Course.id)).scalar()
    published_courses = db.query(func.count(Course.id)).filter(Course.is_published == True).scalar()
    total_enrollments = db.query(func.count(Enrollment.id)).scalar()
    total_completions = db.query(func.count(Enrollment.id)).filter(Enrollment.is_completed == True).scalar()
    total_revenue     = db.query(func.sum(Enrollment.amount_paid)).scalar() or 0.0

    completion_rate = (
        round((total_completions / total_enrollments) * 100, 1)
        if total_enrollments > 0 else 0.0
    )

    return {
        "total_users":        total_users,
        "total_courses":      total_courses,
        "published_courses":  published_courses,
        "total_enrollments":  total_enrollments,
        "total_completions":  total_completions,
        "completion_rate":    completion_rate,
        "total_revenue":      round(total_revenue, 2),
    }


@router.get("/recent-enrollments")
def recent_enrollments(
    limit: int = 10,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Get most recent enrollments with user and course info."""
    enrollments = (
        db.query(Enrollment)
        .order_by(Enrollment.enrolled_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id":          e.id,
            "student":     e.student.full_name if e.student else "Unknown",
            "course":      e.course.title      if e.course  else "Unknown",
            "enrolled_at": e.enrolled_at,
            "is_paid":     e.is_paid,
            "amount_paid": e.amount_paid,
        }
        for e in enrollments
    ]


@router.get("/top-courses")
def top_courses(
    limit: int = 5,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Get top courses by enrollment count."""
    results = (
        db.query(Course, func.count(Enrollment.id).label("enrollment_count"))
        .outerjoin(Enrollment, Course.id == Enrollment.course_id)
        .group_by(Course.id)
        .order_by(func.count(Enrollment.id).desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id":               c.id,
            "title":            c.title,
            "enrollment_count": count,
            "price":            c.price,
            "is_free":          c.is_free,
        }
        for c, count in results
    ]


@router.get("/users-summary")
def users_summary(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin)
):
    """Breakdown of users by role."""
    students    = db.query(func.count(User.id)).filter(User.role == "student").scalar()
    instructors = db.query(func.count(User.id)).filter(User.role == "instructor").scalar()
    admins      = db.query(func.count(User.id)).filter(User.role == "admin").scalar()
    active      = db.query(func.count(User.id)).filter(User.is_active == True).scalar()
    inactive    = db.query(func.count(User.id)).filter(User.is_active == False).scalar()

    return {
        "by_role":   {"students": students, "instructors": instructors, "admins": admins},
        "by_status": {"active": active, "inactive": inactive},
    }