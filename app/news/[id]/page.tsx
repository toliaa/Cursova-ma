import Image from "next/image"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/server"

export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Fetch news item
  const { data: news } = await supabase.from("news").select("*").eq("id", params.id).single()

  if (!news) {
    notFound()
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{news.title}</h1>
        {news.created_at && <p className="text-gray-500">{format(new Date(news.created_at), "MMMM d, yyyy")}</p>}
      </div>

      {news.image_url && (
        <div className="relative h-[400px] w-full mb-8">
          <Image src={news.image_url || "/placeholder.svg"} alt={news.title} fill className="object-cover rounded-lg" />
        </div>
      )}

      <div className="prose max-w-none">
        <p>{news.content}</p>
      </div>
    </div>
  )
}
