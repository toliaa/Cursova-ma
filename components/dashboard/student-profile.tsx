"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface StudentProfileProps {
  student: any
  isAdmin: boolean
}

export function StudentProfile({ student, isAdmin }: StudentProfileProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Information</CardTitle>
        <CardDescription>Personal details and account information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
            <p className="text-base">{student.full_name || "Not provided"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
            <p className="text-base">{student.email || "Not provided"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Role</h3>
            <p className="text-base capitalize">{student.role || "Not assigned"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Account Created</h3>
            <p className="text-base">
              {student.created_at ? new Date(student.created_at).toLocaleDateString() : "Unknown"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
