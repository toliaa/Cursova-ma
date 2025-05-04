"use client"

import type React from "react"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createScholarship, updateScholarship } from "@/app/actions/scholarship-actions"
import { useToast } from "@/hooks/use-toast"

interface Scholarship {
  id: number
  student_id: string
  name: string
  amount: number
  start_date: string
  end_date: string
  status: string
  description: string | null
}

interface ScholarshipDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  scholarship: Scholarship | null
}

export function ScholarshipDialog({ open, onOpenChange, studentId, scholarship }: ScholarshipDialogProps) {
  const { toast } = useToast()
  const isEditing = !!scholarship

  const [name, setName] = useState(scholarship?.name || "")
  const [amount, setAmount] = useState(scholarship?.amount?.toString() || "")
  const [startDate, setStartDate] = useState<Date | undefined>(
    scholarship?.start_date ? new Date(scholarship.start_date) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    scholarship?.end_date ? new Date(scholarship.end_date) : undefined,
  )
  const [status, setStatus] = useState(scholarship?.status || "pending")
  const [description, setDescription] = useState(scholarship?.description || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    if (!isEditing) {
      setName("")
      setAmount("")
      setStartDate(undefined)
      setEndDate(undefined)
      setStatus("pending")
      setDescription("")
    } else {
      setName(scholarship?.name || "")
      setAmount(scholarship?.amount?.toString() || "")
      setStartDate(scholarship?.start_date ? new Date(scholarship.start_date) : undefined)
      setEndDate(scholarship?.end_date ? new Date(scholarship.end_date) : undefined)
      setStatus(scholarship?.status || "pending")
      setDescription(scholarship?.description || "")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !amount || !startDate || !endDate || !status) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("studentId", studentId)
      formData.append("name", name)
      formData.append("amount", amount)
      formData.append("startDate", startDate.toISOString().split("T")[0])
      formData.append("endDate", endDate.toISOString().split("T")[0])
      formData.append("status", status)
      formData.append("description", description)

      if (isEditing && scholarship) {
        formData.append("id", scholarship.id.toString())
      }

      console.log("Submitting scholarship form data:", {
        studentId,
        name,
        amount,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        status,
        description,
        ...(isEditing && scholarship ? { id: scholarship.id } : {}),
      })

      const result = isEditing ? await updateScholarship(formData) : await createScholarship(formData)

      console.log("Scholarship action result:", result)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: isEditing ? "Scholarship updated successfully" : "Scholarship created successfully",
        })
        onOpenChange(false)
        // Force a page refresh to ensure data is updated
        window.location.reload()
      }
    } catch (error: any) {
      console.error("Error submitting scholarship:", error)
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          resetForm()
        }
        onOpenChange(newOpen)
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Scholarship" : "Add Scholarship"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the scholarship details below." : "Enter the scholarship details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Scholarship Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Merit Scholarship"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000.00"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => (startDate ? date < startDate : false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details about the scholarship"
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
