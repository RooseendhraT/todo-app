import React, { useState, useEffect, useCallback } from "react";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { auth, provider } from "../firebase";
import axios from "axios";

const backendBaseURL = "todo-app-production-5aaa.up.railway.app";


const Home = () => {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);

  // Persist login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  // Google login handler
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  // Logout handler
  const handleLogout = () => {
    signOut(auth);
  };

  // Fetch tasks
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

  // Add task handler
  const addTask = async () => {
    if (task.trim()) {
      try {
        if (user) {
          await axios.post(`${backendBaseURL}/api/tasks/add`, {
            userId: user.email,
            task,
          });
          fetchTasks();
        } else {
          setTasks([{ task, id: Date.now() }, ...tasks]);
        }
        setTask("");
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  // Delete task handler
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

  // Load tasks when user changes
  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [user, fetchTasks]);

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: "#f0f2f5", // Light theme
        color: "#1f2937", // Dark text for readability
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ margin: 0 }}>To-Do List</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Login / Logout */}
          {user ? (
            <span style={{ fontWeight: "bold" }}>{user.displayName}</span>
          ) : null}
          <div>
            {user ? (
              <button
                onClick={handleLogout}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={handleLogin}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#4f46e5",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Login with Google
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Add Task */}
      <div
        style={{
          display: "flex",
          flexDirection: "column", // Stack input and button vertically
          marginBottom: "20px",
          gap: "10px", // Space between input and button
        }}
      >
        <input
          type="text"
          value={task}
          placeholder="Add your next task..."
          onChange={(e) => setTask(e.target.value)}
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            outlineColor: "#4f46e5",
            height: "35px", // Reduced height for the text box
          }}
        />
        <button
          onClick={addTask}
          style={{
            padding: "12px 20px",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            height: "35px", // Same height as the input
          }}
        >
          Add
        </button>
      </div>

      {/* Task List */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {tasks.map((t) => (
          <li
            key={t._id || t.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px",
              marginBottom: "12px",
              backgroundColor: "#ffffff", // White background for tasks
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              border: "1px solid #e5e7eb",
              gap: "10px",
            }}
          >
            <span
              style={{
                flex: 1,
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
                fontSize: "16px",
              }}
            >
              {t.task}
            </span>
            <button
              onClick={() => deleteTask(t._id || t.id)}
              style={{
                padding: "6px 12px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
