
import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  "https://todo-project-d2wbci81h-jenil-81a4.vercel.app";

fetch(`${API_URL}/api/todos`);

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load saved tasks from MongoDB through Express
  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Could not load tasks");
        }

        const data = await response.json();
        setTasks(data);
      } catch  {
        setError("Cannot connect to backend. Check your server.");
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  // Add a task to MongoDB
  async function addTask(e) {
    e.preventDefault();

    const title = newTask.trim();
    if (!title) return;

    try {
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add task");
      }

      setTasks((previous) => [...previous, data]);
      setNewTask("");
      setShowInput(false);
    } catch (err) {
      setError(err.message);
    }
  }

  // Mark a task complete or incomplete
  async function toggleTask(task) {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${task._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      const updatedTask = await response.json();

      if (!response.ok) {
        throw new Error(updatedTask.message || "Could not update task");
      }

      setTasks((previous) =>
        previous.map((item) =>
          item._id === updatedTask._id ? updatedTask : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  }

  // Delete a task from MongoDB
  async function deleteTask(id) {
    try {
      setError("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete task");
      }

      setTasks((previous) =>
        previous.filter((task) => task._id !== id)
      );
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="page">
      <section className="todo-app">
        <header className="top-bar">
          <span className="menu-icon">☰</span>
          <h1>Todo List</h1>
          <span className="header-space"></span>
        </header>

        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}

        {loading ? (
          <p className="status-message">Loading tasks...</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li className="task" key={task._id}>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task)}
                  aria-label={`Complete ${task.title}`}
                />

                <span
                  className={
                    task.completed
                      ? "task-text completed"
                      : "task-text"
                  }
                >
                  {task.title}
                </span>

                <button
                  className="delete-button"
                  type="button"
                  onClick={() => deleteTask(task._id)}
                  aria-label={`Delete ${task.title}`}
                  title="Delete task"
                >
                  🗑
                </button>
              </li>
            ))}

            {tasks.length === 0 && (
              <li className="empty-message">
                No tasks yet. Add your first task!
              </li>
            )}
          </ul>
        )}

        {showInput && (
          <form className="new-task-form" onSubmit={addTask}>
            <input
              autoFocus
              type="text"
              maxLength={200}
              placeholder="Enter a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
            />

            <button type="submit" disabled={!newTask.trim()}>
              Add
            </button>

            <button
              type="button"
              onClick={() => {
                setShowInput(false);
                setNewTask("");
              }}
            >
              Cancel
            </button>
          </form>
        )}

        <button
          className="new-task-button"
          type="button"
          onClick={() => setShowInput(true)}
        >
          + New task
        </button>
      </section>
    </main>
  );
}

export default App;
