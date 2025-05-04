"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, WifiOff, Wifi } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"

interface Course {
  id: number
  course_code: string
  title: string
  description: string
  credits: number
  instructor: string
  status: string
}

interface StudentCourse {
  id: number
  student_id: string
  course_id: number
  enrollment_date: string
  status: string
  course: Course
}

export function StudentDashboardCourses() {
  const [courses, setCourses] = useState<StudentCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const [connectionError, setConnectionError] = useState(false)

  const fetchCourses = async () => {
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
        .from("student_courses")
        .select(`
          id,
          student_id,
          course_id,
          enrollment_date,
          status,
          course:courses(id, course_code, title, description, credits, instructor, status)
        `)
        .eq("student_id", userId)

      if (error) {
        console.error("Error fetching courses:", error)

        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          setTableExists(false)
          setError("The courses table does not exist in the database.")
        } else {
          setError(error.message)
        }
      } else {
        console.log("Fetched courses:", data)
        setCourses(data || [])
        setTableExists(true)
      }
    } catch (error: any) {
      console.error("Error in fetchCourses:", error)

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
    fetchCourses()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "enrolled":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "completed":
        return "bg-blue-500"
      case "dropped":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Calculate total credits
  const totalCredits = courses.reduce((sum, course) => {
    if (course.status.toLowerCase() === "enrolled" && course.course) {
      return sum + (course.course.credits || 0)
    }
    return sum
  }, 0)

  // If we have a connection error, show a special message
  if (connectionError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
          <CardDescription>Your enrolled courses</CardDescription>
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
            <Button variant="outline" onClick={fetchCourses} className="flex items-center gap-2" disabled={loading}>
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
          <CardTitle>My Courses</CardTitle>
          <CardDescription>Your enrolled courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">Course information is not available at this time.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Courses</CardTitle>
        <CardDescription>Your enrolled courses</CardDescription>
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
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-4 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No courses found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {totalCredits > 0 && (
              <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md border border-blue-200 mb-4">
                <span className="font-medium">Total Credits: </span>
                <span className="font-bold">{totalCredits}</span>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {courses.slice(0, 4).map((studentCourse) => (
                <div
                  key={studentCourse.id}
                  className="flex flex-col justify-between p-3 border rounded-lg hover:bg-muted/20 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{studentCourse.course?.title}</h4>
                      <p className="text-sm text-muted-foreground">{studentCourse.course?.course_code}</p>
                    </div>
                    <Badge className={getStatusColor(studentCourse.status)}>{studentCourse.status}</Badge>
                  </div>
                  <div className="text-sm mt-2">
                    <span className="font-medium">Instructor: </span>
                    {studentCourse.course?.instructor}
                  </div>
                  <div className="text-sm mt-1">
                    <span className="font-medium">Credits: </span>
                    {studentCourse.course?.credits}
                  </div>
                </div>
              ))}
            </div>

            {courses.length > 4 && (
              <div className="text-center mt-2">
                <Button variant="link" className="text-sm" asChild>
                  <a href="/dashboard/courses">View all {courses.length} courses</a>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
