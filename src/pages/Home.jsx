import React, { useState, useEffect, useCallback } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import axios from "axios";

const backendBaseURL = "https://your-backend.up.railway.app"; // ✅ Change this to your actual Railway backend URL

const Home = () => {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
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
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        {user ? (
          <span style={{ marginRight: "10px", fontWeight: "bold" }}>
            Hi, {user.displayName}
          </span>
        ) : (
          <button
            onClick={handleLogin}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "5px",
            }}
          >
            Login with Google
          </button>
        )}
      </div>

      <h1>To-Do App</h1>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <input
          type="text"
          value={task}
          placeholder="Enter a task..."
          onChange={(e) => setTask(e.target.value)}
          style={{ width: "70%", padding: "10px", marginRight: "10px" }}
        />
        <button
          onClick={addTask}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          Add Task
        </button>
      </div>

      <ul style={{ marginTop: "20px", padding: 0, listStyle: "none" }}>
        {tasks.map((t) => (
          <li
            key={t._id || t.id}
            style={{
              padding: "5px 8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #ccc",
            }}
          >
            {t.task}
            <button
              onClick={() => deleteTask(t._id || t.id)}
              style={{
                marginLeft: "10px",
                padding: "5px 10px",
                backgroundColor: "red",
                color: "white",
                border: "none",
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
