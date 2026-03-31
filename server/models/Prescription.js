import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    prescriptionNumber: {
      type: String,
      unique: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorName: {
      type: String,
      trim: true,
    },
    doctorPhone: String,
    doctorRegistrationNumber: String,
    hospitalName: String,
    prescriptionDate: {
      type: Date,
      required: true,
    },
    image: {
      type: String,
      required: [true, "Prescription image is required"],
    },
    medicines: [
      {
        name: String,
        dosage: String,
        frequency: String,
        duration: String,
        quantity: Number,
        instructions: String,
      },
    ],
    diagnosis: String,
    notes: String,
    status: {
      type: String,
      enum: ["pending", "verified", "rejected", "fulfilled", "expired"],
      default: "pending",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: Date,
    rejectionReason: String,
    validUntil: Date,
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Generate prescription number before saving
prescriptionSchema.pre("save", async function (next) {
  if (!this.prescriptionNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const count = await mongoose.model("Prescription").countDocuments();
    this.prescriptionNumber = `RX${year}${month}${(count + 1).toString().padStart(6, "0")}`;
  }
  next();
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);

export default Prescription;
