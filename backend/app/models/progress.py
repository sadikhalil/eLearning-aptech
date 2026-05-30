from sqlalchemy import Column, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Progress(Base):
    __tablename__ = "progress"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id       = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    course_id       = Column(Integer, ForeignKey("courses.id"), nullable=False)

    # How far in the video (0.0 to 100.0)
    watched_percent = Column(Float, default=0.0)

    # Seconds watched (for resuming)
    watch_time_seconds = Column(Integer, default=0)

    # True when watched_percent >= 90
    is_completed    = Column(Boolean, default=False)

    last_watched_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at    = Column(DateTime(timezone=True), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user   = relationship("User", back_populates="progress")
    lesson = relationship("Lesson", back_populates="progress")

    def __repr__(self):
        return f"<Progress user={self.user_id} lesson={self.lesson_id} {self.watched_percent}%>"