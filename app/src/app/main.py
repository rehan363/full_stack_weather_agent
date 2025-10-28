from fastapi import FastAPI , Depends
from fastapi.middleware.cors import CORSMiddleware
from .tools.weather_tool import get_weather as fetch_weather
from .agent import weather_agent
from agents import Runner
from app.config import gemini_config
from app.logger import logger
from app.database import SessionLocal
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.models import QueryLog


app = FastAPI(title="Weather Agent API")

# CORS: allow frontend during local development to call this API (adjust origins for prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.database import engine, base
@app.on_event("startup")
def on_startup():
    base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class Query(BaseModel):
    question: str

@app.get("/")
def root():
    return {"message": "Hello weather agent is running!"}

@app.get("/weather/{city}")
def get_weather(city: str):
    """Route handler that calls the blocking weather tool function.

    The imported function is synchronous, so keep this handler synchronous
    to avoid awaiting a non-awaitable and to avoid shadowing the imported
    name which previously caused infinite recursion.
    """
    return fetch_weather(city)


@app.post("/ask")
async def ask_weather_agent(query: Query, db: Session = Depends(get_db)):
    logger.info(f"Received query: {query.question}")

    result = await Runner.run(
        starting_agent=weather_agent,
        input=query.question,
        run_config=gemini_config
    )
    print(result.final_output)
    logger.info(f"Agent response: {result.final_output}")

    new_log = QueryLog(
        user_query=query.question,
        agent_response=result.final_output
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    logger.info(f"Logged query to db")

    return {"response": result.final_output}
