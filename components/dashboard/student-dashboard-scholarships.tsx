"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { AlertTriangle, WifiOff, Wifi } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"

interface Scholarship {
  id: number
  student_id: string
  name: string
  amount: number
  start_date: string
  end_date: string
  status: string
  description: string | null
  created_at: string | null
  updated_at: string | null
}

export function StudentDashboardScholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const [connectionError, setConnectionError] = useState(false)

  const fetchScholarships = async () => {
    setLoading(true)
    setError(null)
    setConnectionError(false)

    try {
      const supabase = createClient()

      if (!supabase) {
        console.error("Supabase client is not initialized")
        setError("Database connection is not initialized")
        setConnectionError(true)
        return
      }

      // First get the current user
      const { data: userData } = await supabase.auth.getUser()

      if (!userData || !userData.user) {
        setError("User not authenticated")
        return
      }

      const userId = userData.user.id

      // Now use the userId in the query
      const { data, error } = await supabase
        .from("scholarships")
        .select("*")
        .eq("student_id", userId)
        .order("start_date", { ascending: false })

      if (error) {
        console.error("Error fetching scholarships:", error)

        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          setTableExists(false)
          setError("The scholarships table does not exist in the database.")
        } else {
          setError(error.message)
        }
      } else {
        console.log("Fetched scholarships:", data)
        setScholarships(data || [])
        setTableExists(true)
      }
    } catch (error: any) {
      console.error("Error in fetchScholarships:", error)

      if (error.message === "Failed to fetch" || error.name === "TypeError") {
        setConnectionError(true)
        setError("Network error: Unable to connect to the database.")
      } else {
        setError(error.message || "An unexpected error occurred")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchScholarships()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "expired":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  // Calculate total active scholarship amount
  const totalActiveAmount = scholarships
    .filter((s) => s.status.toLowerCase() === "active")
    .reduce((sum, scholarship) => sum + scholarship.amount, 0)

  // If we have a connection error, show a special message
  if (connectionError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Scholarships</CardTitle>
          <CardDescription>Your scholarship information</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              Unable to connect to the database. Please check your internet connection and try again.
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              onClick={fetchScholarships}
              className="flex items-center gap-2"
              disabled={loading}
            >
              {loading ? "Connecting..." : "Try Again"}
              {loading ? <Wifi className="h-4 w-4 animate-pulse" /> : <Wifi className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If the table doesn't exist, show a message
  if (!tableExists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Scholarships</CardTitle>
          <CardDescription>Your scholarship information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">Scholarship information is not available at this time.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Scholarships</CardTitle>
        <CardDescription>Your scholarship information</CardDescription>
      </CardHeader>
      <CardContent>
        {error && !loading && !connectionError && !tableExists && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading scholarships...</p>
          </div>
        ) : scholarships.length === 0 ? (
          <div className="text-center py-4 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No scholarships found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {totalActiveAmount > 0 && (
              <div className="bg-green-50 text-green-700 px-3 py-2 rounded-md border border-green-200 mb-4">
                <span className="font-medium">Total Active: </span>
                <span className="font-bold">${totalActiveAmount.toFixed(2)}</span>
              </div>
            )}

            {scholarships.slice(0, 3).map((scholarship) => (
              <div
                key={scholarship.id}
                className="flex flex-col justify-between p-3 border rounded-lg hover:bg-muted/20 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{scholarship.name}</h4>
                  <Badge className={getStatusColor(scholarship.status)}>{scholarship.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(scholarship.start_date), "MMM d, yyyy")} -{" "}
                  {format(new Date(scholarship.end_date), "MMM d, yyyy")}
                </div>
                <div className="font-semibold mt-1">${scholarship.amount.toFixed(2)}</div>
              </div>
            ))}

            {scholarships.length > 3 && (
              <div className="text-center mt-2">
                <Button variant="link" className="text-sm" asChild>
                  <a href="/dashboard/scholarships">View all {scholarships.length} scholarships</a>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
