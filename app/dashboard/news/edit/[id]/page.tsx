import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import EditNewsForm from "../edit-news-form"

export default async function EditNewsPage({ params }: { params: { id: string } }) {
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

  // Fetch the news article
  const { data: article } = await supabase.from("news").select("*").eq("id", params.id).single()

  if (!article) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit News Article</h1>
        <p className="text-muted-foreground">Update the details of this news article</p>
      </div>

      <EditNewsForm article={article} />
    </div>
  )
}
