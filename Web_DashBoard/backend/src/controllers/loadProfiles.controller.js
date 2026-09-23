const LoadProfile = require('../models/LoadProfile');

exports.getProfiles = async (req, res) => {
  try {
    const profiles = await LoadProfile.find().sort({ createdAt: -1 });
    res.json({ success: true, data: profiles });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.getActiveProfile = async (req, res) => {
  try {
    const profile = await LoadProfile.findOne({ isActive: true });
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.createProfile = async (req, res) => {
  try {
    const profile = await LoadProfile.create(req.body);
    res.status(201).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profile = await LoadProfile.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    await LoadProfile.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Profile deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.setActiveProfile = async (req, res) => {
  try {
    await LoadProfile.updateMany({}, { isActive: false });
    const profile = await LoadProfile.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
