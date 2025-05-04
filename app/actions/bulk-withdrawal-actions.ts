"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function processBulkWithdrawal(formData: FormData) {
  const supabase = createClient()

  // Check if user is authenticated and is admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "Not authenticated" }
  }

  // Get user profile with role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (profile?.role !== "admin") {
    return { error: "Not authorized" }
  }

  const courseId = formData.get("courseId") as string
  const studentIdsJson = formData.get("studentIds") as string
  const withdrawalDate = formData.get("withdrawalDate") as string
  const reason = formData.get("reason") as string

  if (!courseId || !studentIdsJson || !withdrawalDate) {
    return { error: "Course ID, student IDs, and withdrawal date are required" }
  }

  let studentIds: string[]
  try {
    studentIds = JSON.parse(studentIdsJson)
  } catch (error) {
    return { error: "Invalid student IDs format" }
  }

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return { error: "No students selected" }
  }

  // Get the course details for logging
  const { data: course } = await supabase.from("courses").select("title, course_code").eq("id", courseId).single()

  // Process each student withdrawal
  const results = {
    success: [] as string[],
    failed: [] as { id: string; name: string; error: string }[],
  }

  for (const studentCourseId of studentIds) {
    try {
      // Get the student course record
      const { data: studentCourse, error: fetchError } = await supabase
        .from("student_courses")
        .select("*, profiles:student_id (full_name)")
        .eq("id", studentCourseId)
        .single()

      if (fetchError) {
        results.failed.push({
          id: studentCourseId,
          name: "Unknown",
          error: "Failed to fetch student course record",
        })
        continue
      }

      // Check if the student is already withdrawn
      if (studentCourse.status !== "active") {
        results.failed.push({
          id: studentCourseId,
          name: studentCourse.profiles?.full_name || "Unknown",
          error: "Student is not actively enrolled in this course",
        })
        continue
      }

      // Create a withdrawal record
      const { error: withdrawalError } = await supabase.from("withdrawals").insert({
        student_id: studentCourse.student_id,
        course_id: Number.parseInt(courseId),
        withdrawal_date: withdrawalDate,
        reason: `Bulk withdrawal: ${reason || "No reason provided"}`,
        status: "approved", // Automatically approved since it's admin-initiated
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (withdrawalError) {
        results.failed.push({
          id: studentCourseId,
          name: studentCourse.profiles?.full_name || "Unknown",
          error: "Failed to create withdrawal record",
        })
        continue
      }

      // Update the student_courses status to "withdrawn"
      const { error: updateError } = await supabase
        .from("student_courses")
        .update({
          status: "withdrawn",
          updated_at: new Date().toISOString(),
        })
        .eq("id", studentCourseId)

      if (updateError) {
        results.failed.push({
          id: studentCourseId,
          name: studentCourse.profiles?.full_name || "Unknown",
          error: "Failed to update enrollment status",
        })
        continue
      }

      // If we got here, the withdrawal was successful
      results.success.push(studentCourseId)
    } catch (error: any) {
      results.failed.push({
        id: studentCourseId,
        name: "Unknown",
        error: error.message || "Unknown error",
      })
    }
  }

  // Revalidate relevant paths
  revalidatePath("/dashboard/courses")
  revalidatePath("/dashboard/users")

  return { results }
}
