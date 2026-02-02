import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  token: string;
  userId: string;
  userType: 'admin' | 'user';
  userData: {
    id: string;
    name: string;
    username?: string;
    code?: string;
  };
  expiresAt: Date;
  loginAt: Date;
  logoutAt?: Date;
  lastActiveAt: Date;
  createdAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    token: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userType: { type: String, enum: ['admin', 'user', 'teacher'], required: true },
    userData: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      username: { type: String },
      code: { type: String },
    },
    expiresAt: { type: Date, required: true },
    loginAt: { type: Date, default: Date.now },
    logoutAt: { type: Date },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Auto-delete expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.models.Session || mongoose.model<ISession>('Session', sessionSchema);
