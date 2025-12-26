"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, Loader } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"

interface ExcelTransaction {
  studentCode: string
  date: string
  type: "deposit" | "withdrawal" | "withdraw"
  amount: number
}

// Helper function to parse dates from various formats
function parseDate(dateStr: any): string | null {
  if (!dateStr) return null

  // If it's a number (Excel serial date)
  if (typeof dateStr === "number") {
    const excelDate = new Date((dateStr - 25569) * 86400 * 1000)
    return excelDate.toLocaleDateString("en-GB").split("/").reverse().join("-") // YYYY-MM-DD format
  }

  // If it's a string, try to parse it
  const str = String(dateStr).trim()

  // Try DD/MM/YYYY format
  const ddmmyyyyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (!isNaN(date.getTime())) {
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`
    }
  }

  // Try YYYY-MM-DD format
  const yyyymmddMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (yyyymmddMatch) {
    const [, year, month, day] = yyyymmddMatch
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (!isNaN(date.getTime())) {
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`
    }
  }

  // Try MM/DD/YYYY format
  const mmddyyyyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mmddyyyyMatch) {
    const [, month, day, year] = mmddyyyyMatch
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (!isNaN(date.getTime())) {
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`
    }
  }

  // Try parsing as ISO date
  const isoDate = new Date(str)
  if (!isNaN(isoDate.getTime())) {
    return isoDate.toLocaleDateString("en-GB").split("/").reverse().join("-").replace(/-/g, "/").split("/").reverse().join("/")
  }

  return null
}

// Function to parse CSV
function parseCSV(text: string): any[] {
  const lines = text.trim().split("\n")
  if (lines.length === 0) return []

  // Parse header
  const headers = lines[0].split(",").map((h) => h.trim())
  const data: any[] = []

  // Find column indices
  const studentCodeIdx = headers.findIndex((h) =>
    h.toLowerCase().includes("code") || h.toLowerCase().includes("student")
  )
  const dateIdx = headers.findIndex((h) => h.toLowerCase().includes("date"))
  const typeIdx = headers.findIndex((h) => h.toLowerCase().includes("type"))
  const amountIdx = headers.findIndex((h) => h.toLowerCase().includes("amount"))

  // Parse rows
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    if (values.length > Math.max(studentCodeIdx, dateIdx, typeIdx, amountIdx)) {
      data.push({
        studentCode: values[studentCodeIdx] || "",
        date: values[dateIdx] || "",
        type: (values[typeIdx] || "").toLowerCase(),
        amount: parseFloat(values[amountIdx]) || 0,
      })
    }
  }

  return data
}

export default function UploadTransactions() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previewData, setPreviewData] = useState<ExcelTransaction[]>([])
  const [fileName, setFileName] = useState("")

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        let jsonData: any[] = []

        if (file.name.endsWith(".csv")) {
          // Parse CSV
          const text = e.target?.result as string
          jsonData = parseCSV(text)
        } else {
          // Parse Excel
          const data = e.target?.result as ArrayBuffer
          const workbook = XLSX.read(data, { type: "array" })
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]
          jsonData = XLSX.utils.sheet_to_json(worksheet)
        }

        // Validate and transform data
        const transactions: ExcelTransaction[] = jsonData
          .map((row: any) => {
            const parsedDate = parseDate(row["Date"] || row["date"] || "")
            return {
              studentCode: String(
                row["Student Code"] || row["Code"] || row["StudentCode"] || row["studentCode"] || ""
              ).trim(),
              date: parsedDate || "",
              type: String(row["Type"] || row["type"] || "").toLowerCase().trim() as "deposit" | "withdrawal" | "withdraw",
              amount: parseFloat(row["Amount"] || row["amount"] || 0),
            }
          })
          .filter((t) => {
            // Validate each transaction
            if (!t.studentCode) {
              return false
            }
            if (!t.date) {
              toast.warning(`Row skipped (${t.studentCode}): Invalid or missing date`)
              return false
            }
            if (!["deposit", "withdrawal", "withdraw"].includes(t.type)) {
              toast.warning(
                `Row skipped (${t.studentCode}): Invalid type (must be 'deposit', 'withdrawal', or 'withdraw')`
              )
              return false
            }
            if (isNaN(t.amount) || t.amount <= 0) {
              toast.warning(`Row skipped (${t.studentCode}): Invalid amount`)
              return false
            }
            return true
          })

        if (transactions.length === 0) {
          toast.error("No valid transactions found in the file")
          setPreviewData([])
          setFileName("")
          return
        }

        setPreviewData(transactions)
        toast.success(`✓ Loaded ${transactions.length} transactions`)
      } catch (error) {
        console.error("Error reading file:", error)
        toast.error("Failed to read file")
        setFileName("")
        setPreviewData([])
      }
    }

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file)
    } else {
      reader.readAsArrayBuffer(file)
    }
  }

  const handleUpload = async () => {
    if (previewData.length === 0) {
      toast.error("No transactions to upload")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/students/bulk-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: previewData }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error(result.error || "Failed to upload transactions")
        return
      }

      toast.success(
        `✓ Successfully uploaded ${result.successCount} transactions. ${
          result.failureCount > 0 ? `${result.failureCount} failed.` : ""
        }`
      )
      setPreviewData([])
      setFileName("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading transactions:", error)
      toast.error("Error uploading transactions")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e8eef5] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pt-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#4a6670]" />
          </button>
          <h1 className="text-3xl font-bold text-[#171532]">Upload Transactions</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[#171532] mb-4">Import Excel or CSV File</h2>

            <div
              className="border-2 border-dashed border-[#d1d5db] rounded-xl p-8 text-center cursor-pointer hover:border-[#4a6670] hover:bg-[#f8f9fa] transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-[#747384] mx-auto mb-3" />
              <p className="text-[#171532] font-semibold mb-2">Click to select file</p>
              <p className="text-sm text-[#747384]">
                Supports .xlsx, .xls, .csv files with columns: Student Code, Date, Type, Amount
              </p>
              {fileName && (
                <p className="text-sm text-green-600 mt-3 font-medium">
                  Selected: {fileName}
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="mt-6 p-4 bg-[#f0f4ff] rounded-lg border border-[#d1d5db]">
              <h3 className="text-sm font-semibold text-[#171532] mb-2">File Format:</h3>
              <ul className="text-sm text-[#747384] space-y-1">
                <li>• <strong>Student Code:</strong> Student's unique code (required)</li>
                <li>• <strong>Date:</strong> Transaction date (formats: dd/MM/yyyy, MM/DD/YYYY, or YYYY-MM-DD) - (required)</li>
                <li>• <strong>Type:</strong> Either "deposit", "withdrawal", or "withdraw" (required)</li>
                <li>• <strong>Amount:</strong> Transaction amount as number (required)</li>
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[#171532] mb-3">Download Sample Files:</h3>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <p className="text-xs font-medium text-[#747384] mb-2">Mixed Deposits & Withdrawals:</p>
                  <div className="flex gap-2">
                    <a
                      href="/samples/sample_mixed_transactions.xlsx"
                      download
                      className="flex-1 text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                    >
                      📄 Excel
                    </a>
                    <a
                      href="/samples/sample_mixed_transactions.csv"
                      download
                      className="flex-1 text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                    >
                      📄 CSV
                    </a>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#747384] mb-2">Deposits Only:</p>
                  <div className="flex gap-2">
                    <a
                      href="/samples/sample_deposits.xlsx"
                      download
                      className="flex-1 text-sm text-green-600 hover:text-green-700 hover:underline font-medium"
                    >
                      📄 Excel
                    </a>
                    <a
                      href="/samples/sample_deposits.csv"
                      download
                      className="flex-1 text-sm text-green-600 hover:text-green-700 hover:underline font-medium"
                    >
                      📄 CSV
                    </a>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#747384] mb-2">Withdrawals Only:</p>
                  <div className="flex gap-2">
                    <a
                      href="/samples/sample_withdrawals.xlsx"
                      download
                      className="flex-1 text-sm text-red-600 hover:text-red-700 hover:underline font-medium"
                    >
                      📄 Excel
                    </a>
                    <a
                      href="/samples/sample_withdrawals.csv"
                      download
                      className="flex-1 text-sm text-red-600 hover:text-red-700 hover:underline font-medium"
                    >
                      📄 CSV
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {previewData.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={handleUpload}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#4a6670] hover:bg-[#3d565e] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload {previewData.length} Transactions
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[#171532] mb-4">Preview</h2>

            {previewData.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {previewData.map((transaction, idx) => (
                  <div key={idx} className="border border-[#e5e7eb] rounded-lg p-3">
                    <p className="text-xs font-medium text-[#747384] mb-1">
                      {transaction.studentCode}
                    </p>
                    <p className="text-sm text-[#171532] font-semibold">{transaction.date}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded capitalize ${
                          transaction.type === "deposit"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {transaction.type}
                      </span>
                      <span className="text-sm font-bold text-[#171532]">
                        ₹{transaction.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#747384]">No transactions loaded</p>
                <p className="text-xs text-[#747384] mt-2">
                  Select a file to see a preview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
