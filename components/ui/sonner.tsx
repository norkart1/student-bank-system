import * as React from "react"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#1a1f2e] group-[.toaster]:text-white group-[.toaster]:border-none group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl group-[.toaster]:p-4",
          description: "group-[.toast]:text-gray-400 group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:border-b-4 group-[.toast]:border-green-500",
          error: "group-[.toast]:border-b-4 group-[.toast]:border-red-500",
          warning: "group-[.toast]:border-b-4 group-[.toast]:border-yellow-500",
          info: "group-[.toast]:border-b-4 group-[.toast]:border-blue-500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
