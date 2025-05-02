"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Create a new news article
export async function createNewsArticle(formData: FormData) {
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
  const content = formData.get("content") as string
  const imageUrl = formData.get("imageUrl") as string

  if (!title || !content) {
    return { error: "Title and content are required" }
  }

  try {
    const { error } = await supabase.from("news").insert({
      title,
      content,
      image_url: imageUrl || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    revalidatePath("/news")
    revalidatePath("/dashboard/news")
    redirect("/dashboard/news")
  } catch (error: any) {
    return { error: error.message || "Failed to create news article" }
  }
}

// Update an existing news article
export async function updateNewsArticle(formData: FormData) {
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
  const content = formData.get("content") as string
  const imageUrl = formData.get("imageUrl") as string

  if (!id || !title || !content) {
    return { error: "ID, title, and content are required" }
  }

  try {
    const { error } = await supabase
      .from("news")
      .update({
        title,
        content,
        image_url: imageUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    revalidatePath("/news")
    revalidatePath(`/news/${id}`)
    revalidatePath("/dashboard/news")
    redirect("/dashboard/news")
  } catch (error: any) {
    return { error: error.message || "Failed to update news article" }
  }
}

// Delete a news article
export async function deleteNewsArticle(formData: FormData) {
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
    const { error } = await supabase.from("news").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/news")
    revalidatePath("/dashboard/news")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to delete news article" }
  }
}
