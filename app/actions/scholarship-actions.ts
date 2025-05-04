"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createScholarship(formData: FormData) {
  const supabase = createClient()

  // Check if user is authenticated and is an admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "Not authenticated" }
  }

  // Get user profile with role
  const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (userProfile?.role !== "admin") {
    return { error: "Not authorized" }
  }

  const studentId = formData.get("studentId") as string
  const name = formData.get("name") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string
  const status = formData.get("status") as string
  const description = formData.get("description") as string

  // Validate inputs
  if (!studentId || !name || isNaN(amount) || !startDate || !endDate || !status) {
    return { error: "Missing required fields" }
  }

  try {
    // Log the data being inserted for debugging
    console.log("Inserting scholarship:", {
      student_id: studentId,
      name,
      amount,
      start_date: startDate,
      end_date: endDate,
      status,
      description,
    })

    const { data, error } = await supabase
      .from("scholarships")
      .insert({
        student_id: studentId,
        name,
        amount,
        start_date: startDate,
        end_date: endDate,
        status,
        description,
      })
      .select()

    if (error) {
      console.error("Supabase error:", error)
      return { error: error.message }
    }

    // Log success
    console.log("Scholarship created successfully:", data)

    revalidatePath(`/dashboard/users/${studentId}`)
    return { success: true, data }
  } catch (error: any) {
    console.error("Error creating scholarship:", error)
    return { error: error.message || "Failed to create scholarship" }
  }
}

export async function updateScholarship(formData: FormData) {
  const supabase = createClient()

  // Check if user is authenticated and is an admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "Not authenticated" }
  }

  // Get user profile with role
  const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (userProfile?.role !== "admin") {
    return { error: "Not authorized" }
  }

  const id = Number.parseInt(formData.get("id") as string)
  const studentId = formData.get("studentId") as string
  const name = formData.get("name") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string
  const status = formData.get("status") as string
  const description = formData.get("description") as string

  // Validate inputs
  if (isNaN(id) || !studentId || !name || isNaN(amount) || !startDate || !endDate || !status) {
    return { error: "Missing required fields" }
  }

  try {
    const { data, error } = await supabase
      .from("scholarships")
      .update({
        student_id: studentId,
        name,
        amount,
        start_date: startDate,
        end_date: endDate,
        status,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Supabase error:", error)
      return { error: error.message }
    }

    revalidatePath(`/dashboard/users/${studentId}`)
    return { success: true, data }
  } catch (error: any) {
    console.error("Error updating scholarship:", error)
    return { error: error.message || "Failed to update scholarship" }
  }
}

export async function deleteScholarship(id: number, studentId: string) {
  const supabase = createClient()

  // Check if user is authenticated and is an admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "Not authenticated" }
  }

  // Get user profile with role
  const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (userProfile?.role !== "admin") {
    return { error: "Not authorized" }
  }

  try {
    const { error } = await supabase.from("scholarships").delete().eq("id", id)

    if (error) {
      console.error("Supabase error:", error)
      return { error: error.message }
    }

    revalidatePath(`/dashboard/users/${studentId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting scholarship:", error)
    return { error: error.message || "Failed to delete scholarship" }
  }
}
