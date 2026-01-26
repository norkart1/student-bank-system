"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Users, 
  ArrowLeft, 
  Search, 
  ChevronRight,
  Loader,
  Activity,
  ChevronDown,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"

export default function TeacherAccountsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("")
  const [academicYears, setAcademicYears] = useState<string[]>([])
  const [showYearDropdown, setShowYearDropdown] = useState(false)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("/api/students")
        if (res.ok) {
          const data = await res.json()
          setStudents(data)
          
          const years = new Set<string>()
          data.forEach((s: any) => {
            if (s.academicYear) years.add(s.academicYear)
          })
          
          if (years.size === 0) {
            years.add("2025-26")
            setSelectedAcademicYear("2025-26")
          } else {
            const sortedYears = Array.from(years).sort().reverse()
            setAcademicYears(sortedYears)
            // Default to the first (latest) session found
            setSelectedAcademicYear(sortedYears[0])
          }
        }
      } catch (err) {
        console.error("Fetch accounts error:", err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAccounts()
  }, [])

  const filteredStudents = students.filter(s => 
    (s.academicYear === selectedAcademicYear) &&
    (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader className="w-8 h-8 animate-spin text-[#2d6a4f]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/teacher/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-[#1a1a2e]" />
            </Link>
            <h1 className="text-3xl font-bold text-[#1a1a2e]">Student Accounts</h1>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowYearDropdown(!showYearDropdown)}
              className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold text-[#1a1a2e] hover:bg-gray-100 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              {selectedAcademicYear}
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showYearDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                {academicYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedAcademicYear(year)
                      setShowYearDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                      selectedAcademicYear === year 
                        ? 'bg-[#2d6a4f] text-white' 
                        : 'text-[#1a1a2e] hover:bg-gray-50'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative w-full mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input 
            placeholder="Search students..."
            className="pl-12 h-14 bg-gray-50 border-none rounded-2xl shadow-inner focus:ring-2 focus:ring-[#2d6a4f]/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredStudents.map((student) => (
            <div 
              key={student._id}
              className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center relative group hover:shadow-md transition-all cursor-pointer"
              onClick={() => router.push(`/teacher/accounts/ledger/${student._id}`)}
            >
              <div className="w-full aspect-square mb-3 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center">
                {student.profileImage ? (
                  <img 
                    src={student.profileImage} 
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#2d6a4f]/10 flex items-center justify-center text-[#2d6a4f] text-2xl font-bold">
                    {student.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <h4 className="text-sm font-bold text-[#1a1a2e] mb-1 line-clamp-1">{student.name}</h4>
              <p className="text-xs font-bold text-[#2d6a4f]">₹ {student.balance?.toLocaleString('en-IN')}</p>
              
              <button 
                className="absolute bottom-2 right-2 w-8 h-8 bg-[#4ade80] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform active:scale-95"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No accounts found in this session</p>
          </div>
        )}
      </div>
    </div>
  )
}
