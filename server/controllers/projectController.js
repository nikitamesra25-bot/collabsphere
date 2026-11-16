import Project from "../models/Project.js";
import Note from "../models/Note.js";
import File from "../models/File.js";
import createSlug from "../utils/helpers.js";

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user._id,
    })
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description || "",
      owner: req.user._id,
      members: [req.user._id],
      isPublic: Boolean(isPublic),
      slug: createSlug(name),
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name email")
      .populate("members", "name email");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        message: "You are not a member of this project",
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only project owner can update this project",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Project name cannot be empty",
        });
      }

      project.name = name.trim();
    }

    if (description !== undefined) {
      project.description = description;
    }

    if (isPublic !== undefined) {
      project.isPublic = Boolean(isPublic);
    }

    await project.save();

    res.json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only project owner can delete this project",
      });
    }

    await Note.deleteMany({ project: project._id });
    await File.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    res.json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const getPublicProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      slug: req.params.slug,
      isPublic: true,
    }).populate("owner", "name");

    if (!project) {
      return res.status(404).json({
        message: "Public project not found",
      });
    }

    const notes = await Note.find({
      project: project._id,
    }).populate("createdBy", "name");

    const filesCount = await File.countDocuments({
      project: project._id,
    });

    res.json({
      project,
      notes,
      filesCount,
      notesCount: notes.length,
      contributorsCount: project.members.length,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};