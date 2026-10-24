import { model, Schema, type InferSchemaType } from 'mongoose';

const themeSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    config: { type: Schema.Types.Mixed, required: true },
  },
  {
    collection: 'theme',
    timestamps: true,
    versionKey: false,
  }
);

export type ThemeDocument = InferSchemaType<typeof themeSchema>;
export const Theme = model('Theme', themeSchema);