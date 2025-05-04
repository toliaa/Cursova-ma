"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Plus, Edit, Trash2, AlertTriangle, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AllowanceDialog } from "./allowance-dialog"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { deleteAllowance } from "@/app/actions/allowance-actions"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Allowance {
  id: number
  student_id: string
  type: string
  amount: number
  payment_date: string
  status: string
  description: string | null
  created_at: string | null
  updated_at: string | null
}

interface StudentAllowancesProps {
  studentId: string
  allowances: Allowance[]
  isAdmin: boolean
}

export function StudentAllowances({ studentId, allowances: initialAllowances = [], isAdmin }: StudentAllowancesProps) {
  const { toast } = useToast()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAllowance, setSelectedAllowance] = useState<Allowance | null>(null)
  const [allowances, setAllowances] = useState<Allowance[]>(initialAllowances)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const [connectionError, setConnectionError] = useState(false)

  // Fetch allowances on component mount and when needed
  const fetchAllowances = async () => {
    setLoading(true)
    setError(null)
    setConnectionError(false)

    try {
      // Create a Supabase client using our client helper
      const supabase = createClient()

      // Check if we have a valid Supabase client
      if (!supabase) {
        console.error("Supabase client is not initialized")
        setError("Database connection is not initialized")
        setConnectionError(true)
        return
      }

      const { data, error } = await supabase
        .from("allowances")
        .select("*")
        .eq("student_id", studentId)
        .order("payment_date", { ascending: false })

      if (error) {
        console.error("Error fetching allowances:", error)

        // Check if the error is about the table not existing
        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          setTableExists(false)
          setError("The allowances table does not exist in the database. Please run the migration script.")
        } else {
          setError(error.message)
        }
      } else {
        console.log("Fetched allowances:", data)
        setAllowances(data || [])
        setTableExists(true)
      }
    } catch (error: any) {
      console.error("Error in fetchAllowances:", error)

      // Check if it's a network error
      if (error.message === "Failed to fetch" || error.name === "TypeError") {
        setConnectionError(true)
        setError("Network error: Unable to connect to the database. Please check your internet connection.")
      } else {
        setError(error.message || "An unexpected error occurred")
      }
    } finally {
      setLoading(false)
    }
  }

  // Fetch allowances on component mount
  useEffect(() => {
    fetchAllowances()
  }, [studentId])

  const handleEdit = (allowance: Allowance) => {
    setSelectedAllowance(allowance)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (allowance: Allowance) => {
    setSelectedAllowance(allowance)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedAllowance) return

    try {
      const result = await deleteAllowance(selectedAllowance.id, studentId)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Allowance deleted successfully",
        })
        // Refresh allowances after deletion
        fetchAllowances()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete allowance",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  // Calculate total paid allowance amount
  const totalPaidAmount = allowances
    .filter((a) => a.status.toLowerCase() === "paid")
    .reduce((sum, allowance) => sum + allowance.amount, 0)

  // If we have a connection error, show a special message
  if (connectionError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Allowances</CardTitle>
          <CardDescription>Student allowance information</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              Unable to connect to the database. Please check your internet connection and try again.
            </AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={fetchAllowances} className="flex items-center gap-2" disabled={loading}>
              {loading ? "Connecting..." : "Try Again"}
              {loading ? <Wifi className="h-4 w-4 animate-pulse" /> : <Wifi className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If the table doesn't exist and user is admin, show a special message
  if (!tableExists && isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Allowances</CardTitle>
          <CardDescription>Student allowance information</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Database Setup Required</AlertTitle>
            <AlertDescription>
              The allowances table does not exist in the database. Please run the migration script to create it.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <div className="space-y-4 w-full">
            <h3 className="text-sm font-medium">How to run the migration script:</h3>
            <div className="bg-muted p-3 rounded-md text-xs">
              <pre className="whitespace-pre-wrap">
                {`-- Connect to your database and run:

CREATE TABLE IF NOT EXISTS public.allowances (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date DATE NOT NULL,
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_allowances_student_id ON public.allowances(student_id);

-- Set up Row Level Security
ALTER TABLE public.allowances ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can do anything with allowances"
  ON public.allowances
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Students can view their own allowances"
  ON public.allowances
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());`}
              </pre>
            </div>
          </div>
        </CardFooter>
      </Card>
    )
  }

  // If the table doesn't exist and user is not admin, show a simpler message
  if (!tableExists && !isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Allowances</CardTitle>
          <CardDescription>Student allowance information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">Allowance information is not available at this time.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Allowances</CardTitle>
          <CardDescription>Student allowance information</CardDescription>
        </div>
        <div className="flex items-center gap-4">
          {totalPaidAmount > 0 && (
            <div className="bg-green-50 text-green-700 px-3 py-1 rounded-md border border-green-200">
              <span className="font-medium">Total Paid: </span>
              <span className="font-bold">${totalPaidAmount.toFixed(2)}</span>
            </div>
          )}
          {isAdmin && (
            <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Allowance
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && !loading && !connectionError && !tableExists && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading allowances...</p>
          </div>
        ) : allowances.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No allowances found</p>
            {isAdmin && (
              <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Allowance
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {allowances.map((allowance) => (
              <div
                key={allowance.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg hover:bg-muted/20 transition-colors"
              >
                <div className="space-y-2 mb-4 md:mb-0">
                  <div className="flex items-center">
                    <h4 className="font-medium text-lg">{allowance.type}</h4>
                    <Badge className={`ml-2 ${getStatusColor(allowance.status)}`}>{allowance.status}</Badge>
                  </div>
                  <p className="text-muted-foreground">
                    Payment Date: {format(new Date(allowance.payment_date), "MMM d, yyyy")}
                  </p>
                  <p className="font-semibold">${allowance.amount.toFixed(2)}</p>
                  {allowance.description && <p className="text-sm">{allowance.description}</p>}
                </div>
                {isAdmin && (
                  <div className="flex space-x-2 w-full md:w-auto">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(allowance)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(allowance)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {isAdmin && (
        <>
          <AllowanceDialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              setIsAddDialogOpen(open)
              if (!open) fetchAllowances()
            }}
            studentId={studentId}
            allowance={null}
          />

          {selectedAllowance && (
            <AllowanceDialog
              open={isEditDialogOpen}
              onOpenChange={(open) => {
                setIsEditDialogOpen(open)
                if (!open) fetchAllowances()
              }}
              studentId={studentId}
              allowance={selectedAllowance}
            />
          )}

          <ConfirmationDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title="Delete Allowance"
            description="Are you sure you want to delete this allowance? This action cannot be undone."
            onConfirm={confirmDelete}
          />
        </>
      )}
    </Card>
  )
}
