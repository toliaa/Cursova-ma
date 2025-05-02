"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateNewsArticle, deleteNewsArticle } from "@/app/actions/news-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Trash2 } from "lucide-react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { toast } from "@/components/ui/use-toast"

interface EditNewsFormProps {
  article: {
    id: number
    title: string
    content: string
    image_url: string | null
  }
}

export default function EditNewsForm({ article }: EditNewsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append("id", article.id.toString())
    const result = await updateNewsArticle(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("id", article.id.toString())
    const result = await deleteNewsArticle(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      toast({
        title: "Article deleted",
        description: "The news article has been deleted successfully.",
      })
      router.push("/dashboard/news")
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Article Details</CardTitle>
          <CardDescription>Update the details of this article</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form id="edit-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={article.title} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" rows={10} defaultValue={article.content} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                defaultValue={article.image_url || "/placeholder.svg?height=400&width=600"}
              />
              <p className="text-sm text-muted-foreground">
                Enter the URL for the article image. Leave as default for a placeholder image.
              </p>
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
        title="Delete Article"
        description="Are you sure you want to delete this article? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
      />
    </>
  )
}
