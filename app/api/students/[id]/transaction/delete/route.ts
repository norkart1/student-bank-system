import { connectDB } from "@/lib/mongodb"
import { Student } from "@/lib/models/Student"
import { NextResponse } from "next/server"

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const body = await req.json()
    const { index } = body

    const student = await Student.findById(params.id)
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    if (index < 0 || index >= student.transactions.length) {
      return NextResponse.json({ error: "Invalid transaction index" }, { status: 400 })
    }

    const transaction = student.transactions[index]
    const amount = transaction.type === 'deposit' ? transaction.amount : -transaction.amount

    student.transactions.splice(index, 1)
    student.balance -= amount

    await student.save()

    return NextResponse.json({ success: true, student })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
