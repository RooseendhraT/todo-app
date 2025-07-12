import React, { useState, useEffect, useCallback } from "react";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, provider } from "../firebase";
import axios from "axios";

const backendBaseURL = "https://todo-app-production-5aaa.up.railway.app";

// 🧩 Helper functions
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = ((hour + 11) % 12 + 1);
  return `${hour12}:${m} ${suffix}`;
};

const Home = () => {
  const [task, setTask] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const fetchTasks = useCallback(async () => {
    if (user) {
      try {
        const response = await axios.get(`${backendBaseURL}/api/tasks/${user.email}`);
        const sortedTasks = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTasks(sortedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }
  }, [user]);

  const addTask = async () => {
    if (task.trim()) {
      try {
        const taskData = {
          userId: user?.email || "guest",
          task,
          dueDate,
          dueTime,
        };

        if (user) {
          await axios.post(`${backendBaseURL}/api/tasks/add`, taskData);
          fetchTasks();
        } else {
          setTasks([{ ...taskData, id: Date.now() }, ...tasks]);
        }

        setTask("");
        setDueDate("");
        setDueTime("");
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  const deleteTask = async (taskId) => {
    try {
      if (user) {
        await axios.delete(`${backendBaseURL}/api/tasks/${user.email}/${taskId}`);
        fetchTasks();
      } else {
        setTasks(tasks.filter((task) => task.id !== taskId));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [user, fetchTasks]);

  return (
    <div style={{
      padding: "20px",
      maxWidth: "900px",
      margin: "0 auto",
      backgroundColor: "#f0f2f5",
      color: "#1f2937",
      fontFamily: "Segoe UI, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
      }}>
        <h1 style={{ margin: 0 }}>To-Do List</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {user && <span style={{ fontWeight: "bold" }}>{user.displayName}</span>}
          <div>
            {user ? (
              <button onClick={handleLogout} style={buttonStyle("#ef4444")}>Sign Out</button>
            ) : (
              <button onClick={handleLogin} style={buttonStyle("#4f46e5")}>Login with Google</button>
            )}
          </div>
        </div>
      </div>

      {/* Add Task */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        marginBottom: "20px",
        gap: "10px",
      }}>
        <input
          type="text"
          value={task}
          placeholder="Add your next task..."
          onChange={(e) => setTask(e.target.value)}
          style={inputStyle}
        />
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={inputStyle}
          />
          <input
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            style={inputStyle}
          />
        </div>
        <button onClick={addTask} style={buttonStyle("#4f46e5")}>Add</button>
      </div>

      {/* Task List */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((t) => (
          <li key={t._id || t.id} style={taskItemStyle}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "16px", fontWeight: "500" }}>{t.task}</div>
              {(t.dueDate || t.dueTime) && (
                <div style={{
                  marginTop: "4px",
                  padding: "4px 8px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  fontSize: "13px",
                  color: "#374151",
                  display: "inline-block",
                }}>
                  {t.dueDate && <span>📅 Date: {formatDate(t.dueDate)}</span>}
                  {t.dueTime && <span> | 🕒 Time: {formatTime(t.dueTime)}</span>}
                </div>
              )}
            </div>
            <button onClick={() => deleteTask(t._id || t.id)} style={buttonStyle("#ef4444")}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;

// 🔧 Reusable styles
const inputStyle = {
  padding: "8px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  outlineColor: "#4f46e5",
  height: "35px",
  flex: 1,
};

const buttonStyle = (bgColor) => ({
  padding: "12px 20px",
  backgroundColor: bgColor,
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  height: "35px",
});

const taskItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px",
  marginBottom: "12px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  border: "1px solid #e5e7eb",
  gap: "10px",
};
