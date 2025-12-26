import { connectDB } from "@/lib/mongodb"
import { Student } from "@/lib/models/Student"
import { NextResponse } from "next/server"

interface BulkTransaction {
  studentCode: string
  date: string
  type: "deposit" | "withdrawal"
  amount: number
}

export async function POST(req: Request) {
  try {
    await connectDB()

    const body = await req.json()
    const { transactions } = body as { transactions: BulkTransaction[] }

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { error: "No transactions provided" },
        { status: 400 }
      )
    }

    let successCount = 0
    let failureCount = 0
    const errors: string[] = []

    // Process each transaction
    for (const transaction of transactions) {
      try {
        // Validate transaction
        if (!transaction.studentCode || !transaction.date || !transaction.type || transaction.amount === undefined) {
          failureCount++
          errors.push(`Missing required fields for student: ${transaction.studentCode}`)
          continue
        }

        if (!["deposit", "withdrawal"].includes(transaction.type)) {
          failureCount++
          errors.push(`Invalid type for ${transaction.studentCode}: ${transaction.type}`)
          continue
        }

        if (isNaN(transaction.amount) || transaction.amount <= 0) {
          failureCount++
          errors.push(`Invalid amount for ${transaction.studentCode}: ${transaction.amount}`)
          continue
        }

        // Find student by code
        const student = await Student.findOne({ code: transaction.studentCode })
        if (!student) {
          failureCount++
          errors.push(`Student not found: ${transaction.studentCode}`)
          continue
        }

        // Add transaction
        student.transactions.push({
          date: transaction.date,
          type: transaction.type,
          amount: transaction.amount,
        })

        // Update balance
        const balanceChange = transaction.type === "deposit" ? transaction.amount : -transaction.amount
        student.balance += balanceChange

        student.markModified("transactions")
        await student.save()

        successCount++
      } catch (error) {
        failureCount++
        errors.push(`Error processing ${transaction.studentCode}: ${String(error)}`)
      }
    }

    return NextResponse.json({
      success: true,
      successCount,
      failureCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Error bulk uploading transactions:", error)
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    )
  }
}
