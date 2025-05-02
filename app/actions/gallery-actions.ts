"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

// Create a new gallery item
export async function createGalleryItem(formData: FormData) {
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
  const imageUrl = formData.get("imageUrl") as string

  if (!title || !imageUrl) {
    return { error: "Title and image URL are required" }
  }

  try {
    const { error } = await supabase.from("gallery").insert({
      title,
      description: description || null,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    })

    if (error) throw error

    revalidatePath("/gallery")
    revalidatePath("/dashboard/gallery")
    redirect("/dashboard/gallery")
  } catch (error: any) {
    return { error: error.message || "Failed to create gallery item" }
  }
}

// Update an existing gallery item
export async function updateGalleryItem(formData: FormData) {
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
  const imageUrl = formData.get("imageUrl") as string

  if (!id || !title || !imageUrl) {
    return { error: "ID, title, and image URL are required" }
  }

  try {
    const { error } = await supabase
      .from("gallery")
      .update({
        title,
        description: description || null,
        image_url: imageUrl,
      })
      .eq("id", id)

    if (error) throw error

    revalidatePath("/gallery")
    revalidatePath("/dashboard/gallery")
    redirect("/dashboard/gallery")
  } catch (error: any) {
    return { error: error.message || "Failed to update gallery item" }
  }
}

// Delete a gallery item
export async function deleteGalleryItem(formData: FormData) {
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
    const { error } = await supabase.from("gallery").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/gallery")
    revalidatePath("/dashboard/gallery")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to delete gallery item" }
  }
}
