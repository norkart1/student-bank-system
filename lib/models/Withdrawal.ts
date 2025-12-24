import mongoose, { Schema, Document } from 'mongoose';

export interface IWithdrawal extends Document {
  studentId: string;
  studentName: string;
  studentCode: string;
  amount: number;
  date: string;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalSchema = new Schema<IWithdrawal>(
  {
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    studentCode: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    reason: { type: String },
  },
  { timestamps: true }
);

export const Withdrawal = mongoose.models.Withdrawal || mongoose.model<IWithdrawal>('Withdrawal', withdrawalSchema);
