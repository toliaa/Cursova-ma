"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateReport, deleteReport } from "@/app/actions/report-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Trash2 } from "lucide-react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { toast } from "@/components/ui/use-toast"

interface EditReportFormProps {
  report: {
    id: number
    title: string
    description: string | null
    file_url: string | null
    report_date: string
  }
}

export default function EditReportForm({ report }: EditReportFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append("id", report.id.toString())
    const result = await updateReport(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("id", report.id.toString())
    const result = await deleteReport(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      toast({
        title: "Report deleted",
        description: "The accounting report has been deleted successfully.",
      })
      router.push("/dashboard/reports")
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
          <CardDescription>Update the details of this accounting report</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form id="edit-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={report.title} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={4} defaultValue={report.description || ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileUrl">File URL</Label>
              <Input id="fileUrl" name="fileUrl" defaultValue={report.file_url || "/reports/example-report.pdf"} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportDate">Report Date</Label>
              <Input
                id="reportDate"
                name="reportDate"
                type="date"
                defaultValue={report.report_date.split("T")[0]}
                required
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={loading}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" form="edit-form" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardFooter>
      </Card>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Report"
        description="Are you sure you want to delete this accounting report? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
      />
    </>
  )
}
