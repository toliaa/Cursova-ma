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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { createCourse } from "@/app/actions/course-actions"
import { Loader2 } from "lucide-react"

interface CreateCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCourseCreated: (course: any) => void
}

export function CreateCourseDialog({ open, onOpenChange, onCourseCreated }: CreateCourseDialogProps) {
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [credits, setCredits] = useState("")
  const [courseCode, setCourseCode] = useState("")

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
      formData.append("title", title)
      formData.append("description", description)
      formData.append("credits", credits)
      formData.append("courseCode", courseCode)

      const result = await createCourse(formData)

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else if (result?.success) {
        toast({
          title: "Success",
          description: "Course created successfully",
        })

        // Create a mock course object for the UI update
        // In a real app, you'd want to fetch the actual created course
        const newCourse = {
          id: Date.now(), // Temporary ID until page refresh
          title,
          description,
          credits: Number.parseInt(credits),
          course_code: courseCode,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        onCourseCreated(newCourse)
        onOpenChange(false)

        // Reset form
        setTitle("")
        setDescription("")
        setCredits("")
        setCourseCode("")
      }
    } catch (error) {
      console.error("Error creating course:", error)
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
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription>Create a new course in the system. Fill in the details below.</DialogDescription>
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
              Create Course
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
