import { format } from "date-fns"
import { createClient } from "@/lib/supabase/server"
import { FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function ReportsPage() {
  const supabase = createClient()

  // Fetch all reports
  const { data: reports } = await supabase
    .from("accounting_reports")
    .select("*")
    .order("report_date", { ascending: false })

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Accounting Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports?.map((report) => (
          <Card key={report.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <FileText className="h-8 w-8" />
              <div>
                <CardTitle>{report.title}</CardTitle>
                <CardDescription>{format(new Date(report.report_date), "MMMM d, yyyy")}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {report.description && <p className="text-sm text-gray-500 mb-4">{report.description}</p>}
              <Button asChild>
                <a href={report.file_url || "#"} target="_blank" rel="noopener noreferrer">
                  Download Report
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
