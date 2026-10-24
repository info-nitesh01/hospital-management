import { model, Schema, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    password: { type: String, select: false },
    name: { type: String, required: true },
    role: { type: String, required: true },
    activeClientId: { type: String, default: null },
  },
  { timestamps: true, collection: 'users' }
);

export type UserDocument = InferSchemaType<typeof userSchema>;
export const User = model('User', userSchema);