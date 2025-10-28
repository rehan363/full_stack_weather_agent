import requests
from app.logger import logger
from app.config import  WEATHER_API_KEY, BASE_URL

def get_weather(city: str):
    logger.info(f"Fetching weather for city: {city}")
    """Fetch the weather information for a given city using WeatherAPI.com.

    This function expects `BASE_URL` to be the WeatherAPI base (for example
    https://api.weatherapi.com/v1). It calls the /current.json endpoint and
    returns a normalized dictionary on success or an error dict on failure.
    """
    endpoint = BASE_URL.rstrip('/') + "/current.json"
    params = {
        "key": WEATHER_API_KEY,
        "q": city
    }

    try:
        response = requests.get(endpoint, params=params, timeout=10)
    except requests.RequestException as e:
        return {"error": f"Request failed: {e}"}

    # WeatherAPI returns 200 on success and 400/401 on errors with a JSON body.
    if response.status_code == 200:
        data = response.json()
        # WeatherAPI uses 'location' and 'current' sections
        weather = {
            "city": data.get("location", {}).get("name"),
            "country": data.get("location", {}).get("country"),
            "temperature_c": data.get("current", {}).get("temp_c"),
            "description": data.get("current", {}).get("condition", {}).get("text"),
            "humidity": data.get("current", {}).get("humidity"),
            "wind_kph": data.get("current", {}).get("wind_kph")
        }
        logger.info(f"Weather data fetched successfully: {weather}")
        return weather
    elif response.status_code == 401:
        logger.warning("Unauthorized access attempt.")
        return {"error": "Unauthorized. Check WEATHER_API_KEY."}
    elif response.status_code == 400:
        # Bad request: often returned when location not found
        try:
            return {"error": "Bad request", "body": response.json()}
        except Exception:
            return {"error": "Bad request", "body": response.text}
    else:
        try:
            body = response.json()
        except Exception:
            body = response.text
        return {"error": f"Unable to fetch weather data. Status code: {response.status_code}", "body": body}
    
    

if __name__ == "__main__":
    # When run directly, call the function and print the returned result so
    # both success and error responses are visible to the user.
    result = get_weather("rawalpindi")
    print("Result:", result)