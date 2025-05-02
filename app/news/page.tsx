import { createClient } from "@/lib/supabase/server"
import NewsCard from "@/components/home/news-card"

export default async function NewsPage() {
  const supabase = createClient()

  // Fetch all news
  const { data: news } = await supabase.from("news").select("*").order("created_at", { ascending: false })

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">News</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news?.map((item) => (
          <NewsCard
            key={item.id}
            id={item.id}
            title={item.title}
            content={item.content}
            imageUrl={item.image_url}
            createdAt={item.created_at}
          />
        ))}
      </div>
    </div>
  )
}
