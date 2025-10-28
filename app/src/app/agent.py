from app.config import gemini_config
from agents import Agent, Runner, set_tracing_disabled ,function_tool
from app.tools.weather_tool import get_weather
from app.logger import logger



set_tracing_disabled(True)

@function_tool
async def weather_tool(city: str):
    logger.info(f"Fetching weather for city: {city}")
    
    """Fetch the weather information for a given city."""
    return get_weather(city)

weather_agent = Agent(
    name= "WeatherAgent",
    instructions= "You are a helpful weather assistant that provides accurate and up-to-date weather information."
        "When a user asks about the weather, use the 'weather_tool' "
        "to fetch real-time data and respond clearly with temperature, "
        "conditions, and any useful weather tips.",
    tools=[weather_tool],
)

async def main():

    result = await Runner.run(
        starting_agent=weather_agent,
        input="What's the weather like today?",
        run_config=gemini_config
    )
    print(result.final_output)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())


