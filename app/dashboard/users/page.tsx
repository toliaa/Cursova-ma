import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Eye } from "lucide-react"
import { UserWithdrawalButton } from "@/components/dashboard/user-withdrawal-button"

export default async function UsersPage() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Please sign in to access this page.</p>
      </div>
    )
  }

  // Get user profile with role
  const { data: currentUserProfile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
  const isAdmin = currentUserProfile?.role === "admin"

  // If not admin, show message
  if (!isAdmin) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
      </div>
    )
  }

  // Fetch all users
  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  // Fetch student courses to determine which users have courses
  let studentCourses = []
  try {
    const { data: courses } = await supabase
      .from("student_courses")
      .select(`
        student_id,
        course_id,
        status,
        course:course_id (
          id,
          title,
          course_code
        )
      `)
      .eq("status", "active")

    studentCourses = courses || []
  } catch (error) {
    console.error("Error fetching student courses:", error)
    // Continue with empty courses array
  }

  // Group courses by student
  const coursesByStudent = studentCourses.reduce((acc: any, course: any) => {
    if (!acc[course.student_id]) {
      acc[course.student_id] = []
    }
    acc[course.student_id].push(course)
    return acc
  }, {})

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage users and their roles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || "N/A"}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-blue-100 text-blue-800"
                          : user.role === "student"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role || "user"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/users/${user.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>

                      {user.role === "student" && coursesByStudent[user.id]?.length > 0 && (
                        <UserWithdrawalButton
                          userId={user.id}
                          userName={user.full_name || user.email}
                          courses={coursesByStudent[user.id] || []}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!users?.length && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
