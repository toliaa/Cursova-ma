"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { processBulkWithdrawal } from "@/app/actions/bulk-withdrawal-actions"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

export default function BulkWithdrawalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([])
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [withdrawalDate, setWithdrawalDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
  const [reason, setReason] = useState<string>("")
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectAll, setSelectAll] = useState(false)
  const [results, setResults] = useState<{
    success: string[]
    failed: { id: string; name: string; error: string }[]
  } | null>(null)
  const supabase = createClient()

  // Fetch all courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase.from("courses").select("*").order("course_code", { ascending: true })

        if (error) {
          throw error
        }

        setCourses(data || [])
      } catch (error: any) {
        console.error("Error fetching courses:", error)
        toast({
          title: "Error",
          description: "Failed to load courses. " + error.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [supabase])

  // Fetch enrolled students when a course is selected
  useEffect(() => {
    if (!selectedCourse) {
      setEnrolledStudents([])
      return
    }

    const fetchEnrolledStudents = async () => {
      setLoading(true)
      try {
        // Get all active enrollments for the selected course
        const { data, error } = await supabase
          .from("student_courses")
          .select(`
            id,
            student_id,
            enrollment_date,
            profiles:student_id (
              id,
              full_name,
              email
            )
          `)
          .eq("course_id", selectedCourse)
          .eq("status", "active")
          .order("enrollment_date", { ascending: false })

        if (error) {
          throw error
        }

        setEnrolledStudents(data || [])
        // Reset selected students when course changes
        setSelectedStudents([])
        setSelectAll(false)
      } catch (error: any) {
        console.error("Error fetching enrolled students:", error)
        toast({
          title: "Error",
          description: "Failed to load enrolled students. " + error.message,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEnrolledStudents()
  }, [selectedCourse, supabase])

  // Handle select all checkbox
  useEffect(() => {
    if (selectAll) {
      setSelectedStudents(enrolledStudents.map((student) => student.id))
    } else if (selectedStudents.length === enrolledStudents.length) {
      // If all were selected and now selectAll is false, deselect all
      setSelectedStudents([])
    }
  }, [selectAll, enrolledStudents])

  // Update selectAll state when individual selections change
  useEffect(() => {
    if (enrolledStudents.length > 0 && selectedStudents.length === enrolledStudents.length) {
      setSelectAll(true)
    } else if (selectAll) {
      setSelectAll(false)
    }
  }, [selectedStudents, enrolledStudents, selectAll])

  const handleStudentSelection = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    )
  }

  const handleBulkWithdrawal = async () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "No students selected",
        description: "Please select at least one student to withdraw.",
        variant: "destructive",
      })
      return
    }

    if (!withdrawalDate) {
      toast({
        title: "Withdrawal date required",
        description: "Please select a withdrawal date.",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    setResults(null)

    try {
      const formData = new FormData()
      formData.append("courseId", selectedCourse)
      formData.append("studentIds", JSON.stringify(selectedStudents))
      formData.append("withdrawalDate", withdrawalDate)
      formData.append("reason", reason || "Bulk withdrawal by administrator")

      const result = await processBulkWithdrawal(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        setResults(result.results)

        if (result.results.failed.length === 0) {
          toast({
            title: "Success",
            description: `Successfully withdrew ${result.results.success.length} students from the course.`,
          })
        } else if (result.results.success.length === 0) {
          toast({
            title: "Failed",
            description: `Failed to withdraw any students. Please check the errors.`,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Partial Success",
            description: `Successfully withdrew ${result.results.success.length} students. ${result.results.failed.length} failed.`,
            variant: "destructive",
          })
        }

        // Refresh the enrolled students list
        if (result.results.success.length > 0) {
          setEnrolledStudents(enrolledStudents.filter((student) => !result.results.success.includes(student.id)))
          setSelectedStudents([])
        }
      }
    } catch (error: any) {
      console.error("Error processing bulk withdrawal:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. " + error.message,
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
      setShowConfirmDialog(false)
    }
  }

  // Filter students based on search term
  const filteredStudents = enrolledStudents.filter((student) => {
    const fullName = student.profiles?.full_name?.toLowerCase() || ""
    const email = student.profiles?.email?.toLowerCase() || ""
    const search = searchTerm.toLowerCase()
    return fullName.includes(search) || email.includes(search)
  })

  if (loading && courses.length === 0) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Course Withdrawal</h1>
        <p className="text-muted-foreground">Withdraw multiple students from a course at once</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Course</CardTitle>
          <CardDescription>Choose a course to view enrolled students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="course">Course</Label>
              <Select
                value={selectedCourse}
                onValueChange={(value) => setSelectedCourse(value)}
                disabled={loading || courses.length === 0}
              >
                <SelectTrigger id="course">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.course_code} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCourse && (
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Students</CardTitle>
            <CardDescription>
              Select students to withdraw from{" "}
              {courses.find((c) => c.id.toString() === selectedCourse)?.title || "this course"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : enrolledStudents.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No students enrolled</AlertTitle>
                <AlertDescription>There are no active enrollments for this course.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search students by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="selectAll"
                      checked={selectAll}
                      onCheckedChange={(checked) => {
                        setSelectAll(checked === true)
                      }}
                    />
                    <Label htmlFor="selectAll">Select All</Label>
                  </div>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Select</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Enrollment Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={() => handleStudentSelection(student.id)}
                            />
                          </TableCell>
                          <TableCell>{student.profiles?.full_name || "N/A"}</TableCell>
                          <TableCell>{student.profiles?.email || "N/A"}</TableCell>
                          <TableCell>
                            {student.enrollment_date ? format(new Date(student.enrollment_date), "MMM d, yyyy") : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredStudents.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No students match your search criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
          {enrolledStudents.length > 0 && (
            <CardFooter className="flex flex-col items-start gap-4">
              <div className="grid w-full gap-2">
                <Label htmlFor="withdrawalDate">Withdrawal Date</Label>
                <Input
                  id="withdrawalDate"
                  type="date"
                  value={withdrawalDate}
                  onChange={(e) => setWithdrawalDate(e.target.value)}
                />
              </div>
              <div className="grid w-full gap-2">
                <Label htmlFor="reason">Reason for Withdrawal (Optional)</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter a reason for the withdrawal..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                disabled={selectedStudents.length === 0 || processing}
                onClick={() => setShowConfirmDialog(true)}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  `Withdraw ${selectedStudents.length} Selected Students`
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Results</CardTitle>
            <CardDescription>
              {results.success.length} successful, {results.failed.length} failed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.success.length > 0 && (
              <div className="mb-4">
                <Alert className="bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Successfully Withdrawn</AlertTitle>
                  <AlertDescription className="text-green-700">
                    {results.success.length} students were successfully withdrawn from the course.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {results.failed.length > 0 && (
              <div>
                <Alert variant="destructive" className="mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Failed Withdrawals</AlertTitle>
                  <AlertDescription>
                    {results.failed.length} students could not be withdrawn. See details below.
                  </AlertDescription>
                </Alert>

                <div className="border rounded-md mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.failed.map((failure) => (
                        <TableRow key={failure.id}>
                          <TableCell>{failure.name}</TableCell>
                          <TableCell className="text-red-600">{failure.error}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirm Bulk Withdrawal"
        description={`Are you sure you want to withdraw ${selectedStudents.length} students from this course? This action cannot be undone.`}
        onConfirm={handleBulkWithdrawal}
        confirmText="Withdraw Students"
      />
    </div>
  )
}
