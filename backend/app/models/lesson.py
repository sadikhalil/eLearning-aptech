from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Lesson(Base):
    __tablename__ = "lessons"

    id            = Column(Integer, primary_key=True, index=True)
    course_id     = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title         = Column(String(200), nullable=False)
    description   = Column(Text, nullable=True)
    video_url     = Column(String(500), nullable=True)    # Cloudinary URL
    video_public_id = Column(String(300), nullable=True)  # Cloudinary public_id for deletion
    duration      = Column(Integer, default=0)            # duration in seconds
    order         = Column(Integer, default=0)            # position in course
    is_preview    = Column(Boolean, default=False)        # free preview lesson
    is_published  = Column(Boolean, default=False)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    course   = relationship("Course", back_populates="lessons")
    progress = relationship("Progress", back_populates="lesson")

    def __repr__(self):
        return f"<Lesson id={self.id} title={self.title} order={self.order}>"