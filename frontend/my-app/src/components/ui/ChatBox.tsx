"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Input } from "../../components/ui/input"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface WeatherResponse {
  city?: string
  country?: string
  temperature?: number
  description?: string
  humidity?: number
  wind_speed?: number
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)
    setError(null)

        try {
        const apiUrl = "http://127.0.0.1:8000"
        const response = await fetch(`${apiUrl}/ask`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // Backend expects { "question": "..." } (see FastAPI Query model)
            body: JSON.stringify({ question: input }),
        })

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

      const data = await response.json()

      // Handle both text response and weather object
      let assistantContent = ""
      if (data.response) {
        assistantContent = data.response
      } else if (data.city) {
        // Weather object
        assistantContent = `Weather in ${data.city}, ${data.country}: ${data.temperature}°C, ${data.description}. Humidity: ${data.humidity}%, Wind: ${data.wind_speed} km/h`
      } else {
        assistantContent = JSON.stringify(data)
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: assistantContent,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="w-full max-w-2xl h-96 flex flex-col shadow-lg">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h1 className="text-xl font-semibold text-foreground">Weather Agent Chat✨</h1>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-card">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Start a conversation...</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-start">
            <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg">
              <p className="text-sm">Error: {error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 flex gap-2">
        <Input
          value={input}
          onChange={(e: { target: { value: React.SetStateAction<string> } }) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          disabled={loading}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={loading || !input.trim()} className="px-6">
          Send
        </Button>
      </div>
    </Card>
  )
}
