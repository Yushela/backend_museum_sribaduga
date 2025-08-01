import mongoose from "mongoose";
import moment from "moment-timezone";

const { Schema } = mongoose;

const museumSchema = new Schema({
    category: {
        type: String,
        required: false,
        default: "Lainnya"
    },    
    title: {
        type: String,
        required: false,
    },
    subtitle: {
        type: String,
        required: false,
    },
    images: {
        type: String,
        required: false,
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

museumSchema.pre("save", function (next) {
    this.updatedAt = moment.tz("Asia/Jakarta").toDate();
    next();
});

const Museum = mongoose.model("Museum", museumSchema);

export default Museum;
