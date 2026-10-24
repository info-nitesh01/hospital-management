import { model, Schema, type InferSchemaType } from 'mongoose';

const clientSchema = new Schema(
  {
    clientId: { type: String, required: true, unique: true, index: true },
  },
  {
    collection: 'clients',
    strict: false,
    versionKey: false,
  }
);

export type ClientDocument = InferSchemaType<typeof clientSchema>;
export const Client = model('Client', clientSchema);