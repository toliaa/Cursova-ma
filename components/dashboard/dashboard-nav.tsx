"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  type LucideIcon,
  LayoutDashboard,
  Users,
  Newspaper,
  ImageIcon,
  FileText,
  Settings,
  GraduationCap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  roles?: string[]
}

interface DashboardNavProps {
  userRole?: string | null
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Users",
      href: "/dashboard/users",
      icon: Users,
      roles: ["admin"],
    },
    {
      title: "News",
      href: "/dashboard/news",
      icon: Newspaper,
      roles: ["admin"],
    },
    {
      title: "Gallery",
      href: "/dashboard/gallery",
      icon: ImageIcon,
      roles: ["admin"],
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: FileText,
      roles: ["admin", "teacher"],
    },
    {
      title: "Courses",
      href: "/dashboard/courses",
      icon: GraduationCap,
      roles: ["admin"],
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <nav className="grid gap-2 px-2">
      {navItems.map((item) => {
        // Check if the item should be shown based on user role
        if (item.roles && userRole && !item.roles.includes(userRole)) {
          return null
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
              "justify-start",
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
