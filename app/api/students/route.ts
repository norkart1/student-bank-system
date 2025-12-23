import { connectDB } from '@/lib/mongodb';
import { Student } from '@/lib/models/Student';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectDB();
    const students = await Student.find({});
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data = await req.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!data.username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }
    if (!data.password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }
    
    // Check if username already exists
    const existingStudent = await Student.findOne({ username: data.username });
    if (existingStudent) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }
    
    const student = new Student({
      name: data.name,
      code: data.code || '',
      username: data.username,
      password: data.password,
      email: data.email || '',
      mobile: data.mobile || '',
      profileImage: data.profileImage || '',
      balance: data.balance || 0,
      transactions: data.transactions || [],
    });
    
    const savedStudent = await student.save();
    return NextResponse.json(savedStudent, { status: 201 });
  } catch (error: any) {
    console.error('Student creation error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json({ error: `${field} already exists` }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create student', 
      details: String(error.message || error) 
    }, { status: 500 });
  }
}
