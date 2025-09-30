import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, required: true },
  phone: String,
  role: {
    type: String,
    enum: ["CLIENT", "REALTOR", "ADMIN"],
    default: "CLIENT",
  },
});

const User = mongoose.model("User", userSchema);

export default User;
