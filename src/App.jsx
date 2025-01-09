import React, { useState } from "react";

const App = () => {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);

  const addTask = () => {
    if (task.trim()) {
      setTasks([...tasks, task]); // Add task to the tasks array
      setTask(""); // Clear the input field
    }
  };

  const deleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index)); // Remove task by index
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h1>To-Do App</h1>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <input
          type="text"
          value={task}
          placeholder="Enter a task..."
          onChange={(e) => setTask(e.target.value)}
          style={{ width: "70%", padding: "10px", marginRight: "10px" }}
        />
        <button onClick={addTask} style={{ padding: "10px 20px" }}>
          Add Task
        </button>
      </div>

      <ul style={{ marginTop: "20px", padding: 0, listStyle: "none" }}>
        {tasks.map((t, index) => (
          <li key={index} style={{ padding: "5px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {t}
            <button
              onClick={() => deleteTask(index)}
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

export default App;
