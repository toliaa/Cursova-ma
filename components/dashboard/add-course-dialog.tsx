"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { assignCourseToStudent } from "@/app/actions/course-actions"
import { Loader2 } from "lucide-react"

interface AddCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  availableCourses?: any[] // Make this optional
}

export function AddCourseDialog({ open, onOpenChange, studentId, availableCourses = [] }: AddCourseDialogProps) {
  const [loading, setLoading] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [enrollmentDate, setEnrollmentDate] = useState<string>(new Date().toISOString().split("T")[0])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData()
    formData.append("studentId", studentId)
    formData.append("courseId", selectedCourse)
    formData.append("enrollmentDate", enrollmentDate)

    try {
      const result = await assignCourseToStudent(formData)

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else if (result?.success) {
        toast({
          title: "Success",
          description: "Course assigned successfully",
        })
        onOpenChange(false)
        // Refresh the page to show updated data
        window.location.reload()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Check if there are available courses
  const hasCourses = Array.isArray(availableCourses) && availableCourses.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Course to Student</DialogTitle>
          <DialogDescription>Assign a new course to this student.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="course">Course</Label>
              {hasCourses ? (
                <Select value={selectedCourse} onValueChange={setSelectedCourse} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.course_code} - {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted/50">
                  No available courses found. Please create courses first or check if the student is already enrolled in
                  all courses.
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="enrollmentDate">Enrollment Date</Label>
              <Input
                id="enrollmentDate"
                type="date"
                value={enrollmentDate}
                onChange={(e) => setEnrollmentDate(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedCourse || !hasCourses}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Course
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
