import User from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Feedback from "../models/feedback.js";

export const register = async (req, res) => {
    const { username, password, fullname, role } = req.body;

    if (!username || !password || !fullname) {
        return res.status(400).json({ msg: "Semua field harus diisi" });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ msg: "Username sudah digunakan" });
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ msg: "Password harus minimal 6 karakter, mengandung huruf dan angka" });
        }

        const user = await User.create({
            username,
            password,
            fullname,
            role: role !== undefined ? role : 0
        });

        return res.status(201).json({ status: "success", data: user });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Server error" });
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ msg: "Semua field harus diisi" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ msg: "Username tidak ditemukan" });
        }

        const isMatchPassword = await bcrypt.compare(password, user.password);
        if (!isMatchPassword) {
            return res.status(400).json({ msg: "Password salah" });
        }

        // Buat JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            msg: "Login berhasil",
            token,
            user: {
                id: user._id,
                fullname: user.fullname,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({ msg: "Server error", error });
    }
};

export const userLoggedin = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("_id username fullname role");

        if (!user) {
            return res.status(404).json({
                status: "error",
                msg: "User not found",
            });
        }

        res.status(200).json({
            status: "success",
            msg: "User data retrieved successfully",
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            msg: "Server error",
            error: error.message,
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("_id username fullname role");
        res.status(200).json({ status: "success", data: users });
    } catch (error) {
        res.status(500).json({ status: "error", msg: "Server error", error });
    }
}

export const getUsersById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("_id username fullname role");
        res.status(200).json({ status: "success", data: user });
    } catch (error) {
        res.status(500).json({ status: "error", msg: "Server error", error });
    }
}

export const editUser = async (req, res) => {
     try {
        // Validasi ID
        if (!req.params.id) {
            return res.status(400).json({ 
                status: "error", 
                msg: "User ID is required" 
            });
        }

        // Validasi input
        const { username, fullname } = req.body;
        if (!username || !fullname || username.trim() === '' || fullname.trim() === '') {
            return res.status(400).json({ 
                status: "error", 
                msg: "Username and fullname are required" 
            });
        }

        // Cek apakah user ada
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ 
                status: "error", 
                msg: "User not found" 
            });
        }

        // Cek apakah username sudah digunakan user lain
        const existingUser = await User.findOne({ 
            username: username.trim(), 
            _id: { $ne: req.params.id } 
        });
        if (existingUser) {
            return res.status(409).json({ 
                status: "error", 
                msg: "Username already exists" 
            });
        }

        // Update user
        user.username = username.trim();
        user.fullname = fullname.trim();
        user.updatedAt = new Date(); // Jika ada field updatedAt
        
        await user.save();

        // Return user tanpa password
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
        
        res.status(200).json({ 
            status: "success", 
            msg: "User updated successfully",
            data: userWithoutPassword 
        });
        
    } catch (error) {
        console.error('Error editing user:', error);
        
        // Handle MongoDB validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                status: "error", 
                msg: "Validation error", 
                details: error.message 
            });
        }
        
        // Handle MongoDB CastError (invalid ObjectId)
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                status: "error", 
                msg: "Invalid user ID format" 
            });
        }
        
        res.status(500).json({ 
            status: "error", 
            msg: "Internal server error" 
        });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        await user.deleteOne();
        res.status(200).json({ status: "success", msg: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: "error", msg: "Server error", error });
    }
}

export const submitFeedback = async (req, res) => {
    try {
        const userId = req.user._id; // dari middleware auth
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ status: "error", msg: "Message is required" });
        }

        const feedback = await Feedback.create({
            userId,
            message
        });

        res.status(201).json({
            status: "success",
            msg: "Feedback submitted",
            data: feedback
        });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Server error", error: err });
    }
};

export const getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find()
            .select("_id userId message createdAt")
            .populate({
                path: "userId",
                select: "fullname",
            });

        res.status(200).json({ status: "success", data: feedback });
    } catch (error) {
        res.status(500).json({ status: "error", msg: "Server error", error });
    }
}
