"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { toast } from "@/lib/toast"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState(1) // 1: Email, 2: OTP
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await res.json()
      if (res.ok) {
        setStep(2)
        setIsLoading(false)
        toast.success("OTP Sent", "Please check your email for the verification code.")
        return
      }

      setError(data.error || "Failed to send OTP")
      toast.error("Error Occurred", data.error || "Failed to send OTP")
      setIsLoading(false)
    } catch (err) {
      setError("Error sending OTP. Please try again.")
      toast.error("Error Occurred", "Connection error. Unable to connect to the server at present")
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("Saved Successfully", "Your changes have been saved successfully")
        router.push("/admin/dashboard")
        return
      }

      setError(data.error || "Invalid or expired OTP")
      toast.error("Error Occurred", data.error || "Invalid or expired OTP")
      setIsLoading(false)
    } catch (err) {
      setError("Login error. Please try again.")
      toast.error("Error Occurred", "Connection error. Unable to connect to the server at present")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col md:flex-row">
      {/* Image Section */}
      <div className="hidden md:block w-1/2 bg-gradient-to-b from-[#2a5f6f] to-[#1a3f4f] relative overflow-hidden">
        <Image
          src="/islamic-mosque.png"
          alt="Islamic artwork"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 flex flex-col px-6 md:px-12 py-8 md:py-16 justify-start md:justify-center">
        <Link href="/login">
          <div className="w-10 h-10 bg-[#2d6a4f] rounded-full flex items-center justify-center hover:bg-[#1b4332] transition-colors mb-8">
            <ArrowLeft className="w-5 h-5 text-white" />
          </div>
        </Link>

        <div className="mb-10 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="w-24 h-24 mb-6 relative rounded-2xl overflow-hidden shadow-lg border-2 border-[#2d6a4f]/10">
            <Image
              src="/students_logo.png"
              alt="JDSA Students Bank"
              fill
              className="object-cover"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#171532] leading-tight">
            JDSA<br />Students Bank
          </h1>
          <p className="text-sm text-[#6b7280] mt-2">Admin Portal</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4 max-w-md">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                <Mail className="w-5 h-5" />
              </div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 pl-12 bg-white border border-[#e5e7eb] rounded-xl text-[#171532] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-lg font-semibold rounded-2xl shadow-lg transition-all duration-300 disabled:opacity-70 mt-6"
            >
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6 max-w-md flex flex-col items-center md:items-start">
            <div className="w-full flex justify-center md:justify-start">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <div className="w-full text-sm text-red-600 bg-red-50 p-3 rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full h-14 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-lg font-semibold rounded-2xl shadow-lg transition-all duration-300 disabled:opacity-70 mt-2"
            >
              {isLoading ? "Verifying..." : "Login"}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-sm text-[#2d6a4f] hover:text-[#1b4332] transition-colors"
            >
              Change Email
            </button>
          </form>
        )}

        <div className="text-center mt-8 space-y-4">
          <Link href="/login" className="block text-xs text-[#2d6a4f] hover:text-[#1b4332] underline transition-colors">
            Back to Student Login
          </Link>
          <p className="text-[10px] text-gray-400 max-w-xs mx-auto px-4">
            By logging in, you agree to our Terms and Conditions. This system is for authorized personnel only. All activities are logged.
          </p>
        </div>
      </div>
    </div>
  )
}
