"use client"

import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { Loader } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  isDangerous?: boolean
}

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  isLoading = false,
  isDangerous = false,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-lg">
        <AlertDialog.Title className="text-lg font-semibold text-[#171532] mb-2">
          {title}
        </AlertDialog.Title>
        <AlertDialog.Description className="text-sm text-[#747384] mb-6">
          {description}
        </AlertDialog.Description>

        <div className="flex items-center justify-end gap-3">
          <AlertDialog.Cancel asChild>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#e5e7eb] hover:bg-[#d1d5db] text-[#171532] disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-colors ${
                isDangerous
                  ? "bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  : "bg-[#4a6670] hover:bg-[#3d565e] disabled:opacity-50"
              }`}
            >
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              {isLoading ? "Confirming..." : "Confirm"}
            </button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
