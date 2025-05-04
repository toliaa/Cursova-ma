"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { testSupabaseConnection } from "@/lib/supabase/test-connection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertTriangle, Database, Wifi, WifiOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function DatabaseSetupPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({})
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean
    success: boolean
    message: string
  }>({
    tested: false,
    success: false,
    message: "",
  })

  // Test connection on page load
  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    setLoading(true)
    try {
      const result = await testSupabaseConnection()

      setConnectionStatus({
        tested: true,
        success: result.success,
        message: result.success ? result.message : result.error || "Connection failed",
      })

      if (result.success) {
        toast({
          title: "Connection Successful",
          description: "Successfully connected to the Supabase database",
        })
      } else {
        toast({
          title: "Connection Failed",
          description: result.error || "Failed to connect to the database",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: error.message || "An unexpected error occurred",
      })

      toast({
        title: "Connection Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const runScholarshipsMigration = async () => {
    if (!connectionStatus.success) {
      toast({
        title: "Connection Error",
        description: "Please ensure you have a working database connection before running migrations",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      // Create scholarships table
      const { error: createTableError } = await supabase.rpc("create_scholarships_table", {})

      if (createTableError) {
        console.error("Error creating scholarships table:", createTableError)
        setResults((prev) => ({
          ...prev,
          scholarships: {
            success: false,
            message: createTableError.message,
          },
        }))
        toast({
          title: "Error",
          description: `Failed to create scholarships table: ${createTableError.message}`,
          variant: "destructive",
        })
        return
      }

      setResults((prev) => ({
        ...prev,
        scholarships: {
          success: true,
          message: "Scholarships table created successfully",
        },
      }))

      toast({
        title: "Success",
        description: "Scholarships table created successfully",
      })
    } catch (error: any) {
      console.error("Error in runScholarshipsMigration:", error)
      setResults((prev) => ({
        ...prev,
        scholarships: {
          success: false,
          message: error.message || "An unexpected error occurred",
        },
      }))
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const runAllowancesMigration = async () => {
    if (!connectionStatus.success) {
      toast({
        title: "Connection Error",
        description: "Please ensure you have a working database connection before running migrations",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      // Create allowances table
      const { error: createTableError } = await supabase.rpc("create_allowances_table", {})

      if (createTableError) {
        console.error("Error creating allowances table:", createTableError)
        setResults((prev) => ({
          ...prev,
          allowances: {
            success: false,
            message: createTableError.message,
          },
        }))
        toast({
          title: "Error",
          description: `Failed to create allowances table: ${createTableError.message}`,
          variant: "destructive",
        })
        return
      }

      setResults((prev) => ({
        ...prev,
        allowances: {
          success: true,
          message: "Allowances table created successfully",
        },
      }))

      toast({
        title: "Success",
        description: "Allowances table created successfully",
      })
    } catch (error: any) {
      console.error("Error in runAllowancesMigration:", error)
      setResults((prev) => ({
        ...prev,
        allowances: {
          success: false,
          message: error.message || "An unexpected error occurred",
        },
      }))
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const runAllMigrations = async () => {
    if (!connectionStatus.success) {
      toast({
        title: "Connection Error",
        description: "Please ensure you have a working database connection before running migrations",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    await runScholarshipsMigration()
    await runAllowancesMigration()
    setLoading(false)
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Database Setup</h1>
      <p className="text-muted-foreground mb-8">
        This page helps you set up the required database tables for the higher education portal.
      </p>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Database Connection
            </CardTitle>
            <CardDescription>Test your connection to the Supabase database</CardDescription>
          </CardHeader>
          <CardContent>
            {connectionStatus.tested && (
              <Alert variant={connectionStatus.success ? "default" : "destructive"} className="mb-4">
                {connectionStatus.success ? <CheckCircle2 className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                <AlertTitle>{connectionStatus.success ? "Connected" : "Connection Failed"}</AlertTitle>
                <AlertDescription>{connectionStatus.message}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={testConnection}
              disabled={loading}
              variant={connectionStatus.success ? "outline" : "default"}
              className="flex items-center gap-2"
            >
              {loading ? "Testing Connection..." : "Test Connection"}
              {connectionStatus.success && !loading && <CheckCircle2 className="h-4 w-4" />}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Migrations
            </CardTitle>
            <CardDescription>Run migrations to create the necessary tables in your Supabase database</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Migrations</TabsTrigger>
                <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
                <TabsTrigger value="allowances">Allowances</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="space-y-4">
                  <p>Run all migrations to set up the complete database structure.</p>
                  <Button onClick={runAllMigrations} disabled={loading || !connectionStatus.success}>
                    {loading ? "Running Migrations..." : "Run All Migrations"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="scholarships">
                <div className="space-y-4">
                  <p>Create the scholarships table and set up the necessary permissions.</p>
                  {results.scholarships && (
                    <Alert variant={results.scholarships.success ? "default" : "destructive"}>
                      {results.scholarships.success ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      <AlertTitle>{results.scholarships.success ? "Success" : "Error"}</AlertTitle>
                      <AlertDescription>{results.scholarships.message}</AlertDescription>
                    </Alert>
                  )}
                  <Button onClick={runScholarshipsMigration} disabled={loading || !connectionStatus.success}>
                    {loading ? "Creating Table..." : "Create Scholarships Table"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="allowances">
                <div className="space-y-4">
                  <p>Create the allowances table and set up the necessary permissions.</p>
                  {results.allowances && (
                    <Alert variant={results.allowances.success ? "default" : "destructive"}>
                      {results.allowances.success ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      <AlertTitle>{results.allowances.success ? "Success" : "Error"}</AlertTitle>
                      <AlertDescription>{results.allowances.message}</AlertDescription>
                    </Alert>
                  )}
                  <Button onClick={runAllowancesMigration} disabled={loading || !connectionStatus.success}>
                    {loading ? "Creating Table..." : "Create Allowances Table"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <h3 className="text-sm font-medium mb-2">Manual SQL Setup</h3>
            <p className="text-sm text-muted-foreground mb-2">
              If the automatic setup doesn't work, you can run these SQL commands directly in your Supabase SQL editor:
            </p>
            <div className="bg-muted p-3 rounded-md text-xs w-full overflow-auto">
              <pre className="whitespace-pre-wrap">
                {`-- Create scholarships table
CREATE TABLE IF NOT EXISTS public.scholarships (
  id SERIAL PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scholarships_student_id ON public.scholarships(student_id);

-- Create allowances table
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
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowances ENABLE ROW LEVEL SECURITY;

-- Create policies for scholarships
CREATE POLICY "Admins can do anything with scholarships"
  ON public.scholarships
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Students can view their own scholarships"
  ON public.scholarships
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- Create policies for allowances
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
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
