# Import all models here so Alembic can detect them for migrations
from app.db.database import Base  # noqa
from app.models.user       import User        # noqa
from app.models.course     import Course      # noqa
from app.models.lesson     import Lesson      # noqa
from app.models.enrollment import Enrollment  # noqa
from app.models.progress   import Progress    # noqa
from app.models.assignment import Assignment  # noqa