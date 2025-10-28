"use client"

import type React from "react"

import { useState } from "react"
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface WeatherResponse {
  temperature?: number
  condition?: string
  humidity?: number
  windSpeed?: number
  visibility?: number
  description?: string
}

export default function WeatherAgent() {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    setError("")
    setWeatherData(null)

    try {
      const apiUrl = "http://127.0.0.1:8000"
      const response = await fetch(`${apiUrl}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch weather data")
      }

      const data = await response.json()
      // The backend returns { response: string } (agent output). Normalize to the
      // WeatherResponse shape the UI expects so we can display the agent text.
      let normalized: WeatherResponse = {}

      // Helper to merge known numeric/string fields
      const mergeKnownFields = (obj: any) => {
        if (obj == null || typeof obj !== "object") return
        if (obj.temperature !== undefined) normalized.temperature = obj.temperature
        if (obj.condition !== undefined) normalized.condition = obj.condition
        if (obj.humidity !== undefined) normalized.humidity = obj.humidity
        if (obj.windSpeed !== undefined) normalized.windSpeed = obj.windSpeed
        if (obj.visibility !== undefined) normalized.visibility = obj.visibility
        if (obj.description !== undefined) normalized.description = obj.description
      }

      if (typeof data === "string") {
        normalized.description = data
        // Try to parse JSON if the agent returned a JSON string
        try {
          const parsed = JSON.parse(data)
          if (parsed && typeof parsed === "object") {
            mergeKnownFields(parsed)
          }
        } catch (e) {
          // not JSON, ignore
        }
      } else if (data && typeof data === "object") {
        // If backend wraps the reply in `response`, use that. Otherwise, assume
        // the object may already contain fields like temperature/condition.
        const resp = (data as any).response ?? data
        if (typeof resp === "string") {
          normalized.description = resp
          try {
            const parsed = JSON.parse(resp)
            if (parsed && typeof parsed === "object") mergeKnownFields(parsed)
          } catch (e) {
            // not JSON
          }
        } else if (typeof resp === "object") {
          mergeKnownFields(resp)
        }

        // Also copy top-level known fields from the original data object
        mergeKnownFields(data)
      }

      setWeatherData(normalized)
      setInput("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (condition?: string) => {
    if (!condition) return <Cloud className="w-16 h-16 text-sky-300" />

    const conditionLower = condition.toLowerCase()
    if (conditionLower.includes("rain")) {
      return <CloudRain className="w-16 h-16 text-sky-400" />
    }
    if (conditionLower.includes("sunny") || conditionLower.includes("clear")) {
      return <Sun className="w-16 h-16 text-yellow-300" />
    }
    return <Cloud className="w-16 h-16 text-sky-300" />
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-sky-200 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Cloud className="w-10 h-10 text-sky-500" />
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800">Weather Agent</h1>
            </div>
            <p className="text-lg text-slate-600">Ask me anything about the weather</p>
          </div>

          {/* Input Form */}
          <Card className="bg-white/80 backdrop-blur-md border-sky-200 shadow-2xl mb-8">
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="What's the weather like today?"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  className="flex-1 bg-sky-50 border-sky-200 text-slate-800 placeholder:text-slate-400"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white px-6 md:px-8"
                >
                  {loading ? "Loading..." : "Ask"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Error Message */}
          {error && (
            <Card className="bg-red-50 border-red-200 p-4 mb-8">
              <p className="text-red-700">{error}</p>
            </Card>
          )}

          {/* Weather Result */}
          {weatherData && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Main Weather Card */}
              <Card className="bg-white/90 backdrop-blur-md border-sky-200 shadow-2xl overflow-hidden">
                <div className="p-8 md:p-12">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                        {weatherData.condition || "Weather Update"}
                      </h2>
                      <p className="text-slate-600">{weatherData.description || "Current conditions"}</p>
                    </div>
                    <div className="flex-shrink-0">{getWeatherIcon(weatherData.condition)}</div>
                  </div>

                  {/* Temperature */}
                  {weatherData.temperature !== undefined && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-sky-100 to-blue-100 rounded-lg">
                      <p className="text-slate-600 text-sm font-medium mb-2">Temperature</p>
                      <p className="text-5xl font-bold text-sky-600">{weatherData.temperature}°</p>
                    </div>
                  )}

                  {/* Weather Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {weatherData.humidity !== undefined && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Droplets className="w-5 h-5 text-blue-500" />
                          <p className="text-slate-600 text-sm font-medium">Humidity</p>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{weatherData.humidity}%</p>
                      </div>
                    )}

                    {weatherData.windSpeed !== undefined && (
                      <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Wind className="w-5 h-5 text-cyan-500" />
                          <p className="text-slate-600 text-sm font-medium">Wind Speed</p>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{weatherData.windSpeed} km/h</p>
                      </div>
                    )}

                    {weatherData.visibility !== undefined && (
                      <div className="bg-sky-50 rounded-lg p-4 border border-sky-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Eye className="w-5 h-5 text-sky-500" />
                          <p className="text-slate-600 text-sm font-medium">Visibility</p>
                        </div>
                        <p className="text-2xl font-bold text-slate-800">{weatherData.visibility} km</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Ask Another Question */}
              <div className="text-center">
                <p className="text-slate-600 mb-4">Want to know more?</p>
                <Button
                  onClick={() => setWeatherData(null)}
                  variant="outline"
                  className="border-sky-300 text-sky-600 hover:bg-sky-50"
                >
                  Ask Another Question
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!weatherData && !loading && !error && (
            <div className="text-center py-12">
              <Cloud className="w-16 h-16 text-sky-300 mx-auto mb-4 opacity-50" />
              <p className="text-slate-500 text-lg">Ask a weather question to get started</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

