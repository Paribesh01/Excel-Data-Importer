import mongoose, { Schema } from "mongoose";

const RecordSchema = new Schema({
  sheetName: { type: String, required: true },
  rows: [
    {
      name: { type: String, required: true },
      amount: { type: Number, required: true },
      date: { type: Date, required: true },
      verified: { type: Boolean, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Record = mongoose.model("Record", RecordSchema);
export default Record;
