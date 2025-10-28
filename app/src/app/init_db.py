from app.database import base, engine
from app.models import QueryLog

def init_db():
    base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db()
    print("✅ Database initialized successfully.")
