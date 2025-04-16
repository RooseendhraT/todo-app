import React, { useState, useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import axios from "axios";

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

  const addTask = async () => {
    if (task.trim()) {
      try {
        // If the user is logged in, add the task to the database
        if (user) {
          await axios.post("http://localhost:5000/api/tasks/add", {
            userId: user.email,
            task,
          });
          // Fetch the updated tasks after adding the new task
          fetchTasks();
        } else {
          // If the user is not logged in, add the task statically to the state
          setTasks([{ task, id: Date.now() }, ...tasks]);
        }
        setTask(""); // Clear the input field after adding the task
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  const deleteTask = async (taskId) => {
    try {
      if (user) {
        // Delete the task from the database if the user is logged in
        await axios.delete(`http://localhost:5000/api/tasks/${user.email}/${taskId}`);
        // Fetch the updated tasks after deletion
        fetchTasks();
      } else {
        // If not logged in, filter the task locally
        setTasks(tasks.filter((task) => task.id !== taskId));
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const fetchTasks = async () => {
    if (user) {
      try {
        const response = await axios.get(`http://localhost:5000/api/tasks/${user.email}`);
        const sortedTasks = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTasks(sortedTasks); // Set sorted tasks in state
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks(); // Fetch tasks for the logged-in user
    } else {
      // If no user is logged in, leave the tasks empty or handle it statically
      setTasks([]);
    }
  }, [user]); // Runs whenever user changes (login/logout)

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
          <li key={t._id || t.id} style={{ padding: "5px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ccc" }}>
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
