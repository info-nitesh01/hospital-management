import { model, Schema, type InferSchemaType } from 'mongoose';

const dashboardSchema = new Schema(
  {
    dashboardId: { type: String, required: true, unique: true, index: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  {
    collection: 'dashboard',
    versionKey: false,
  }
);

export type DashboardDocument = InferSchemaType<typeof dashboardSchema>;
export const Dashboard = model('Dashboard', dashboardSchema);