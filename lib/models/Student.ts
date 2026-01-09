import mongoose, { Schema, Document } from 'mongoose';

interface Transaction {
  type: 'deposit' | 'withdraw';
  amount: number;
  date?: string;
  reason?: string;
}

export interface IStudent extends Document {
  name: string;
  code: string;
  email?: string;
  mobile?: string;
  profileImage?: string;
  academicYear: string;
  balance: number;
  transactions: Transaction[];
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema({
  type: { type: String, enum: ['deposit', 'withdraw'], required: true },
  amount: { type: Number, required: true },
  date: { type: String },
  reason: { type: String },
});

const studentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    email: { type: String },
    mobile: { type: String },
    profileImage: { type: String },
    academicYear: { type: String, required: true, default: '2024-25' },
    balance: { type: Number, default: 0 },
    transactions: [transactionSchema],
  },
  { timestamps: true }
);

export const Student = mongoose.models.Student || mongoose.model<IStudent>('Student', studentSchema);
