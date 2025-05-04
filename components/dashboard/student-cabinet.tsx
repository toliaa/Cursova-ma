"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StudentProfile } from "./student-profile"
import { StudentCourses } from "./student-courses"
import { StudentWithdrawals } from "./student-withdrawals"
import { StudentScholarships } from "./student-scholarships"
import { StudentAllowances } from "./student-allowances"

interface StudentCabinetProps {
  student: any
  courses: any[]
  withdrawals: any[]
  scholarships: any[]
  allowances: any[]
  allCourses: any[]
  isAdmin: boolean
}

export function StudentCabinet({
  student,
  courses,
  withdrawals,
  scholarships,
  allowances,
  allCourses,
  isAdmin,
}: StudentCabinetProps) {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="space-y-6">
      <StudentProfile student={student} isAdmin={isAdmin} />

      <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
          <TabsTrigger value="allowances">Allowances</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <div className="grid gap-6">
            <div className="text-xl font-semibold">Student Information</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground">Email</div>
                <div className="mt-1">{student.email}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground">Full Name</div>
                <div className="mt-1">{student.full_name}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground">Role</div>
                <div className="mt-1 capitalize">{student.role}</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-muted-foreground">Joined</div>
                <div className="mt-1">
                  {student.created_at ? new Date(student.created_at).toLocaleDateString() : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="courses" className="mt-6">
          <StudentCourses courses={courses} isAdmin={isAdmin} studentId={student.id} allCourses={allCourses} />
        </TabsContent>
        <TabsContent value="withdrawals" className="mt-6">
          <StudentWithdrawals withdrawals={withdrawals} isAdmin={isAdmin} />
        </TabsContent>
        <TabsContent value="scholarships" className="mt-6">
          <StudentScholarships scholarships={scholarships} studentId={student.id} isAdmin={isAdmin} />
        </TabsContent>
        <TabsContent value="allowances" className="mt-6">
          <StudentAllowances allowances={allowances} studentId={student.id} isAdmin={isAdmin} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
