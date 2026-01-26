import mongoose, { Schema, Document } from 'mongoose';

export interface IAcademicSession extends Document {
  year: string;
  isActive: boolean;
}

const AcademicSessionSchema = new Schema<IAcademicSession>(
  {
    year: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AcademicSession = mongoose.models.AcademicSession || mongoose.model<IAcademicSession>('AcademicSession', AcademicSessionSchema);
