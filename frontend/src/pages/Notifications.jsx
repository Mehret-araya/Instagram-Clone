
import { useEffect, useState } from "react";
import api from "../services/api";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");

      console.log(
        "Notifications:",
        response.data
      );

      setNotifications(
        response.data.notifications || []
      );
    } catch (error) {
      console.error(
        "Notification error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.put(
        `/notifications/${notificationId}/read`
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error(
        "Mark notification error:",
        error.response?.data || error.message
      );
    }
  };

  if (loading) {
    return <h2>Loading notifications...</h2>;
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "30px auto",
        padding: "20px",
      }}
    >
      <h1>Notifications</h1>

      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification._id}
            onClick={() =>
              handleMarkAsRead(notification._id)
            }
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "10px",
              cursor: "pointer",
              backgroundColor:
                notification.isRead
                  ? "#fff"
                  : "#f0f8ff",
            }}
          >
            <strong>
              {notification.sender?.username ||
                "Someone"}
            </strong>

            <p>
              {notification.message}
            </p>

            <small>
              {new Date(
                notification.createdAt
              ).toLocaleString()}
            </small>

            {!notification.isRead && (
              <small
                style={{
                  display: "block",
                  marginTop: "5px",
                  fontWeight: "bold",
                }}
              >
                New
              </small>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;

