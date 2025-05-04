"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"
import { QuickWithdrawalDialog } from "./quick-withdrawal-dialog"

interface UserWithdrawalButtonProps {
  userId: string
  userName: string
  courses: any[]
}

export function UserWithdrawalButton({ userId, userName, courses }: UserWithdrawalButtonProps) {
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setShowWithdrawalDialog(true)}>
        <GraduationCap className="h-4 w-4 mr-1" />
        Withdraw
      </Button>

      <QuickWithdrawalDialog
        open={showWithdrawalDialog}
        onOpenChange={setShowWithdrawalDialog}
        userId={userId}
        userName={userName}
        courses={courses}
      />
    </>
  )
}
