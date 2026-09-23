exports.getSummary = (req, res) => {
  res.json({ success: true, data: { activeShipments: 1, completed: 1, alerts: 2 } });
};
