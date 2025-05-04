import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StudentScholarships } from "@/components/dashboard/student-scholarships"

export default async function ScholarshipsPage() {
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

  // Fetch student scholarships
  let scholarships = []
  try {
    const { data: scholarshipData } = await supabase
      .from("scholarships")
      .select("*")
      .eq("student_id", session.user.id)
      .order("created_at", { ascending: false })

    scholarships = scholarshipData || []
  } catch (error) {
    console.error("Error fetching scholarships:", error)
    // Continue with empty scholarships array
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">My Scholarships</h1>
      <StudentScholarships scholarships={scholarships} studentId={session.user.id} isAdmin={false} />
    </div>
  )
}
