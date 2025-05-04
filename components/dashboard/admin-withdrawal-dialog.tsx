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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { createAdminWithdrawal } from "@/app/actions/withdrawal-actions"
import { Loader2 } from "lucide-react"

interface AdminWithdrawalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  course: any
}

export function AdminWithdrawalDialog({ open, onOpenChange, studentId, course }: AdminWithdrawalDialogProps) {
  const [loading, setLoading] = useState(false)
  const [reason, setReason] = useState<string>("Administrative withdrawal")
  const [withdrawalDate, setWithdrawalDate] = useState<string>(new Date().toISOString().split("T")[0])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!course) return

    setLoading(true)

    const formData = new FormData()
    formData.append("studentId", studentId)
    formData.append("courseId", course.id.toString())
    formData.append("reason", reason)
    formData.append("withdrawalDate", withdrawalDate)
    formData.append("adminInitiated", "true")

    const result = await createAdminWithdrawal(formData)

    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
      setLoading(false)
    } else if (result?.success) {
      toast({
        title: "Success",
        description: "Student withdrawn from course successfully",
      })
      onOpenChange(false)
      // Refresh the page to show updated data
      window.location.reload()
    }
  }

  if (!course) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Administrative Course Withdrawal</DialogTitle>
          <DialogDescription>
            Withdraw student from {course.course_code} - {course.title}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="withdrawalDate">Withdrawal Date</Label>
              <Input
                id="withdrawalDate"
                type="date"
                value={withdrawalDate}
                onChange={(e) => setWithdrawalDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason for Withdrawal</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for the administrative withdrawal"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Withdraw Student
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
