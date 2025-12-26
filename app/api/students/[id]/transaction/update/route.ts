import { connectDB } from "@/lib/db"
import Student from "@/lib/models/Student"
import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const body = await req.json()
    const { index, date, type, amount } = body

    const student = await Student.findById(params.id)
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    if (index < 0 || index >= student.transactions.length) {
      return NextResponse.json({ error: "Invalid transaction index" }, { status: 400 })
    }

    // Calculate the amount difference
    const oldTransaction = student.transactions[index]
    const oldAmount = oldTransaction.type === 'deposit' ? oldTransaction.amount : -oldTransaction.amount
    const newAmount = type === 'deposit' ? amount : -amount
    const difference = newAmount - oldAmount

    // Update transaction
    student.transactions[index] = { date, type, amount }

    // Update balance
    student.balance += difference

    await student.save()

    return NextResponse.json({ success: true, student })
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
