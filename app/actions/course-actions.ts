"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

// Create a new course
export async function createCourse(formData: FormData) {
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

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const credits = Number.parseInt(formData.get("credits") as string)
  const courseCode = formData.get("courseCode") as string

  if (!title || !courseCode || isNaN(credits)) {
    return { error: "Title, course code, and credits are required" }
  }

  try {
    const { error } = await supabase.from("courses").insert({
      title,
      description: description || null,
      credits,
      course_code: courseCode,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    revalidatePath("/dashboard/courses")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to create course" }
  }
}

// Update an existing course
export async function updateCourse(formData: FormData) {
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
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const credits = Number.parseInt(formData.get("credits") as string)
  const courseCode = formData.get("courseCode") as string

  if (!id || !title || !courseCode || isNaN(credits)) {
    return { error: "ID, title, course code, and credits are required" }
  }

  try {
    const { error } = await supabase
      .from("courses")
      .update({
        title,
        description: description || null,
        credits,
        course_code: courseCode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    revalidatePath("/dashboard/courses")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to update course" }
  }
}

// Delete a course
export async function deleteCourse(formData: FormData) {
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

  if (!id) {
    return { error: "ID is required" }
  }

  try {
    // Check if course is assigned to any students
    const { count } = await supabase
      .from("student_courses")
      .select("*", { count: "exact", head: true })
      .eq("course_id", id)

    if (count && count > 0) {
      return { error: "Cannot delete course that is assigned to students" }
    }

    const { error } = await supabase.from("courses").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/dashboard/courses")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to delete course" }
  }
}

// Assign course to student
export async function assignCourseToStudent(formData: FormData) {
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
  const enrollmentDate = formData.get("enrollmentDate") as string

  if (!studentId || !courseId || !enrollmentDate) {
    return { error: "Student ID, course ID, and enrollment date are required" }
  }

  try {
    // Check if student is already enrolled in this course
    const { data: existingEnrollment } = await supabase
      .from("student_courses")
      .select("*")
      .eq("student_id", studentId)
      .eq("course_id", Number.parseInt(courseId))
      .single()

    if (existingEnrollment) {
      return { error: "Student is already enrolled in this course" }
    }

    const { error } = await supabase.from("student_courses").insert({
      student_id: studentId,
      course_id: Number.parseInt(courseId),
      enrollment_date: enrollmentDate,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    revalidatePath(`/dashboard/users/${studentId}`)
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to assign course to student" }
  }
}

// Remove course from student
export async function removeCourseFromStudent(formData: FormData) {
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

  if (!id) {
    return { error: "ID is required" }
  }

  try {
    const { error } = await supabase.from("student_courses").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/dashboard/users")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to remove course from student" }
  }
}
