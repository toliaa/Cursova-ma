"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Plus, BookOpen } from "lucide-react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { AddCourseDialog } from "./add-course-dialog"
import { RequestWithdrawalDialog } from "./request-withdrawal-dialog"
import { AdminWithdrawalDialog } from "./admin-withdrawal-dialog"

interface StudentCoursesProps {
  courses: any[]
  isAdmin: boolean
  studentId: string
  allCourses: any[]
}

export function StudentCourses({ courses, isAdmin, studentId, allCourses }: StudentCoursesProps) {
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<any>(null)
  const [showAddCourseDialog, setShowAddCourseDialog] = useState(false)
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false)
  const [showAdminWithdrawalDialog, setShowAdminWithdrawalDialog] = useState(false)

  const handleRemoveCourse = async () => {
    if (!selectedCourse) return

    setLoading(true)

    try {
      const response = await fetch("/api/courses/remove-student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentCourseId: selectedCourse.id,
          studentId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove course")
      }

      toast({
        title: "Success",
        description: "Course removed successfully",
      })
      // Refresh the page to show updated data
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
      setSelectedCourse(null)
    }
  }

  const confirmRemoveCourse = (course: any) => {
    setSelectedCourse(course)
    setShowDeleteDialog(true)
  }

  const openWithdrawalDialog = (course: any) => {
    setSelectedCourse(course.course)
    setShowWithdrawalDialog(true)
  }

  const openAdminWithdrawalDialog = (course: any) => {
    setSelectedCourse(course.course)
    setShowAdminWithdrawalDialog(true)
  }

  // Filter out courses that are already assigned to the student
  const availableCourses = allCourses.filter(
    (course) => !courses.some((c) => c.course.id === course.id && c.status !== "withdrawn"),
  )

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Enrolled Courses</CardTitle>
            <CardDescription>Courses the student is currently enrolled in</CardDescription>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowAddCourseDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Enrollment Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.course.course_code}</TableCell>
                  <TableCell>{course.course.title}</TableCell>
                  <TableCell>{course.course.credits}</TableCell>
                  <TableCell>
                    {course.enrollment_date ? format(new Date(course.enrollment_date), "MMM d, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        course.status === "active"
                          ? "bg-green-100 text-green-800"
                          : course.status === "withdrawn"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {course.status}
                    </span>
                  </TableCell>
                  <TableCell>{course.grade || "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {course.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openWithdrawalDialog(course)}
                          disabled={loading}
                        >
                          <BookOpen className="h-4 w-4" />
                          <span className="sr-only">Request Withdrawal</span>
                        </Button>
                      )}
                      {isAdmin && course.status === "active" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAdminWithdrawalDialog(course)}
                          disabled={loading}
                        >
                          <BookOpen className="h-4 w-4" />
                          <span className="ml-2">Withdraw</span>
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => confirmRemoveCourse(course)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No courses found.
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
        title="Remove Course"
        description="Are you sure you want to remove this course from the student? This action cannot be undone."
        onConfirm={handleRemoveCourse}
        confirmText="Remove"
      />

      <AddCourseDialog
        open={showAddCourseDialog}
        onOpenChange={setShowAddCourseDialog}
        studentId={studentId}
        courses={availableCourses}
      />

      {selectedCourse && (
        <RequestWithdrawalDialog
          open={showWithdrawalDialog}
          onOpenChange={setShowWithdrawalDialog}
          studentId={studentId}
          course={selectedCourse}
        />
      )}

      {selectedCourse && (
        <AdminWithdrawalDialog
          open={showAdminWithdrawalDialog}
          onOpenChange={setShowAdminWithdrawalDialog}
          studentId={studentId}
          course={selectedCourse}
        />
      )}
    </>
  )
}
