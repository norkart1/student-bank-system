"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

interface AddStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddStudent: (student: any) => void
}

export function AddStudentDialog({ open, onOpenChange, onAddStudent }: AddStudentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    balance: "0",
    profileImage: "",
  })
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string>("")

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Cloudinary
    setUploading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataToSend,
      })

      const data = await response.json()
      if (data.secure_url) {
        setFormData({ ...formData, profileImage: data.secure_url })
      }
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddStudent(formData)
    setFormData({ name: "", email: "", studentId: "", balance: "0", profileImage: "" })
    setPreview("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>Create a new student bank account</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile">Profile Image</Label>
            {preview && (
              <div className="mb-2 relative w-24 h-24">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}
            <Input
              id="profile"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="cursor-pointer"
            />
            {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              placeholder="STU001"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="balance">Initial Balance</Label>
            <Input
              id="balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={uploading}>
              Add Student
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
