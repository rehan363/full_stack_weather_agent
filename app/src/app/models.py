from sqlalchemy import Column, Integer, String, Float,Text, DateTime
from datetime import datetime

from app.database import base

class QueryLog(base):
    __tablename__ = "query_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_query = Column(Text, nullable=False)
    agent_response = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
