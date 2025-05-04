"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Coins, Award } from "lucide-react"
import { ScholarshipDialog } from "./scholarship-dialog"
import { AllowanceDialog } from "./allowance-dialog"

interface UserFinancialButtonsProps {
  studentId: string
}

export function UserFinancialButtons({ studentId }: UserFinancialButtonsProps) {
  const [isScholarshipDialogOpen, setIsScholarshipDialogOpen] = useState(false)
  const [isAllowanceDialogOpen, setIsAllowanceDialogOpen] = useState(false)

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center"
        onClick={() => setIsScholarshipDialogOpen(true)}
      >
        <Award className="h-4 w-4 mr-1" />
        Scholarship
      </Button>
      <Button variant="outline" size="sm" className="flex items-center" onClick={() => setIsAllowanceDialogOpen(true)}>
        <Coins className="h-4 w-4 mr-1" />
        Allowance
      </Button>
      <Link href={`/dashboard/users/${studentId}`}>
        <Button variant="ghost" size="sm">
          View Details
        </Button>
      </Link>

      <ScholarshipDialog
        open={isScholarshipDialogOpen}
        onOpenChange={setIsScholarshipDialogOpen}
        studentId={studentId}
        scholarship={null}
      />

      <AllowanceDialog
        open={isAllowanceDialogOpen}
        onOpenChange={setIsAllowanceDialogOpen}
        studentId={studentId}
        allowance={null}
      />
    </div>
  )
}
