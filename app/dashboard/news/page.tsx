"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import Link from "next/link"
import { Trash2, Pencil, Loader2 } from "lucide-react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { toast } from "@/components/ui/use-toast"
import { deleteNewsArticle } from "@/app/actions/news-actions"

export default function NewsManagementPage() {
  const router = useRouter()
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const supabase = createClient()

  // Fetch news on component mount
  useState(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase.from("news").select("*").order("created_at", { ascending: false })

        if (error) throw error

        setNews(data || [])
      } catch (error) {
        console.error("Error fetching news:", error)
        toast({
          title: "Error",
          description: "Failed to load news articles",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  })

  const handleDelete = async () => {
    if (!deleteId) return

    setActionLoading(true)

    const formData = new FormData()
    formData.append("id", deleteId.toString())

    const result = await deleteNewsArticle(formData)

    if (result?.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else if (result?.success) {
      toast({
        title: "Success",
        description: "News article deleted successfully",
      })
      // Remove the deleted article from the state
      setNews(news.filter((article) => article.id !== deleteId))
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
          <h1 className="text-3xl font-bold tracking-tight">News Management</h1>
          <p className="text-muted-foreground">Create, edit, and manage news articles</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/news/create">Add New Article</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All News Articles</CardTitle>
          <CardDescription>A list of all news articles published on the site.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>
                    {article.created_at ? format(new Date(article.created_at), "MMM d, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/dashboard/news/edit/${article.id}`}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => confirmDelete(article.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {news.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No news articles found. Create your first article.
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
        title="Delete Article"
        description="Are you sure you want to delete this article? This action cannot be undone."
        onConfirm={handleDelete}
        confirmText="Delete"
      />
    </div>
  )
}
