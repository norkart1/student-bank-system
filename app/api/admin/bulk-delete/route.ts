import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Student } from "@/lib/models/Student";

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();
    await connectDB();

    if (type === "transactions") {
      // In this schema, transactions are embedded in students
      await Student.updateMany({}, { $set: { transactions: [], balance: 0 } });
      return NextResponse.json({ message: "All transactions deleted and balances reset" });
    }

    if (type === "students") {
      await Student.deleteMany({});
      return NextResponse.json({ message: "All students and transactions deleted" });
    }

    return NextResponse.json({ error: "Invalid deletion type" }, { status: 400 });
  } catch (error) {
    console.error("Bulk Delete Error:", error);
    return NextResponse.json({ error: "Failed to perform bulk deletion" }, { status: 500 });
  }
}
