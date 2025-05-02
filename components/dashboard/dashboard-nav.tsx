"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Users, Settings, ImageIcon, Newspaper } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  roles: string[]
}

const items: NavItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    roles: ["admin", "student", "teacher"],
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: <FileText className="mr-2 h-4 w-4" />,
    roles: ["admin", "teacher"],
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: <Users className="mr-2 h-4 w-4" />,
    roles: ["admin"],
  },
  {
    title: "News Management",
    href: "/dashboard/news",
    icon: <Newspaper className="mr-2 h-4 w-4" />,
    roles: ["admin"],
  },
  {
    title: "Gallery Management",
    href: "/dashboard/gallery",
    icon: <ImageIcon className="mr-2 h-4 w-4" />,
    roles: ["admin"],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="mr-2 h-4 w-4" />,
    roles: ["admin", "student", "teacher"],
  },
]

interface DashboardNavProps {
  userRole: string
}

export function DashboardNav({ userRole }: DashboardNavProps) {
  const pathname = usePathname()

  const filteredItems = items.filter((item) => item.roles.includes(userRole))

  return (
    <nav className="grid items-start gap-2">
      {filteredItems.map((item, index) => (
        <Link key={index} href={item.href}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent" : "transparent",
            )}
          >
            {item.icon}
            <span>{item.title}</span>
          </span>
        </Link>
      ))}
    </nav>
  )
}
