import React, { useState } from 'react'

function TaskForm() {
    const [inputValue, setInputValue] = useState('');
    const addNewTask = async () => {
        await fetch('http://localhost:8080/api/tasks/createTask', {
            method: 'POST',
            headers: {
                Accept: 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: inputValue,
            }),
        })
            .then((res) => res.json())
            .then((res) => console.log(res));

        window.location.reload();
    };



    return (
        <div className="task-form">
            <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                type='text'
            />
            <button onClick={addNewTask}>Add task</button>
        </div>
    )
}

export default TaskForm