"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search, ArrowLeft, QrCode, X, Loader } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import QrScanner from "qr-scanner"

export default function SearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<"code" | "name">("code")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [isScannerReady, setIsScannerReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const qrScannerRef = useRef<QrScanner | null>(null)

  useEffect(() => {
    if (showQRScanner && videoRef.current) {
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          if (result?.data) {
            let scannedValue = result.data.toString().trim()
            
            // Extract code from URL if it's a link (e.g., https://.../login?code=MR-5774)
            try {
              if (scannedValue.includes('?code=')) {
                const url = new URL(scannedValue)
                scannedValue = url.searchParams.get('code') || scannedValue
              } else if (scannedValue.startsWith('http')) {
                // If it's a dashboard link (e.g., https://.../user/dashboard?id=...)
                // We'll let the search handle it or extract what we can
                const url = new URL(scannedValue)
                const id = url.searchParams.get('id')
                if (id) {
                  // If we have an ID, we might need a different search approach, 
                  // but for now let's just use the raw value if it's not a clear code
                }
              }
            } catch (e) {
              console.error("URL parsing error:", e)
            }

            setSearchQuery(scannedValue)
            setSearchType("code")
            setShowQRScanner(false)
            handleSearch({ preventDefault: () => {} } as React.FormEvent, scannedValue)
          }
        },
        {
          onDecodeError: () => {},
          preferredCamera: "environment",
          maxScansPerSecond: 5,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      )

      qrScannerRef.current = qrScanner

      qrScanner
        .start()
        .then(() => {
          setIsScannerReady(true)
          setError("")
        })
        .catch((err) => {
          console.error("Camera error:", err)
          setError("Unable to access camera. Please ensure you have granted camera permissions.")
          setShowQRScanner(false)
        })

      return () => {
        qrScanner.destroy()
        qrScannerRef.current = null
      }
    }
  }, [showQRScanner])

  const handleSearch = async (e: React.FormEvent, codeToSearch?: string) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const query = codeToSearch || searchQuery

    try {
      const endpoint = searchType === "code" 
        ? `code=${encodeURIComponent(query.toUpperCase())}` 
        : `name=${encodeURIComponent(query)}`
      
      const res = await fetch(`/api/students/search?${endpoint}`)
      
      if (!res.ok) {
        setError("Account holder not found")
        setIsLoading(false)
        return
      }

      const student = await res.json()
      
      // Create session via MongoDB instead of localStorage
      const sessionRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: searchType === "code" ? query.toUpperCase() : undefined,
          name: searchType === "name" ? query : undefined,
          type: "user"
        })
      })
      
      if (sessionRes.ok) {
        router.push("/user/dashboard")
      } else {
        setError("Failed to create session")
        setIsLoading(false)
      }
    } catch (err) {
      setError("Search error. Please try again.")
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
        <Link href="/">
          <div className="w-10 h-10 bg-[#2d6a4f] rounded-full flex items-center justify-center hover:bg-[#1b4332] transition-colors mb-8">
            <ArrowLeft className="w-5 h-5 text-white" />
          </div>
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#171532] leading-tight">
            Find Your<br />Account
          </h1>
          <p className="text-[#6b7280] mt-2">Search by account code or full name</p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4 max-w-md">
          {/* Search Type Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setSearchType("code")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                searchType === "code"
                  ? "bg-[#2d6a4f] text-white"
                  : "bg-[#e5e7eb] text-[#171532] hover:bg-[#d1d5db]"
              }`}
            >
              By Code
            </button>
            <button
              type="button"
              onClick={() => setSearchType("name")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                searchType === "name"
                  ? "bg-[#2d6a4f] text-white"
                  : "bg-[#e5e7eb] text-[#171532] hover:bg-[#d1d5db]"
              }`}
            >
              By Name
            </button>
          </div>

          {/* Search Input with QR Scanner Button */}
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]">
                <Search className="w-5 h-5" />
              </div>
              <Input
                type="text"
                placeholder={searchType === "code" ? "e.g., MR-5774" : "Enter full name"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                required
                className="h-14 pl-12 bg-white border border-[#e5e7eb] rounded-xl text-[#171532] placeholder:text-[#9ca3af] focus:ring-2 focus:ring-[#2d6a4f]/30 focus:border-[#2d6a4f]"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowQRScanner(true)}
              disabled={isLoading}
              className="h-14 px-4 bg-[#2d6a4f] hover:bg-[#1b4332] text-white rounded-xl transition-colors flex items-center justify-center disabled:opacity-50"
              title="Scan QR Code"
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-[#2d6a4f] hover:bg-[#1b4332] text-white text-lg font-semibold rounded-2xl shadow-lg transition-all duration-300 disabled:opacity-70 mt-6 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </button>
        </form>

        <p className="text-sm text-[#6b7280] mt-8">
          Don't have an account code? Contact administration for assistance.
        </p>

        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="flex gap-6">
            <Link href="/admin-login" className="text-xs text-[#2d6a4f] hover:text-[#1b4332] underline transition-colors">
              Admin Login
            </Link>
            <Link href="/teacher-login" className="text-xs text-[#2d6a4f] hover:text-[#1b4332] underline transition-colors">
              Teacher Login
            </Link>
          </div>
          <div className="flex gap-4 text-[10px] text-[#6b7280]">
            <Link href="/privacy" className="hover:text-[#2d6a4f] hover:underline transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#2d6a4f] hover:underline transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-md mx-4 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
              <h3 className="text-xl font-bold text-[#171532]">Scan QR Code</h3>
              <button
                onClick={() => setShowQRScanner(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5f5f5] text-[#747384] hover:bg-[#e5e5e5] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scanner */}
            <div className="relative bg-black p-6">
              <div className="relative w-full bg-black rounded-2xl overflow-hidden">
                <video
                  ref={videoRef}
                  style={{
                    width: "100%",
                    height: "auto",
                    aspectRatio: "1 / 1",
                    objectFit: "cover",
                  }}
                  className="rounded-2xl"
                />
                {!isScannerReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                    <div className="text-center">
                      <Loader className="w-8 h-8 animate-spin text-white mx-auto mb-2" />
                      <p className="text-white text-sm">Initializing camera...</p>
                    </div>
                  </div>
                )}
                {/* QR Frame Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-4 border-[#2d6a4f] rounded-3xl shadow-[inset_0_0_20px_rgba(74,102,112,0.3)]" />
                </div>
              </div>

              {/* Instructions */}
              <div className="text-center mt-4 text-white">
                <p className="text-sm">Position the QR code inside the frame</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#f0f0f0]">
              <button
                onClick={() => setShowQRScanner(false)}
                className="w-full py-3 bg-[#f0f0f0] hover:bg-[#e5e5e5] text-[#171532] font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
