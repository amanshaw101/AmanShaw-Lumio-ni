"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, FileText, Share2, Edit3 } from "lucide-react"

export default function MeetingNotesApp() {
  const [transcript, setTranscript] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "text/plain") {
      alert("Please upload a .txt file")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setTranscript(content)
    }
    reader.readAsText(file)
  }

  const handleSummarize = async () => {
    if (!transcript.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript: transcript.trim(),
          customPrompt: customPrompt.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate summary")
      }

      const data = await response.json()
      setSummary(data.summary)
    } catch (error) {
      console.error("Error:", error)
      alert("Failed to generate summary. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (!email.trim() || !summary) return

    alert(`Summary would be shared with: ${email}`)
    setEmail("")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Meeting Notes Summarizer</h1>
          <p className="text-muted-foreground">Transform your meeting transcripts into actionable summaries</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Meeting Transcript
              </CardTitle>
              <CardDescription>Upload a text file or paste your meeting transcript</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Upload Transcript File</Label>
                <div className="mt-2">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-accent file:text-accent-foreground hover:file:bg-accent/80"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or paste text</span>
                </div>
              </div>

              <div>
                <Label htmlFor="transcript">Transcript</Label>
                <Textarea
                  id="transcript"
                  placeholder="Paste your meeting transcript here..."
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="min-h-[200px] mt-2"
                />
              </div>

              <div>
                <Label htmlFor="custom-prompt">Custom Instructions (Optional)</Label>
                <Textarea
                  id="custom-prompt"
                  placeholder="Add specific instructions for the AI summary (e.g., focus on action items, highlight decisions made, etc.)"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <Button onClick={handleSummarize} disabled={!transcript.trim() || isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  "Generate Summary"
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5" />
                Generated Summary
              </CardTitle>
              <CardDescription>AI-generated meeting summary ready for sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {summary ? (
                <>
                  <div>
                    <Label htmlFor="summary">Summary</Label>
                    {isEditing ? (
                      <Textarea
                        id="summary"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="min-h-[200px] mt-2"
                      />
                    ) : (
                      <div className="mt-2 p-3 bg-muted rounded-md min-h-[200px] whitespace-pre-wrap text-sm">
                        {summary}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(!isEditing)} className="flex-1">
                      {isEditing ? "Save Changes" : "Edit Summary"}
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Share via Email</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <Button onClick={handleShare} disabled={!email.trim()} className="shrink-0">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Your AI-generated summary will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
