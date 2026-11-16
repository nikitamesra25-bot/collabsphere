import multer from "multer";
import path from "path";
import fs from "fs";
import File from "../models/File.js";
import Project from "../models/Project.js";

// Upload folder ka path
const uploadDirectory = path.resolve(process.cwd(), "../uploads");

// Agar uploads folder nahi hai, to create karna
fs.mkdirSync(uploadDirectory, { recursive: true });

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// File upload configuration
export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

// Get project files
export const getFiles = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const files = await File.find({
      project: projectId,
    })
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Upload a file
export const uploadFile = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Please select a file",
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      fs.unlinkSync(req.file.path);

      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!isMember) {
      fs.unlinkSync(req.file.path);

      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const uploadedFile = await File.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      project: projectId,
      uploadedBy: req.user._id,
    });

    res.status(201).json({
      message: "File uploaded successfully",
      file: uploadedFile,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete a file
export const deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    const project = await Project.findById(file.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    const isOwner =
      project.owner.toString() === req.user._id.toString();

    const isUploader =
      file.uploadedBy.toString() === req.user._id.toString();

    if (!isOwner && !isUploader) {
      return res.status(403).json({
        message: "You cannot delete this file",
      });
    }

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await File.findByIdAndDelete(file._id);

    res.json({
      message: "File deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};