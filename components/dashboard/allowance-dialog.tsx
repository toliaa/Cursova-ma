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
import { createAllowance, updateAllowance } from "@/app/actions/allowance-actions"
import { useToast } from "@/hooks/use-toast"

interface Allowance {
  id: number
  student_id: string
  type: string
  amount: number
  payment_date: string
  status: string
  description: string | null
}

interface AllowanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  studentId: string
  allowance: Allowance | null
}

export function AllowanceDialog({ open, onOpenChange, studentId, allowance }: AllowanceDialogProps) {
  const { toast } = useToast()
  const isEditing = !!allowance

  const [type, setType] = useState(allowance?.type || "")
  const [amount, setAmount] = useState(allowance?.amount?.toString() || "")
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(
    allowance?.payment_date ? new Date(allowance.payment_date) : undefined,
  )
  const [status, setStatus] = useState(allowance?.status || "pending")
  const [description, setDescription] = useState(allowance?.description || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    if (!isEditing) {
      setType("")
      setAmount("")
      setPaymentDate(undefined)
      setStatus("pending")
      setDescription("")
    } else {
      setType(allowance?.type || "")
      setAmount(allowance?.amount?.toString() || "")
      setPaymentDate(allowance?.payment_date ? new Date(allowance.payment_date) : undefined)
      setStatus(allowance?.status || "pending")
      setDescription(allowance?.description || "")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!type || !amount || !paymentDate || !status) {
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
      formData.append("type", type)
      formData.append("amount", amount)
      formData.append("paymentDate", paymentDate.toISOString().split("T")[0])
      formData.append("status", status)
      formData.append("description", description)

      if (isEditing && allowance) {
        formData.append("id", allowance.id.toString())
      }

      console.log("Submitting allowance form data:", {
        studentId,
        type,
        amount,
        paymentDate: paymentDate.toISOString().split("T")[0],
        status,
        description,
        ...(isEditing && allowance ? { id: allowance.id } : {}),
      })

      const result = isEditing ? await updateAllowance(formData) : await createAllowance(formData)

      console.log("Allowance action result:", result)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: isEditing ? "Allowance updated successfully" : "Allowance created successfully",
        })
        onOpenChange(false)
        // Force a page refresh to ensure data is updated
        window.location.reload()
      }
    } catch (error: any) {
      console.error("Error submitting allowance:", error)
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
            <DialogTitle>{isEditing ? "Edit Allowance" : "Add Allowance"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the allowance details below." : "Enter the allowance details below."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Allowance Type</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Housing">Housing</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Books">Books</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
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
                placeholder="500.00"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Payment Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${!paymentDate && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paymentDate ? format(paymentDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={paymentDate} onSelect={setPaymentDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details about the allowance"
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
