const SystemSettings = require('../models/SystemSettings');

exports.getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { tempMin, tempMax, humidityMin, humidityMax } = req.body;
    let settings = await SystemSettings.findOne();
    
    if (!settings) {
      settings = await SystemSettings.create({ tempMin, tempMax, humidityMin, humidityMax });
    } else {
      settings.tempMin = tempMin ?? settings.tempMin;
      settings.tempMax = tempMax ?? settings.tempMax;
      settings.humidityMin = humidityMin ?? settings.humidityMin;
      settings.humidityMax = humidityMax ?? settings.humidityMax;
      await settings.save();
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
};
