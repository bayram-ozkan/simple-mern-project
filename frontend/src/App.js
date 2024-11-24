import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [selectedListId, setSelectedListId] = useState(null);
  const [newTask, setNewTask] = useState('');

  // Tüm listeleri yükle
  useEffect(() => {
    axios.get('http://localhost:5000/lists')
      .then(response => setLists(response.data))
      .catch(error => console.error(error));
  }, []);

  // Yeni liste oluştur
  const addList = () => {
    if (newListName) {
      axios.post('http://localhost:5000/lists', { name: newListName })
        .then(response => {
          setLists([...lists, response.data]);
          setNewListName('');
        })
        .catch(error => console.error(error));
    }
  };

  // Listeyi sil
  const deleteList = (listId) => {
    axios.delete(`http://localhost:5000/lists/${listId}`)
      .then(() => {
        setLists(lists.filter(list => list._id !== listId));
        setSelectedListId(null);  // Seçili listeyi temizle
      })
      .catch(error => console.error(error));
  };

  // Yeni görev ekle
  const addTask = () => {
    if (newTask && selectedListId) {
      const task = { title: newTask, completed: false };
      axios.post(`http://localhost:5000/lists/${selectedListId}/tasks`, task)
        .then(response => {
          const updatedLists = lists.map(list => {
            if (list._id === selectedListId) {
              return { ...list, tasks: [...list.tasks, response.data] };
            }
            return list;
          });
          setLists(updatedLists);
          setNewTask('');
        })
        .catch(error => console.error(error));
    }
  };

  // Görev tamamlanma durumunu güncelle
  const toggleTaskCompletion = (taskId, completed) => {
    axios.put(`http://localhost:5000/tasks/${taskId}`, { completed: !completed })
      .then(response => {
        const updatedLists = lists.map(list => {
          return {
            ...list,
            tasks: list.tasks.map(task =>
              task._id === taskId ? { ...task, completed: !completed } : task
            ),
          };
        });
        setLists(updatedLists);
      })
      .catch(error => console.error(error));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>To-Do Lists</h1>

      {/* Yeni Liste Ekleme */}
      <input
        type="text"
        value={newListName}
        onChange={(e) => setNewListName(e.target.value)}
        placeholder="New List Name"
      />
      <button onClick={addList}>Create List</button>

      {/* Mevcut Listeler */}
      <div>
        {lists.map(list => (
          <div key={list._id}>
            <h3>
              <span
                style={{ cursor: 'pointer', fontWeight: selectedListId === list._id ? 'bold' : 'normal' }}
                onClick={() => setSelectedListId(list._id)}
              >
                {list.name}
              </span>
              <button onClick={() => deleteList(list._id)}>Delete</button>
            </h3>

            {/* Listeye ait Görevler */}
            {selectedListId === list._id && (
              <div>
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a new task"
                />
                <button onClick={addTask}>Add Task</button>
                <ul>
                  {list.tasks.map(task => (
                    <li key={task._id} style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task._id, task.completed)}
                      />
                      <span style={{ marginLeft: '10px', textDecoration: task.completed ? 'line-through' : 'none' }}>
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
