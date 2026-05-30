from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum


class UserRole(str, enum.Enum):
    student = "student"
    instructor = "instructor"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id              = Column(Integer, primary_key=True, index=True)
    full_name       = Column(String(100), nullable=False)
    email           = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role            = Column(String(20), default=UserRole.student, nullable=False)
    avatar_url      = Column(String(500), nullable=True)
    bio             = Column(String(500), nullable=True)
    is_active       = Column(Boolean, default=True)
    is_verified     = Column(Boolean, default=False)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    updated_at      = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    # Courses created by this user (if instructor)
    courses_created = relationship(
        "Course", back_populates="instructor", foreign_keys="Course.instructor_id"
    )
    # Courses this user is enrolled in (if student)
    enrollments = relationship("Enrollment", back_populates="student")
    # Lesson progress records
    progress = relationship("Progress", back_populates="user")

    def __repr__(self):
        return f"<User id={self.id} email={self.email} role={self.role}>"