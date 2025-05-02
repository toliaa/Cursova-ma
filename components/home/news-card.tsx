import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface NewsCardProps {
  id: number
  title: string
  content: string
  imageUrl: string | null
  createdAt: string | null
}

export default function NewsCard({ id, title, content, imageUrl, createdAt }: NewsCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image src={imageUrl || "/placeholder.svg?height=400&width=600"} alt={title} fill className="object-cover" />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-500 mt-2 line-clamp-3">{content}</p>
      </CardContent>
      <CardFooter className="flex justify-between p-4 pt-0">
        {createdAt && (
          <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</p>
        )}
        <Link href={`/news/${id}`} className="text-sm font-medium text-primary hover:underline">
          Read more
        </Link>
      </CardFooter>
    </Card>
  )
}
