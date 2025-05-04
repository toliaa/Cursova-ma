"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createAllowance(formData: FormData) {
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
  const type = formData.get("type") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const paymentDate = formData.get("paymentDate") as string
  const status = formData.get("status") as string
  const description = formData.get("description") as string

  // Validate inputs
  if (!studentId || !type || isNaN(amount) || !paymentDate || !status) {
    return { error: "Missing required fields" }
  }

  try {
    // Log the data being inserted for debugging
    console.log("Inserting allowance:", {
      student_id: studentId,
      type,
      amount,
      payment_date: paymentDate,
      status,
      description,
    })

    const { data, error } = await supabase
      .from("allowances")
      .insert({
        student_id: studentId,
        type,
        amount,
        payment_date: paymentDate,
        status,
        description,
      })
      .select()

    if (error) {
      console.error("Supabase error:", error)
      return { error: error.message }
    }

    // Log success
    console.log("Allowance created successfully:", data)

    revalidatePath(`/dashboard/users/${studentId}`)
    return { success: true, data }
  } catch (error: any) {
    console.error("Error creating allowance:", error)
    return { error: error.message || "Failed to create allowance" }
  }
}

export async function updateAllowance(formData: FormData) {
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
  const type = formData.get("type") as string
  const amount = Number.parseFloat(formData.get("amount") as string)
  const paymentDate = formData.get("paymentDate") as string
  const status = formData.get("status") as string
  const description = formData.get("description") as string

  // Validate inputs
  if (isNaN(id) || !studentId || !type || isNaN(amount) || !paymentDate || !status) {
    return { error: "Missing required fields" }
  }

  try {
    const { data, error } = await supabase
      .from("allowances")
      .update({
        student_id: studentId,
        type,
        amount,
        payment_date: paymentDate,
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
    console.error("Error updating allowance:", error)
    return { error: error.message || "Failed to update allowance" }
  }
}

export async function deleteAllowance(id: number, studentId: string) {
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
    const { error } = await supabase.from("allowances").delete().eq("id", id)

    if (error) {
      console.error("Supabase error:", error)
      return { error: error.message }
    }

    revalidatePath(`/dashboard/users/${studentId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting allowance:", error)
    return { error: error.message || "Failed to delete allowance" }
  }
}
