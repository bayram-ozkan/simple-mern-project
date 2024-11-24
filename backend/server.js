const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Express ve Mongoose kurulumları
const app = express();
app.use(express.json());
app.use(cors());  // Frontend ile iletişim kurabilmek için

// MongoDB bağlantısı
mongoose.connect('mongodb://localhost/todolist', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected')) 
  .catch(err => console.log(err));

// List Schema ve Modeli
const listSchema = new mongoose.Schema({
  name: String,
  tasks: [{ title: String, completed: Boolean }],
});

const List = mongoose.model('List', listSchema);

// Ana Sayfa Root Endpoint (GET /)
app.get('/', (req, res) => {
  res.send('Welcome to the To-Do List API! (backend)' );
});

// Tüm Listeleri Getir (GET /lists)
app.get('/lists', async (req, res) => {
  try {
    const lists = await List.find();
    res.json(lists); // Listeleri döndür
  } catch (error) {
    res.status(500).send('Error fetching lists');
  }
});

// Yeni Liste Oluştur (POST /lists)
app.post('/lists', async (req, res) => {
  const { name } = req.body;
  const newList = new List({ name, tasks: [] });

  try {
    const savedList = await newList.save();
    res.status(201).json(savedList); // Yeni listeyi döndür
  } catch (error) {
    res.status(400).send('Error creating list');
  }
});

// Listeyi Sil (DELETE /lists/:id)
app.delete('/lists/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await List.findByIdAndDelete(id);
    res.status(200).send('List deleted');
  } catch (error) {
    res.status(500).send('Error deleting list');
  }
});

// Listeye Görev Ekle (POST /lists/:id/tasks)
app.post('/lists/:id/tasks', async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  try {
    const list = await List.findById(id);
    const newTask = { title, completed };
    list.tasks.push(newTask);
    await list.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).send('Error adding task');
  }
});

// Görev Tamamlanma Durumunu Güncelle (PUT /tasks/:id)
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    const list = await List.findOne({ 'tasks._id': id });
    const task = list.tasks.id(id);
    task.completed = completed;
    await list.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).send('Error updating task');
  }
});

// Sunucuyu başlat
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
