"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { AlertTriangle, WifiOff, Wifi } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"

interface Allowance {
  id: number
  student_id: string
  name: string
  amount: number
  payment_date: string
  status: string
  description: string | null
  created_at: string | null
  updated_at: string | null
}

export function StudentDashboardAllowances() {
  const [allowances, setAllowances] = useState<Allowance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableExists, setTableExists] = useState(true)
  const [connectionError, setConnectionError] = useState(false)

  const fetchAllowances = async () => {
    setLoading(true)
    setError(null)
    setConnectionError(false)

    try {
      const supabase = createClient()

      if (!supabase) {
        console.error("Supabase client is not initialized")
        setError("Database connection is not initialized")
        setConnectionError(true)
        return
      }

      // First get the current user
      const { data: userData } = await supabase.auth.getUser()

      if (!userData || !userData.user) {
        setError("User not authenticated")
        return
      }

      const userId = userData.user.id

      // Now use the userId in the query
      const { data, error } = await supabase
        .from("allowances")
        .select("*")
        .eq("student_id", userId)
        .order("payment_date", { ascending: false })

      if (error) {
        console.error("Error fetching allowances:", error)

        if (error.message.includes("relation") && error.message.includes("does not exist")) {
          setTableExists(false)
          setError("The allowances table does not exist in the database.")
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

      if (error.message === "Failed to fetch" || error.name === "TypeError") {
        setConnectionError(true)
        setError("Network error: Unable to connect to the database.")
      } else {
        setError(error.message || "An unexpected error occurred")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllowances()
  }, [])

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
          <CardTitle>My Allowances</CardTitle>
          <CardDescription>Your allowance information</CardDescription>
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

  // If the table doesn't exist, show a message
  if (!tableExists) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Allowances</CardTitle>
          <CardDescription>Your allowance information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">Allowance information is not available at this time.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Allowances</CardTitle>
        <CardDescription>Your allowance information</CardDescription>
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
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading allowances...</p>
          </div>
        ) : allowances.length === 0 ? (
          <div className="text-center py-4 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">No allowances found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {totalPaidAmount > 0 && (
              <div className="bg-green-50 text-green-700 px-3 py-2 rounded-md border border-green-200 mb-4">
                <span className="font-medium">Total Paid: </span>
                <span className="font-bold">${totalPaidAmount.toFixed(2)}</span>
              </div>
            )}

            {allowances.slice(0, 3).map((allowance) => (
              <div
                key={allowance.id}
                className="flex flex-col justify-between p-3 border rounded-lg hover:bg-muted/20 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{allowance.name}</h4>
                  <Badge className={getStatusColor(allowance.status)}>{allowance.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Payment date: {format(new Date(allowance.payment_date), "MMM d, yyyy")}
                </div>
                <div className="font-semibold mt-1">${allowance.amount.toFixed(2)}</div>
              </div>
            ))}

            {allowances.length > 3 && (
              <div className="text-center mt-2">
                <Button variant="link" className="text-sm" asChild>
                  <a href="/dashboard/allowances">View all {allowances.length} allowances</a>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
