import { connectDB } from '@/lib/mongodb';
import { Admin } from '@/lib/models/Admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Security: Only allow initialization from internal requests
    const authHeader = req.headers.get('authorization');
    const initSecret = process.env.ADMIN_INIT_SECRET || 'default-secret-change-me';
    
    if (authHeader !== `Bearer ${initSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { username, password, name, email } = await req.json();

    if (!username || !password || !name) {
      return NextResponse.json(
        { error: 'Username, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin with this username already exists' },
        { status: 409 }
      );
    }

    // Create new admin (password will be hashed by pre-save middleware)
    const admin = new Admin({
      username,
      password,
      name,
      email,
      role: 'admin',
    });

    await admin.save();

    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin initialization error:', error);
    return NextResponse.json({ error: 'Initialization failed' }, { status: 500 });
  }
}
