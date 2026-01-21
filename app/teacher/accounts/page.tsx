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
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2025-26")
  const [academicYears, setAcademicYears] = useState<string[]>([])
  const [showYearDropdown, setShowYearDropdown] = useState(false)

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch("/api/students")
        if (res.ok) {
          const data = await res.json()
          setStudents(data)
          
          // Dynamically extract unique academic years from students
          const years = new Set<string>()
          data.forEach((s: any) => {
            if (s.academicYear) years.add(s.academicYear)
          })
          // Add default if empty
          if (years.size === 0) years.add("2025-26")
          
          setAcademicYears(Array.from(years).sort().reverse())
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Link 
              key={student._id}
              href={`/teacher/accounts/ledger/${student._id}`}
              className="block group"
            >
              <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-lg font-bold text-[#1a1a2e]">#{student.code}</h4>
                  <span className="px-3 py-1 bg-[#e7f5ee] text-[#2d6a4f] text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Active
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                    <span className="text-xs text-gray-400">Student</span>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-50 flex items-center justify-center">
                        {student.profileImage ? (
                          <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-[#2d6a4f]/10 text-[#2d6a4f] flex items-center justify-center font-bold text-sm">
                            {student.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold text-[#1a1a2e] uppercase">{student.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                    <span className="text-xs text-gray-400">Balance</span>
                    <span className="text-sm font-bold text-[#2d6a4f]">₹ {student.balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Year</span>
                    <span className="text-sm font-medium text-gray-600">{student.academicYear || '2025-26'}</span>
                  </div>
                </div>
                
                <div className="absolute right-4 bottom-4 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-[#2d6a4f] group-hover:text-white transition-all shadow-sm">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
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
