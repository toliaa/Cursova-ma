"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import Link from "next/link"
import { Trash2, Pencil, Loader2 } from "lucide-react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { toast } from "@/components/ui/use-toast"
import { deleteGalleryItem } from "@/app/actions/gallery-actions"

export default function GalleryManagementPage() {
  const router = useRouter()
  const [galleryItems, setGalleryItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const supabase = createClient()

  // Fetch gallery items on component mount
  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const { data, error } = await supabase.from("gallery").select("*").order("created_at", { ascending: false })

        if (error) throw error

        setGalleryItems(data || [])
      } catch (error) {
        console.error("Error fetching gallery items:", error)
        toast({
          title: "Error",
          description: "Failed to load gallery items",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchGalleryItems()
  }, [supabase])

  const handleDelete = async () => {
    if (!deleteId) return

    setActionLoading(true)

    const formData = new FormData()
    formData.append("id", deleteId.toString())

    const result = await deleteGalleryItem(formData)

    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else if (result?.success) {
      toast({
        title: "Success",
        description: "Gallery item deleted successfully",
      })
      // Remove the deleted item from the state
      setGalleryItems(galleryItems.filter((item) => item.id !== deleteId))
    }

    setActionLoading(false)
    setShowDeleteDialog(false)
    setDeleteId(null)
  }

  const confirmDelete = (id: number) => {
    setDeleteId(id)
    setShowDeleteDialog(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gallery Management</h1>
          <p className="text-muted-foreground">Upload, edit, and manage gallery images</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/gallery/upload">Upload New Image</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Gallery Images</CardTitle>
          <CardDescription>A list of all images in the gallery.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {galleryItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="relative h-12 w-20">
                      <Image
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.created_at ? format(new Date(item.created_at), "MMM d, yyyy") : "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/dashboard/gallery/edit/${item.id}`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => confirmDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {galleryItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No gallery images found. Upload your first image.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Gallery Image"
        description="Are you sure you want to delete this gallery image? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
      />
    </div>
  )
}
