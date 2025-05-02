"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Create a new report
export async function createReport(formData: FormData) {
  const supabase = createClient()

  // Check if user is authenticated and has appropriate role
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "Not authenticated" }
  }

  // Get user profile with role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (profile?.role !== "admin" && profile?.role !== "teacher") {
    return { error: "Not authorized" }
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const fileUrl = formData.get("fileUrl") as string
  const reportDate = formData.get("reportDate") as string

  if (!title || !reportDate) {
    return { error: "Title and report date are required" }
  }

  try {
    const { error } = await supabase.from("accounting_reports").insert({
      title,
      description: description || null,
      file_url: fileUrl || null,
      report_date: reportDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    revalidatePath("/reports")
    revalidatePath("/dashboard/reports")
    redirect("/dashboard/reports")
  } catch (error: any) {
    return { error: error.message || "Failed to create report" }
  }
}

// Update an existing report
export async function updateReport(formData: FormData) {
  const supabase = createClient()

  // Check if user is authenticated and has appropriate role
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "Not authenticated" }
  }

  // Get user profile with role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (profile?.role !== "admin" && profile?.role !== "teacher") {
    return { error: "Not authorized" }
  }

  const id = formData.get("id") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const fileUrl = formData.get("fileUrl") as string
  const reportDate = formData.get("reportDate") as string

  if (!id || !title || !reportDate) {
    return { error: "ID, title, and report date are required" }
  }

  try {
    const { error } = await supabase
      .from("accounting_reports")
      .update({
        title,
        description: description || null,
        file_url: fileUrl || null,
        report_date: reportDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    revalidatePath("/reports")
    revalidatePath("/dashboard/reports")
    redirect("/dashboard/reports")
  } catch (error: any) {
    return { error: error.message || "Failed to update report" }
  }
}

// Delete a report
export async function deleteReport(formData: FormData) {
  const supabase = createClient()

  // Check if user is authenticated and has appropriate role
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "Not authenticated" }
  }

  // Get user profile with role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (profile?.role !== "admin" && profile?.role !== "teacher") {
    return { error: "Not authorized" }
  }

  const id = formData.get("id") as string

  if (!id) {
    return { error: "ID is required" }
  }

  try {
    const { error } = await supabase.from("accounting_reports").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/reports")
    revalidatePath("/dashboard/reports")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to delete report" }
  }
}
