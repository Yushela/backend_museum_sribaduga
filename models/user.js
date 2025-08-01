import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import moment from "moment-timezone";

const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: false,
    },
    fullname: {
        type: String,
        required: false,
        default: null
    },
    role: {
        type: Number,
        required: false,
        default: 0,
        enum: [0, 1]
    },
    createdAt: {
        type: Date,
        default: () => moment.tz("Asia/Jakarta").toDate()
    },
    updatedAt: {
        type: Date,
        default: () => moment.tz("Asia/Jakarta").toDate()
    }
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.pre("save", function (next) {
    this.updatedAt = moment.tz("Asia/Jakarta").toDate();
    next();
});

const User = mongoose.model("User", userSchema);

export default User;
