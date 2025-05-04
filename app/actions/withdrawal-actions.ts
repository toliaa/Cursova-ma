"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

// Create a new withdrawal request
export async function createWithdrawal(formData: FormData) {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "Not authenticated" }
  }

  const studentId = formData.get("studentId") as string
  const courseId = formData.get("courseId") as string
  const reason = formData.get("reason") as string
  const withdrawalDate = formData.get("withdrawalDate") as string

  // If the user is a student, they can only create withdrawals for themselves
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (profile?.role === "student" && profile.id !== studentId) {
    return { error: "Not authorized" }
  }

  if (!studentId || !courseId || !withdrawalDate) {
    return { error: "Student ID, course ID, and withdrawal date are required" }
  }

  try {
    // Check if student is enrolled in this course
    const { data: enrollment } = await supabase
      .from("student_courses")
      .select("*")
      .eq("student_id", studentId)
      .eq("course_id", Number.parseInt(courseId))
      .eq("status", "active")
      .single()

    if (!enrollment) {
      return { error: "Student is not enrolled in this course" }
    }

    // Check if there's already a pending withdrawal request
    const { data: existingWithdrawal } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("student_id", studentId)
      .eq("course_id", Number.parseInt(courseId))
      .eq("status", "pending")
      .single()

    if (existingWithdrawal) {
      return { error: "There is already a pending withdrawal request for this course" }
    }

    const { error } = await supabase.from("withdrawals").insert({
      student_id: studentId,
      course_id: Number.parseInt(courseId),
      withdrawal_date: withdrawalDate,
      reason: reason || null,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    revalidatePath(`/dashboard/users/${studentId}`)
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to create withdrawal request" }
  }
}

// Create an admin-initiated withdrawal (automatically approved)
export async function createAdminWithdrawal(formData: FormData) {
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

  const studentId = formData.get("studentId") as string
  const courseId = formData.get("courseId") as string
  const reason = formData.get("reason") as string
  const withdrawalDate = formData.get("withdrawalDate") as string

  if (!studentId || !courseId || !withdrawalDate) {
    return { error: "Student ID, course ID, and withdrawal date are required" }
  }

  try {
    // Check if student is enrolled in this course
    const { data: enrollment } = await supabase
      .from("student_courses")
      .select("*")
      .eq("student_id", studentId)
      .eq("course_id", Number.parseInt(courseId))
      .eq("status", "active")
      .single()

    if (!enrollment) {
      return { error: "Student is not enrolled in this course" }
    }

    // Create a withdrawal record with status "approved"
    const { error: withdrawalError } = await supabase.from("withdrawals").insert({
      student_id: studentId,
      course_id: Number.parseInt(courseId),
      withdrawal_date: withdrawalDate,
      reason: `Admin initiated: ${reason || "No reason provided"}`,
      status: "approved", // Automatically approved since it's admin-initiated
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (withdrawalError) throw withdrawalError

    // Update the student_courses status to "withdrawn"
    const { error: updateError } = await supabase
      .from("student_courses")
      .update({
        status: "withdrawn",
        updated_at: new Date().toISOString(),
      })
      .eq("id", enrollment.id)

    if (updateError) throw updateError

    // Revalidate both the user detail page and the users list page
    revalidatePath(`/dashboard/users/${studentId}`)
    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to process administrative withdrawal" }
  }
}

// Update withdrawal status (approve or reject)
export async function updateWithdrawalStatus(formData: FormData) {
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

  const id = formData.get("id") as string
  const status = formData.get("status") as string
  const studentId = formData.get("studentId") as string

  if (!id || !status || !["approved", "rejected"].includes(status)) {
    return { error: "ID and valid status are required" }
  }

  try {
    const { data: withdrawal, error: fetchError } = await supabase.from("withdrawals").select("*").eq("id", id).single()

    if (fetchError) throw fetchError

    const { error } = await supabase
      .from("withdrawals")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    // If approved, update the student_courses status to "withdrawn"
    if (status === "approved" && withdrawal) {
      const { error: updateError } = await supabase
        .from("student_courses")
        .update({
          status: "withdrawn",
          updated_at: new Date().toISOString(),
        })
        .eq("student_id", withdrawal.student_id)
        .eq("course_id", withdrawal.course_id)

      if (updateError) throw updateError
    }

    revalidatePath(`/dashboard/users/${studentId}`)
    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to update withdrawal status" }
  }
}

// Delete a withdrawal request
export async function deleteWithdrawal(formData: FormData) {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "Not authenticated" }
  }

  const id = formData.get("id") as string
  const studentId = formData.get("studentId") as string

  // Get user profile with role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  // Only admins or the student who created the withdrawal can delete it
  if (profile?.role !== "admin" && profile?.id !== studentId) {
    return { error: "Not authorized" }
  }

  if (!id) {
    return { error: "ID is required" }
  }

  try {
    const { error } = await supabase.from("withdrawals").delete().eq("id", id)

    if (error) throw error

    revalidatePath(`/dashboard/users/${studentId}`)
    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to delete withdrawal request" }
  }
}
