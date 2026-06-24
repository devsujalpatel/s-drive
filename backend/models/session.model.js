import { model, Schema } from "mongoose";

const sessionSchema = Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now, expires: '7d' } // Auto-cleanup after 7 days
});

const Session = model("Session", sessionSchema);
export default Session;
