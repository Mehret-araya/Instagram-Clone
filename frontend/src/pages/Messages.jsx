import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import socket from "../services/socket";
import { AuthContext } from "../context/AuthContext";

const Messages = () => {
  const { user } = useContext(AuthContext);
  const { userId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  // Get conversation
  const fetchMessages = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/messages/${userId}`
      );

      console.log(
        "Messages response:",
        response.data
      );

      setMessages(
        response.data.messages || []
      );

    } catch (error) {
      console.error(
        "Messages error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  
  
useEffect(() => {
  const token = localStorage.getItem("token");

  if (!user?._id || !token) {
    return;
  }

  socket.auth = { token };

  if (!socket.connected) {
    socket.connect();
  }

  const handleConnect = () => {
    socket.emit("join");
  };

  socket.on("connect", handleConnect);

  if (socket.connected) {
    handleConnect();
  }

  if (userId) {
    fetchMessages();
  }

const handleReceiveMessage = (message) => {
  console.log(
    "Real-time message received:",
    message
  );

  setMessages((prev) => [
    ...prev,
    message,
  ]);
};

socket.on(
  "receiveMessage",
  handleReceiveMessage
);


// User is typing
const handleUserTyping = (data) => {
  if (data.senderId === userId) {
    setTyping(true);
  }
};


// User stopped typing
const handleUserStoppedTyping = (data) => {
  if (data.senderId === userId) {
    setTyping(false);
  }
};


socket.on(
  "userTyping",
  handleUserTyping
);

socket.on(
  "userStoppedTyping",
  handleUserStoppedTyping
);


return () => {
  socket.off("connect", handleConnect);
  socket.off("receiveMessage", handleReceiveMessage);
  socket.off("userTyping", handleUserTyping);
  socket.off("userStoppedTyping", handleUserStoppedTyping);
};

}, [user, userId]);

  //handle send message 

const handleSend = async (e) => {
  e.preventDefault();

  if (!text.trim()) {
    return;
  }

  if (!user?._id) {
    console.error("User not found");
    return;
  }

  socket.emit("sendMessage", {
    sender: user._id,
    receiver: userId,
    text: text.trim(),
  });

  setText("");
};
      

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "30px auto",
        padding: "20px",
      }}
    >
      <h1>Messages</h1>

      {loading && (
        <p>Loading messages...</p>
      )}

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "15px",
          minHeight: "300px",
          marginBottom: "15px",
        }}
      >
        {typing && (
  <p>
    User is typing...
  </p>
)}
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              style={{
                padding: "10px",
                marginBottom: "8px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
              }}
            >
              <p>{message.text}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend}>
        <input
  type="text"
  placeholder="Type a message..."
  value={text}
  onChange={(e) => {
    const value = e.target.value;

    setText(value);

    if (user?._id) {
      if (value.trim()) {
        socket.emit("typing", {
          senderId: user._id,
          receiverId: userId,
        });
      } else {
        socket.emit("stopTyping", {
          senderId: user._id,
          receiverId: userId,
        });
      }
    }
  }}
  style={{
    width: "75%",
    padding: "12px",
    boxSizing: "border-box",
  }}
/>
        <button
          type="submit"
          style={{
            width: "25%",
            padding: "12px",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Messages;

