import logging
from datetime import datetime
import os

LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

log_file = os.path.join(LOG_DIR, f"{datetime.now().date()}.log")

# Configure logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s]: %(message)s",
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler()  # also show logs in console
    ]
)

logger = logging.getLogger("weather_agent")