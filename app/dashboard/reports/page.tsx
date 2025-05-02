"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import Link from "next/link"
import { FileText, Trash2, Pencil, Loader2, ExternalLink } from "lucide-react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { toast } from "@/components/ui/use-toast"
import { deleteReport } from "@/app/actions/report-actions"

export default function ReportsManagementPage() {
  const router = useRouter()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const supabase = createClient()

  // Fetch reports on component mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from("accounting_reports")
          .select("*")
          .order("report_date", { ascending: false })

        if (error) throw error

        setReports(data || [])
      } catch (error) {
        console.error("Error fetching reports:", error)
        toast({
          title: "Error",
          description: "Failed to load accounting reports",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [supabase])

  const handleDelete = async () => {
    if (!deleteId) return

    setActionLoading(true)

    const formData = new FormData()
    formData.append("id", deleteId.toString())

    const result = await deleteReport(formData)

    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else if (result?.success) {
      toast({
        title: "Success",
        description: "Report deleted successfully",
      })
      // Remove the deleted report from the state
      setReports(reports.filter((report) => report.id !== deleteId))
    }

    setActionLoading(false)
    setShowDeleteDialog(false)
    setDeleteId(null)
  }

  const confirmDelete = (id: number) => {
    setDeleteId(id)
    setShowDeleteDialog(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports Management</h1>
          <p className="text-muted-foreground">Upload, edit, and manage accounting reports</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/reports/upload">Upload New Report</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
          <CardDescription>A list of all accounting reports in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Report Date</TableHead>
                <TableHead className="w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {report.title}
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(report.report_date), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/dashboard/reports/edit/${report.id}`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => confirmDelete(report.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <a href={report.file_url || "#"} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No reports found. Upload your first report.
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
        title="Delete Report"
        description="Are you sure you want to delete this accounting report? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
      />
    </div>
  )
}
