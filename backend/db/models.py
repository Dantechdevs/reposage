from sqlalchemy import Column, String, Text, Integer, DateTime, Boolean
from sqlalchemy.sql import func
from db.database import Base
import uuid


class Explanation(Base):
    __tablename__ = "explanations"

    id           = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    repo_url     = Column(String, nullable=False, index=True)
    owner        = Column(String, nullable=False)
    repo         = Column(String, nullable=False)
    explanation  = Column(Text, nullable=False)
    stars        = Column(Integer, default=0)
    language     = Column(String, default="")
    share_id     = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4())[:8])
    is_public    = Column(Boolean, default=True)
    view_count   = Column(Integer, default=0)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())

    def to_dict(self):
        return {
            "id":          self.id,
            "repo_url":    self.repo_url,
            "owner":       self.owner,
            "repo":        self.repo,
            "explanation": self.explanation,
            "stars":       self.stars,
            "language":    self.language,
            "share_id":    self.share_id,
            "is_public":   self.is_public,
            "view_count":  self.view_count,
            "created_at":  str(self.created_at),
        }