"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, Loader } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"

interface ExcelTransaction {
  studentCode: string
  date: string
  type: "deposit" | "withdrawal"
  amount: number
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
        const data = e.target?.result as ArrayBuffer
        const workbook = XLSX.read(data, { type: "array" })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // Validate and transform data
        const transactions: ExcelTransaction[] = jsonData
          .map((row: any) => ({
            studentCode: String(row["Student Code"] || row["Code"] || "").trim(),
            date: String(row["Date"] || "").trim(),
            type: String(row["Type"] || "").toLowerCase().trim() as "deposit" | "withdrawal",
            amount: parseFloat(row["Amount"] || 0),
          }))
          .filter((t) => {
            // Validate each transaction
            if (!t.studentCode) {
              toast.warning("Row skipped: Missing student code")
              return false
            }
            if (!t.date) {
              toast.warning(`Row skipped (${t.studentCode}): Missing date`)
              return false
            }
            if (!["deposit", "withdrawal"].includes(t.type)) {
              toast.warning(
                `Row skipped (${t.studentCode}): Invalid type (must be 'deposit' or 'withdrawal')`
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
        toast.error("Failed to read Excel file")
        setFileName("")
        setPreviewData([])
      }
    }

    reader.readAsArrayBuffer(file)
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
            <h2 className="text-xl font-semibold text-[#171532] mb-4">Import Excel File</h2>

            <div
              className="border-2 border-dashed border-[#d1d5db] rounded-xl p-8 text-center cursor-pointer hover:border-[#4a6670] hover:bg-[#f8f9fa] transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-[#747384] mx-auto mb-3" />
              <p className="text-[#171532] font-semibold mb-2">Click to select Excel file</p>
              <p className="text-sm text-[#747384]">
                Supports .xlsx, .xls files with columns: Student Code, Date, Type, Amount
              </p>
              {fileName && (
                <p className="text-sm text-green-600 mt-3 font-medium">
                  Selected: {fileName}
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="mt-6 p-4 bg-[#f0f4ff] rounded-lg border border-[#d1d5db]">
              <h3 className="text-sm font-semibold text-[#171532] mb-2">Excel File Format:</h3>
              <ul className="text-sm text-[#747384] space-y-1">
                <li>• <strong>Student Code:</strong> Student's unique code (required)</li>
                <li>• <strong>Date:</strong> Transaction date in dd/MM/yyyy format (required)</li>
                <li>• <strong>Type:</strong> Either "deposit" or "withdrawal" (required)</li>
                <li>• <strong>Amount:</strong> Transaction amount as number (required)</li>
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[#171532] mb-3">Download Sample Files:</h3>
              <div className="grid grid-cols-1 gap-2">
                <a
                  href="/samples/sample_mixed_transactions.xlsx"
                  download
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  📄 Sample - Mixed Deposits & Withdrawals
                </a>
                <a
                  href="/samples/sample_deposits.xlsx"
                  download
                  className="text-sm text-green-600 hover:text-green-700 hover:underline font-medium"
                >
                  📄 Sample - Deposits Only
                </a>
                <a
                  href="/samples/sample_withdrawals.xlsx"
                  download
                  className="text-sm text-red-600 hover:text-red-700 hover:underline font-medium"
                >
                  📄 Sample - Withdrawals Only
                </a>
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
                  Select an Excel file to see a preview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
