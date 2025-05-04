import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StudentCabinet } from "@/components/dashboard/student-cabinet"

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    notFound()
  }

  // Get user profile with role
  const { data: currentUserProfile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
  const isAdmin = currentUserProfile?.role === "admin"

  // If not admin and not viewing own profile, redirect
  if (!isAdmin && session.user.id !== params.id) {
    notFound()
  }

  // Fetch the student profile
  const { data: student } = await supabase.from("profiles").select("*").eq("id", params.id).single()

  if (!student) {
    notFound()
  }

  // Fetch student courses with course details
  let studentCourses = []
  try {
    const { data: courses } = await supabase
      .from("student_courses")
      .select(`
        id,
        enrollment_date,
        status,
        grade,
        course:course_id (
          id,
          title,
          description,
          credits,
          course_code
        )
      `)
      .eq("student_id", params.id)
      .order("enrollment_date", { ascending: false })

    studentCourses = courses || []
  } catch (error) {
    console.error("Error fetching student courses:", error)
    // Continue with empty courses array
  }

  // Fetch student withdrawals with course details
  let withdrawals = []
  try {
    const { data: withdrawalData } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("student_id", params.id)
      .order("created_at", { ascending: false })

    withdrawals = withdrawalData || []
  } catch (error) {
    console.error("Error fetching withdrawals:", error)
    // Continue with empty withdrawals array
  }

  // Fetch student scholarships
  let scholarships = []
  try {
    const { data: scholarshipData } = await supabase
      .from("scholarships")
      .select("*")
      .eq("student_id", params.id)
      .order("created_at", { ascending: false })

    scholarships = scholarshipData || []
  } catch (error) {
    console.error("Error fetching scholarships:", error)
    // Continue with empty scholarships array
  }

  // Fetch student allowances
  let allowances = []
  try {
    const { data: allowanceData } = await supabase
      .from("allowances")
      .select("*")
      .eq("student_id", params.id)
      .order("created_at", { ascending: false })

    allowances = allowanceData || []
  } catch (error) {
    console.error("Error fetching allowances:", error)
    // Continue with empty allowances array
  }

  // Fetch all courses for admin to add
  let allCourses = []
  if (isAdmin) {
    try {
      const { data: courses } = await supabase.from("courses").select("*").order("course_code", { ascending: true })

      allCourses = courses || []
    } catch (error) {
      console.error("Error fetching all courses:", error)
      // Continue with empty allCourses array
    }
  }

  return (
    <div className="container mx-auto py-6">
      <StudentCabinet
        student={student}
        courses={studentCourses}
        withdrawals={withdrawals}
        scholarships={scholarships}
        allowances={allowances}
        allCourses={allCourses}
        isAdmin={isAdmin}
      />
    </div>
  )
}
