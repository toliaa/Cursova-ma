import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { MobileNav } from "@/components/dashboard/mobile-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // Get user profile with role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

  const userRole = profile?.role || "student"

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 items-start">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <MobileNav userRole={userRole} />
            <div className="ml-auto flex items-center space-x-4">
              {/* You can add user dropdown or other header elements here */}
            </div>
          </div>
        </div>
        <div className="grid flex-1 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
          <aside className="hidden w-[200px] flex-col md:flex lg:w-[250px] border-r py-8 px-4">
            <DashboardNav userRole={userRole} />
          </aside>
          <main className="flex w-full flex-1 flex-col overflow-hidden p-4 md:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
