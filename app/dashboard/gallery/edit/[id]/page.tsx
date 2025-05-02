import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import EditGalleryForm from "../edit-gallery-form"

export default async function EditGalleryPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    notFound()
  }

  // Get user profile with role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  if (profile?.role !== "admin") {
    notFound()
  }

  // Fetch the gallery item
  const { data: galleryItem } = await supabase.from("gallery").select("*").eq("id", params.id).single()

  if (!galleryItem) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Gallery Image</h1>
        <p className="text-muted-foreground">Update the details of this gallery image</p>
      </div>

      <EditGalleryForm galleryItem={galleryItem} />
    </div>
  )
}
