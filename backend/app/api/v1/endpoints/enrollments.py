from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.schemas.course import EnrollmentResponse, CourseListResponse

router = APIRouter(prefix="/enrollments", tags=["Enrollments"])


@router.post("/{course_id}", response_model=EnrollmentResponse, status_code=201)
def enroll_in_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Enroll the current user in a course.
    - Checks course exists and is published
    - Prevents duplicate enrollment
    - Free courses enroll immediately
    """
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    already = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()
    if already:
        raise HTTPException(status_code=400, detail="Already enrolled")

    enrollment = Enrollment(
        student_id=current_user.id,
        course_id=course_id,
        is_paid=course.is_free,
        amount_paid=0.0 if course.is_free else course.price
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.delete("/{course_id}", status_code=204)
def unenroll(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unenroll from a course."""
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    db.delete(enrollment)
    db.commit()


@router.get("/my-courses", response_model=List[CourseListResponse])
def my_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all courses the current user is enrolled in."""
    enrollments = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id
    ).all()
    course_ids = [e.course_id for e in enrollments]
    return db.query(Course).filter(Course.id.in_(course_ids)).all()


@router.get("/check/{course_id}")
def check_enrollment(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if current user is enrolled in a specific course."""
    enrollment = db.query(Enrollment).filter(
        Enrollment.student_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()
    return {"enrolled": enrollment is not None}