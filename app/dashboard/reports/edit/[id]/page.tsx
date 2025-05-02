import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import EditReportForm from "../edit-report-form"

export default async function EditReportPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    notFound()
  }

  // Get user profile with role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (profile?.role !== "admin" && profile?.role !== "teacher") {
    notFound()
  }

  // Fetch the report
  const { data: report } = await supabase.from("accounting_reports").select("*").eq("id", params.id).single()

  if (!report) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Report</h1>
        <p className="text-muted-foreground">Update the details of this accounting report</p>
      </div>

      <EditReportForm report={report} />
    </div>
  )
}
