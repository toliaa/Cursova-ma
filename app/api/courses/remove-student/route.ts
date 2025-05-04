import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  // Get user profile with role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  try {
    const { studentCourseId, studentId } = await request.json()

    if (!studentCourseId) {
      return NextResponse.json({ error: "Student course ID is required" }, { status: 400 })
    }

    // Delete the student course record
    const { error } = await supabase.from("student_courses").delete().eq("id", studentCourseId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to remove student from course" }, { status: 500 })
  }
}
