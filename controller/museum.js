import Museum from "../models/museum.js";
import fs from "fs";
import path from "path";
import cloudinary from "../utils/claudinary.js";
import { getDataUri } from "../utils/datauri.js";

const extractPublicId = (url) => {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0];
};

export const getAllMuseum = async (req, res) => {
    try {
        const museums = await Museum.find().select("_id category title subtitle images createdAt");
        res.status(200).json({ status: "success", data: museums });
    } catch (error) {
        res.status(500).json({ status: "error", msg: "Server error", error });
    }
};

export const addDataMuseum = async (req, res) => {
    const { category, title, subtitle } = req.body;
    const file = req.file;

    if (!category || !title || !subtitle || !file) {
        return res.status(400).json({ msg: "Semua field harus diisi" });
    }

    try {
        const file64 = getDataUri(file);
        // Upload file ke Cloudinary
        const result = await cloudinary.uploader.upload(file64.content, {
            folder: 'museum-images',
        });

        const imageUrl = result.secure_url; // ini yang nanti disimpan ke DB

        const museum = await Museum.create({
            category,
            title,
            subtitle,
            images: imageUrl, // menyimpan URL Cloudinary, bukan path lokal
        });

        res.status(201).json({ status: "success", data: museum });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", msg: "Server error", error });
    }
};

export const deleteDataMuseum = async (req, res) => {
    try {
        const museum = await Museum.findById(req.params.id);
        if (!museum) {
            return res.status(404).json({ msg: "Museum not found" });
        }

        if (museum.images) {
            try {
                const publicId = extractPublicId(museum.images);
                await cloudinary.uploader.destroy(`museum-images/${publicId}`);
                console.log("Gambar di Cloudinary berhasil dihapus");
            } catch (err) {
                console.error("Gagal hapus gambar dari Cloudinary:", err);
            }
        }

        await museum.deleteOne();
        res.status(200).json({ status: "success", msg: "Museum deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: "error", msg: "Server error", error });
    }
};



export const editDataMuseum = async (req, res) => {
    try {
        const museum = await Museum.findById(req.params.id);
        if (!museum) {
            return res.status(404).json({
                status: 'error',
                msg: 'Museum not found'
            });
        }

        const { category, title, subtitle } = req.body;

        // Update field text
        if (category) museum.category = category;
        if (title) museum.title = title;
        if (subtitle) museum.subtitle = subtitle;

        // Jika ada file baru diupload
        if (req.file) {
            // 1. Hapus gambar lama dari Cloudinary jika ada
            if (museum.images) {
                try {
                    const oldPublicId = extractPublicId(museum.images);
                    await cloudinary.uploader.destroy(oldPublicId);
                } catch (deleteError) {
                    console.log('Error deleting old image:', deleteError);
                    // Lanjutkan proses meski gagal hapus gambar lama
                }
            }

            // 2. Upload gambar baru ke Cloudinary
            const file64 = getDataUri(req.file);
            const uploadResult = await cloudinary.uploader.upload(file64.content, {
                folder: 'museum-images',
            });

            // 3. Simpan URL baru dari Cloudinary
            museum.images = uploadResult.secure_url;
        }

        await museum.save();

        res.status(200).json({
            status: 'success',
            msg: 'Museum updated successfully',
            data: museum
        });

    } catch (error) {
        console.error('Edit museum error:', error);
        res.status(500).json({
            status: 'error',
            msg: 'Server error',
            error: error.message
        });
    }
};

export const getDataByCategory = async (req, res) => {
    try {
        const category = req.params.category;

        const data = await Museum.find({ category });

        if (data.length === 0) {
            return res.status(404).json({ message: 'No museum data found for this category.' });
        }

        res.status(200).json({ data });
    } catch (error) {
        console.error('Error fetching museum by category:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}