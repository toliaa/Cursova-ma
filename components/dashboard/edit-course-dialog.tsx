"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { updateCourse } from "@/app/actions/course-actions"
import { Loader2 } from "lucide-react"

interface EditCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: any
  onCourseUpdated: (course: any) => void
}

export function EditCourseDialog({ open, onOpenChange, course, onCourseUpdated }: EditCourseDialogProps) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [credits, setCredits] = useState("")
  const [courseCode, setCourseCode] = useState("")

  // Initialize form with course data
  useEffect(() => {
    if (course) {
      setTitle(course.title || "")
      setDescription(course.description || "")
      setCredits(course.credits?.toString() || "")
      setCourseCode(course.course_code || "")
    }
  }, [course])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!title || !courseCode || !credits) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const formData = new FormData()
      formData.append("id", course.id.toString())
      formData.append("title", title)
      formData.append("description", description)
      formData.append("credits", credits)
      formData.append("courseCode", courseCode)

      const result = await updateCourse(formData)

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else if (result?.success) {
        toast({
          title: "Success",
          description: "Course updated successfully",
        })

        // Create an updated course object for the UI update
        const updatedCourse = {
          ...course,
          title,
          description,
          credits: Number.parseInt(credits),
          course_code: courseCode,
          updated_at: new Date().toISOString(),
        }

        onCourseUpdated(updatedCourse)
        onOpenChange(false)
      }
    } catch (error) {
      console.error("Error updating course:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>Update the course details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseCode">Course Code *</Label>
              <Input
                id="courseCode"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="e.g., CS101"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credits">Credits *</Label>
              <Input
                id="credits"
                type="number"
                min="1"
                max="12"
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                placeholder="e.g., 3"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Introduction to Computer Science"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter course description..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Course
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
