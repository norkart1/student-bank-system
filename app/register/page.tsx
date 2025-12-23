"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      // Validation
      if (!fullName.trim()) {
        setError("Full name is required")
        setIsLoading(false)
        return
      }

      if (!username.trim()) {
        setError("Username is required")
        setIsLoading(false)
        return
      }

      if (username.length < 3) {
        setError("Username must be at least 3 characters")
        setIsLoading(false)
        return
      }

      if (!password) {
        setError("Password is required")
        setIsLoading(false)
        return
      }

      if (password.length < 4) {
        setError("Password must be at least 4 characters")
        setIsLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match")
        setIsLoading(false)
        return
      }

      // Check if username already exists in MongoDB
      const checkRes = await fetch("/api/students")
      const existingStudents = await checkRes.json()
      
      if (existingStudents.some((s: any) => s.username === username.trim())) {
        setError("Username already exists")
        setIsLoading(false)
        return
      }

      // Create new account in MongoDB
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName.trim(),
          username: username.trim(),
          password: password,
          balance: 0,
          transactions: [],
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to create account")
      }

      setSuccess("Account created successfully! Redirecting to login...")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      setError("Failed to create account. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col md:flex-row">
      {/* Image Section */}
      <div className="hidden md:block w-1/2 bg-gradient-to-b from-[#2a5f6f] to-[#1a3f4f] relative overflow-hidden">
        <Image
          src="/islamic-mosque.jpg"
          alt="Islamic artwork"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 flex flex-col px-6 md:px-12 py-8 md:py-16 justify-start md:justify-center">
        <Link href="/login">
          <div className="w-10 h-10 bg-[#4a6670] rounded-full flex items-center justify-center hover:bg-[#3d565e] transition-colors mb-8">
            <ArrowLeft className="w-5 h-5 text-white" />
          </div>
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#171532] leading-tight">
            Create<br />Your Account
          </h1>
          <p className="text-[#747384] mt-2">Join JDSA Students Bank</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 max-w-md">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
              <Lock className="w-5 h-5" />
            </div>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-14 pl-12 bg-white border border-[#e5e7eb] rounded-xl text-[#171532] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#4a6670]/30 focus:border-[#4a6670]"
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
              <Lock className="w-5 h-5" />
            </div>
            <Input
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="h-14 pl-12 bg-white border border-[#e5e7eb] rounded-xl text-[#171532] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#4a6670]/30 focus:border-[#4a6670]"
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
              <Lock className="w-5 h-5" />
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-14 pl-12 pr-12 bg-white border border-[#e5e7eb] rounded-xl text-[#171532] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#4a6670]/30 focus:border-[#4a6670]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#4a6670] transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
              <Lock className="w-5 h-5" />
            </div>
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-14 pl-12 pr-12 bg-white border border-[#e5e7eb] rounded-xl text-[#171532] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#4a6670]/30 focus:border-[#4a6670]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#4a6670] transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-xl text-center">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-[#4a6670] hover:bg-[#3d565e] text-white text-lg font-semibold rounded-2xl shadow-lg transition-all duration-300 disabled:opacity-70 mt-6"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-[#747384] text-sm mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-[#4a6670] font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
