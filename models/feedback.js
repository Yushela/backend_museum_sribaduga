import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import moment from "moment-timezone";

const { Schema } = mongoose;

const feedbackSchema = new Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // relasi ke User
      required: true
    },
    message: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: () => moment.tz("Asia/Jakarta").toDate()
    }
  });
  

  feedbackSchema.pre("save", function (next) {
    this.updatedAt = moment.tz("Asia/Jakarta").toDate();
    next();
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
