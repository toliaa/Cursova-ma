import Image from "next/image"
import { createClient } from "@/lib/supabase/server"

export default async function GalleryPage() {
  const supabase = createClient()

  // Fetch all gallery items
  const { data: galleryItems } = await supabase.from("gallery").select("*").order("created_at", { ascending: false })

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Image Gallery</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryItems?.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-lg shadow-md">
            <div className="relative h-64 w-full">
              <Image
                src={item.image_url || "/placeholder.svg"}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="p-4 bg-white">
              <h3 className="font-semibold text-lg">{item.title}</h3>
              {item.description && <p className="text-gray-600 mt-2">{item.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
