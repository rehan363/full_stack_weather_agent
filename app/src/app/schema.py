"""Request/Response schema dataclasses for the agent."""
from dataclasses import dataclass, field
from typing import Any, Dict, Optional

from pydantic import BaseModel

class WeatherResponseModel(BaseModel):
    city: str
    country: str
    temperature: float
    description: str
    humidity: int
    wind_speed: float
