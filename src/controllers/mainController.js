// controllers/mainController.js

export const getProtected = (req, res) => {
  res.json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};

export const healthCheck = (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
};

