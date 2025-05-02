import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import HeroSlider from "@/components/home/hero-slider"
import NewsCard from "@/components/home/news-card"

export default async function Home() {
  const supabase = createClient()

  // Fetch latest 10 news
  const { data: news } = await supabase.from("news").select("*").order("created_at", { ascending: false }).limit(10)

  return (
    <div>
      <HeroSlider />

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Latest News</h2>
          <Link href="/news" className="text-primary hover:underline">
            View all news
          </Link>
        </div>

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
      </section>
    </div>
  )
}
