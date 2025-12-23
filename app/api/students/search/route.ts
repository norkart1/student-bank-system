import { connectDB } from '@/lib/mongodb';
import { Student } from '@/lib/models/Student';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const name = searchParams.get('name');
    
    if (!code && !name) {
      return NextResponse.json({ error: 'Code or name required' }, { status: 400 });
    }
    
    let student;
    if (code) {
      student = await Student.findOne({ code: code.toUpperCase() });
    } else if (name) {
      student = await Student.findOne({ name: { $regex: name, $options: 'i' } });
    }
    
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
