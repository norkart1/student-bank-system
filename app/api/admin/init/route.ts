import { connectDB } from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await connectDB();

    const existingAdmin = await Admin.findOne({ username: 'admin' });

    if (existingAdmin) {
      return NextResponse.json({ message: 'Admin already exists' }, { status: 200 });
    }

    const admin = new Admin({
      username: 'admin',
      password: '12345',
      name: 'Administrator',
      email: 'admin@jdsabank.com',
      role: 'admin',
    });

    await admin.save();

    return NextResponse.json({
      success: true,
      message: 'Admin account created',
      admin: {
        username: admin.username,
        name: admin.name,
      },
    });
  } catch (error) {
    console.error('Admin init error:', error);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}
