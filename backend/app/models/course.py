from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Course(Base):
    __tablename__ = "courses"

    id            = Column(Integer, primary_key=True, index=True)
    title         = Column(String(200), nullable=False, index=True)
    description   = Column(Text, nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    price         = Column(Float, default=0.0)
    is_free       = Column(Boolean, default=False)
    is_published  = Column(Boolean, default=False)
    level         = Column(String(20), default="beginner")   # beginner | intermediate | advanced
    category      = Column(String(100), nullable=True)
    total_duration= Column(Integer, default=0)               # total seconds
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    instructor  = relationship("User", back_populates="courses_created", foreign_keys=[instructor_id])
    lessons     = relationship("Lesson", back_populates="course", cascade="all, delete-orphan", order_by="Lesson.order")
    enrollments = relationship("Enrollment", back_populates="course")
    assignments = relationship("Assignment", back_populates="course", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Course id={self.id} title={self.title}>"