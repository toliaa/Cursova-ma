"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, Check, X } from "lucide-react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { toast } from "@/components/ui/use-toast"
import { updateWithdrawalStatus, deleteWithdrawal } from "@/app/actions/withdrawal-actions"
import { format } from "date-fns"

interface StudentWithdrawalsProps {
  withdrawals: any[]
  courses: any[]
  isAdmin: boolean
  studentId: string
}

export function StudentWithdrawals({ withdrawals, courses, isAdmin, studentId }: StudentWithdrawalsProps) {
  const [loading, setLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null)

  const handleDeleteWithdrawal = async () => {
    if (!selectedWithdrawal) return

    setLoading(true)

    const formData = new FormData()
    formData.append("id", selectedWithdrawal.id.toString())
    formData.append("studentId", studentId)

    const result = await deleteWithdrawal(formData)

    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else if (result?.success) {
      toast({
        title: "Success",
        description: "Withdrawal request deleted successfully",
      })
      // Refresh the page to show updated data
      window.location.reload()
    }

    setLoading(false)
    setShowDeleteDialog(false)
    setSelectedWithdrawal(null)
  }

  const handleUpdateStatus = async (id: number, status: string) => {
    setLoading(true)

    const formData = new FormData()
    formData.append("id", id.toString())
    formData.append("status", status)
    formData.append("studentId", studentId)

    const result = await updateWithdrawalStatus(formData)

    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else if (result?.success) {
      toast({
        title: "Success",
        description: `Withdrawal request ${status}`,
      })
      // Refresh the page to show updated data
      window.location.reload()
    }

    setLoading(false)
  }

  const confirmDeleteWithdrawal = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal)
    setShowDeleteDialog(true)
  }

  // Find course details for each withdrawal
  const getCourseName = (courseId: number) => {
    const course = courses.find((c) => c.course.id === courseId)
    return course ? `${course.course.course_code} - ${course.course.title}` : "Unknown Course"
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
          <CardDescription>Course withdrawal requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Withdrawal Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>{getCourseName(withdrawal.course_id)}</TableCell>
                  <TableCell>
                    {withdrawal.withdrawal_date ? format(new Date(withdrawal.withdrawal_date), "MMM d, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell>{withdrawal.reason || "No reason provided"}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        withdrawal.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : withdrawal.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {withdrawal.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isAdmin && withdrawal.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(withdrawal.id, "approved")}
                            disabled={loading}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="sr-only">Approve</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(withdrawal.id, "rejected")}
                            disabled={loading}
                          >
                            <X className="h-4 w-4 text-red-600" />
                            <span className="sr-only">Reject</span>
                          </Button>
                        </>
                      )}
                      {withdrawal.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => confirmDeleteWithdrawal(withdrawal)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {withdrawals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No withdrawal requests found.
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
        title="Delete Withdrawal Request"
        description="Are you sure you want to delete this withdrawal request? This action cannot be undone."
        onConfirm={handleDeleteWithdrawal}
        confirmText="Delete"
      />
    </>
  )
}
