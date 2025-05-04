"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Pencil, Loader2, PlusCircle, AlertTriangle } from "lucide-react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { toast } from "@/components/ui/use-toast"
import { deleteCourse } from "@/app/actions/course-actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CreateCourseDialog } from "@/components/dashboard/create-course-dialog"
import { EditCourseDialog } from "@/components/dashboard/edit-course-dialog"

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [tableError, setTableError] = useState<string | null>(null)
  const supabase = createClient()

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase.from("courses").select("*").order("course_code", { ascending: true })

        if (error) {
          if (error.message.includes("does not exist")) {
            setTableError(
              "The courses table does not exist in the database yet. Please create the required tables first.",
            )
          } else {
            throw error
          }
        } else {
          setCourses(data || [])
        }
      } catch (error: any) {
        console.error("Error fetching courses:", error)
        toast({
          title: "Error",
          description: "Failed to load courses",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [supabase])

  const handleDelete = async () => {
    if (!deleteId) return

    setActionLoading(true)

    const formData = new FormData()
    formData.append("id", deleteId.toString())

    const result = await deleteCourse(formData)

    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else if (result?.success) {
      toast({
        title: "Success",
        description: "Course deleted successfully",
      })
      // Remove the deleted course from the state
      setCourses(courses.filter((course) => course.id !== deleteId))
    }

    setActionLoading(false)
    setShowDeleteDialog(false)
    setDeleteId(null)
  }

  const confirmDelete = (id: number) => {
    setDeleteId(id)
    setShowDeleteDialog(true)
  }

  const openEditDialog = (course: any) => {
    setSelectedCourse(course)
    setShowEditDialog(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (tableError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage courses</p>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Database Setup Required</AlertTitle>
          <AlertDescription>{tableError}</AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Database Setup Instructions</CardTitle>
            <CardDescription>
              Follow these steps to create the required tables in your Supabase database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Go to your Supabase Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Navigate to your project in the Supabase dashboard and go to the SQL Editor.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Create the Courses Table</h3>
              <div className="bg-muted p-4 rounded-md overflow-x-auto">
                <pre className="text-xs">
                  {`CREATE TABLE IF NOT EXISTS public.courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL,
  course_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Create the Student Courses Table</h3>
              <div className="bg-muted p-4 rounded-md overflow-x-auto">
                <pre className="text-xs">
                  {`CREATE TABLE IF NOT EXISTS public.student_courses (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrollment_date DATE NOT NULL,
  status TEXT NOT NULL,
  grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Create the Withdrawals Table</h3>
              <div className="bg-muted p-4 rounded-md overflow-x-auto">
                <pre className="text-xs">
                  {`CREATE TABLE IF NOT EXISTS public.withdrawals (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  withdrawal_date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`}
                </pre>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()}>Refresh Page After Setup</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage courses</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Course
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>A list of all courses in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.course_code}</TableCell>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(course)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => confirmDelete(course.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No courses found. Create your first course.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Course"
        description="Are you sure you want to delete this course? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
      />

      {showCreateDialog && (
        <CreateCourseDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCourseCreated={(newCourse) => {
            setCourses([...courses, newCourse])
          }}
        />
      )}

      {selectedCourse && showEditDialog && (
        <EditCourseDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          course={selectedCourse}
          onCourseUpdated={(updatedCourse) => {
            setCourses(courses.map((course) => (course.id === updatedCourse.id ? updatedCourse : course)))
          }}
        />
      )}
    </div>
  )
}
