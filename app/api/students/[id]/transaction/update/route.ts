import { connectDB } from "@/lib/mongodb"
import { Student } from "@/lib/models/Student"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()

    const { id } = await params
    const body = await req.json()
    const { txId, amount, reason } = body

    const student = await Student.findById(id)
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Find transaction by its unique database ID
    const txIndex = student.transactions.findIndex((t: any) => t._id.toString() === txId)
    if (txIndex === -1) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    const oldTransaction = student.transactions[txIndex]
    const oldAmount = oldTransaction.type === 'deposit' ? oldTransaction.amount : -oldTransaction.amount
    const newAmount = oldTransaction.type === 'deposit' ? amount : -amount
    const difference = newAmount - oldAmount

    // Update only the fields that changed, keeping date and type stable
    student.transactions[txIndex].amount = amount
    student.transactions[txIndex].reason = reason || student.transactions[txIndex].reason
    student.balance += difference
    
    student.markModified('transactions')

    await student.save()

    return NextResponse.json({ success: true, student })
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
