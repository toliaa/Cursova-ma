import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StudentAllowances } from "@/components/dashboard/student-allowances"

export default async function AllowancesPage() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (!profile) {
    redirect("/dashboard")
  }

  // Fetch student allowances
  let allowances = []
  try {
    const { data: allowanceData } = await supabase
      .from("allowances")
      .select("*")
      .eq("student_id", session.user.id)
      .order("created_at", { ascending: false })

    allowances = allowanceData || []
  } catch (error) {
    console.error("Error fetching allowances:", error)
    // Continue with empty allowances array
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">My Allowances</h1>
      <StudentAllowances allowances={allowances} studentId={session.user.id} isAdmin={false} />
    </div>
  )
}
