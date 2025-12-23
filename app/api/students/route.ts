import { connectDB } from '@/lib/mongodb';
import { Student } from '@/lib/models/Student';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: any) {
  try {
    await connectDB();
    const students = await Student.find({});
    const response = NextResponse.json(students);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const data = await req.json();
    
    if (!data.name || !data.code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }
    
    const student = new Student({
      name: data.name,
      code: data.code,
      email: data.email || '',
      mobile: data.mobile || '',
      profileImage: data.profileImage || '',
      balance: 0,
      transactions: [],
    });
    
    await student.save();
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Student creation error:', error);
    return NextResponse.json({ error: 'Failed to create student', details: String(error) }, { status: 500 });
  }
}
