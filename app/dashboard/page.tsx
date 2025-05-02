import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, ImageIcon, Newspaper } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return null
  }

  // Get user profile with role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  const userRole = profile?.role || "student"

  // Get counts for admin dashboard
  let newsCount = 0
  let reportsCount = 0
  let galleryCount = 0
  let usersCount = 0

  if (userRole === "admin") {
    const [
      { count: newsCountResult },
      { count: reportsCountResult },
      { count: galleryCountResult },
      { count: usersCountResult },
    ] = await Promise.all([
      supabase.from("news").select("*", { count: "exact", head: true }),
      supabase.from("accounting_reports").select("*", { count: "exact", head: true }),
      supabase.from("gallery").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ])

    newsCount = newsCountResult || 0
    reportsCount = reportsCountResult || 0
    galleryCount = galleryCountResult || 0
    usersCount = usersCountResult || 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {profile?.full_name || "User"}!</p>
      </div>

      {userRole === "admin" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total News</CardTitle>
              <Newspaper className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newsCount}</div>
              <p className="text-xs text-muted-foreground">Published news articles</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportsCount}</div>
              <p className="text-xs text-muted-foreground">Financial reports available</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gallery Items</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{galleryCount}</div>
              <p className="text-xs text-muted-foreground">Images in the gallery</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usersCount}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Student Dashboard</CardTitle>
              <CardDescription>Welcome to your student portal</CardDescription>
            </CardHeader>
            <CardContent>
              <p>This is the student dashboard. Here you can view your courses, grades, and financial information.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>Stay updated with the latest news</CardDescription>
            </CardHeader>
            <CardContent>
              <p>No new announcements at this time.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
