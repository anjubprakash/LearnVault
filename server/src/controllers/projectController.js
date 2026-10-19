import { Project } from '../models/Project.js';
import { Topic } from '../models/Topic.js';
import { Activity } from '../models/Activity.js';

export const getProjects = async (req, res) => {
  try {
    const { topic, status, search } = req.query;
    const filter = {};

    if (topic) filter.topic = topic;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { technology: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const projects = await Project.find(filter)
      .populate('topic', 'title slug category')
      .populate('relatedDocuments', 'title originalFilename fileType fileSize')
      .populate('relatedVideos', 'title duration thumbnailUrl youtubeId channelName')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('getProjects error:', error);
    res.status(500).json({ message: 'Error retrieving projects' });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id)
      .populate('topic', 'title slug category')
      .populate('relatedDocuments', 'title originalFilename fileType fileSize')
      .populate('relatedVideos', 'title duration thumbnailUrl youtubeId channelName');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving project' });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, technology, description, status, githubUrl, demoUrl, topic, relatedDocuments, relatedVideos } = req.body;

    if (!title || !technology || !topic) {
      return res.status(400).json({ message: 'Title, technology, and topic are required' });
    }

    const topicObj = await Topic.findById(topic);
    if (!topicObj) {
      return res.status(400).json({ message: 'Selected topic does not exist' });
    }

    const project = new Project({
      title: title.trim(),
      technology: technology.trim(),
      description: description?.trim() || '',
      status: status || 'Completed',
      githubUrl: githubUrl?.trim() || '',
      demoUrl: demoUrl?.trim() || '',
      topic: topicObj._id,
      relatedDocuments: relatedDocuments || [],
      relatedVideos: relatedVideos || [],
      createdBy: req.user?._id,
    });

    await project.save();

    if (req.user) {
      await Activity.create({
        user: req.user._id,
        actionType: 'add_project',
        entityId: project._id.toString(),
        entityType: 'project',
        entityTitle: project.title,
        topic: topicObj._id,
        topicTitle: topicObj.title,
      });
    }

    const populated = await Project.findById(project._id)
      .populate('topic', 'title slug category')
      .populate('relatedDocuments', 'title originalFilename fileType')
      .populate('relatedVideos', 'title duration thumbnailUrl');

    res.status(201).json(populated);
  } catch (error) {
    console.error('createProject error:', error);
    res.status(500).json({ message: error.message || 'Error creating project' });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, technology, description, status, githubUrl, demoUrl, topic, relatedDocuments, relatedVideos } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (title) project.title = title.trim();
    if (technology) project.technology = technology.trim();
    if (description !== undefined) project.description = description.trim();
    if (status) project.status = status;
    if (githubUrl !== undefined) project.githubUrl = githubUrl.trim();
    if (demoUrl !== undefined) project.demoUrl = demoUrl.trim();
    if (topic) {
      const topicObj = await Topic.findById(topic);
      if (topicObj) project.topic = topicObj._id;
    }
    if (relatedDocuments !== undefined) project.relatedDocuments = relatedDocuments;
    if (relatedVideos !== undefined) project.relatedVideos = relatedVideos;

    await project.save();

    const populated = await Project.findById(project._id)
      .populate('topic', 'title slug category')
      .populate('relatedDocuments', 'title originalFilename fileType')
      .populate('relatedVideos', 'title duration thumbnailUrl');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project' });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await Project.findByIdAndDelete(id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project' });
  }
};
