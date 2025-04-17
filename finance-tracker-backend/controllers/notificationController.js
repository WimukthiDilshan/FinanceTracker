const { getUserNotifications, clearNotifications } = require("../services/notificationService");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user.id);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications", error: error.message });
  }
};

exports.clearUserNotifications = async (req, res) => {
  try {
    const result = await clearNotifications(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error clearing notifications:", error);
    res.status(500).json({ message: "Error clearing notifications", error: error.message });
  }
}; 