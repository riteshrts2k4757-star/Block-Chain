const DeviceCommand = require('../models/DeviceCommand');

exports.queueCommand = async (req, res) => {
  try {
    const { deviceId, command, parameters } = req.body;
    const cmd = await DeviceCommand.create({
      commandId: Date.now().toString(),
      deviceId,
      command,
      parameters
    });
    res.json({ success: true, data: cmd });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.getPendingCommands = async (req, res) => {
  try {
    const commands = await DeviceCommand.find({ 
      deviceId: req.params.deviceId, 
      status: 'pending' 
    }).sort({ createdAt: 1 });
    
    // Mark them as sent
    for (let c of commands) {
      c.status = 'sent';
      c.sentAt = new Date();
      await c.save();
    }
    
    res.json({ success: true, data: commands });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.acknowledgeCommand = async (req, res) => {
  try {
    const { response, status } = req.body;
    const cmd = await DeviceCommand.findOne({ commandId: req.params.commandId });
    if (!cmd) return res.status(404).json({ success: false });

    cmd.status = status || 'acknowledged';
    cmd.response = response;
    cmd.acknowledgedAt = new Date();
    await cmd.save();

    res.json({ success: true, data: cmd });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.getCommandStatus = async (req, res) => {
  try {
    const cmd = await DeviceCommand.findOne({ commandId: req.params.commandId });
    res.json({ success: true, data: cmd });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
