"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { updateGalleryItem, deleteGalleryItem } from "@/app/actions/gallery-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Trash2 } from "lucide-react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { toast } from "@/components/ui/use-toast"

interface EditGalleryFormProps {
  galleryItem: {
    id: number
    title: string
    description: string | null
    image_url: string
  }
}

export default function EditGalleryForm({ galleryItem }: EditGalleryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append("id", galleryItem.id.toString())
    const result = await updateGalleryItem(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("id", galleryItem.id.toString())
    const result = await deleteGalleryItem(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      toast({
        title: "Image deleted",
        description: "The gallery image has been deleted successfully.",
      })
      router.push("/dashboard/gallery")
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Image Details</CardTitle>
          <CardDescription>Update the details of this gallery image</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <div className="relative h-[200px] w-full rounded-md overflow-hidden">
              <Image
                src={galleryItem.image_url || "/placeholder.svg"}
                alt={galleryItem.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <form id="edit-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={galleryItem.title} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={4} defaultValue={galleryItem.description || ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input id="imageUrl" name="imageUrl" defaultValue={galleryItem.image_url} required />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={loading}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" form="edit-form" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardFooter>
      </Card>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Gallery Image"
        description="Are you sure you want to delete this gallery image? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
      />
    </>
  )
}
