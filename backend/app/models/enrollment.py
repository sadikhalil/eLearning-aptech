from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, Float, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Enrollment(Base):
    __tablename__ = "enrollments"

    id            = Column(Integer, primary_key=True, index=True)
    student_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id     = Column(Integer, ForeignKey("courses.id"), nullable=False)
    is_paid       = Column(Boolean, default=False)
    amount_paid   = Column(Float, default=0.0)
    stripe_payment_id = Column(String(200), nullable=True)
    enrolled_at   = Column(DateTime(timezone=True), server_default=func.now())
    completed_at  = Column(DateTime(timezone=True), nullable=True)
    is_completed  = Column(Boolean, default=False)
    certificate_issued = Column(Boolean, default=False)

    # Relationships
    student = relationship("User", back_populates="enrollments")
    course  = relationship("Course", back_populates="enrollments")

    def __repr__(self):
        return f"<Enrollment student={self.student_id} course={self.course_id}>"