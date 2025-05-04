import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StudentDashboardScholarships } from "@/components/dashboard/student-dashboard-scholarships"
import { StudentDashboardAllowances } from "@/components/dashboard/student-dashboard-allowances"
import { StudentDashboardCourses } from "@/components/dashboard/student-dashboard-courses"

export default async function DashboardPage() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get user profile with role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
  const isAdmin = profile?.role === "admin"

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {isAdmin ? (
        <div className="grid gap-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
            <p className="text-gray-600">
              Welcome to the admin dashboard. Use the navigation menu to manage users, courses, news, gallery, and
              reports.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StudentDashboardScholarships />
            <StudentDashboardAllowances />
          </div>

          <StudentDashboardCourses />
        </div>
      )}
    </div>
  )
}
