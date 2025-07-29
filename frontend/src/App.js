import { useEffect, useState } from 'react';
import TaskForm from './components/TaskForm';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);

  const getAllTasks = async () => {
    await fetch('http://localhost:8080/api/tasks/getAllTasks')
      .then((response) => response.json())
      .then((task) => {
        setTasks(task);
      });
  };
  console.log(tasks);

  const deleteTask = async (id) => {
    await fetch(`http://localhost:8080/api/tasks/deleteTask/${id}`, {
      method: 'DELETE',
    });
    setTasks(tasks.filter((task) => task._id !== id));
  };

  useEffect(() => {
    getAllTasks();
  }, []);

  return (
    <div className="app-container">
      <TaskForm/>
      <h1>Tasks</h1>
      <div className="tasks-list">
        {tasks.map((task) => (
          <div className="task-item" key={task._id}>
            {task.title}
            <button className="delete-btn" onClick={() => deleteTask(task._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;