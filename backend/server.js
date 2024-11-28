// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// // Express ve Mongoose kurulumları
// const app = express();
// app.use(express.json());
// app.use(cors());  // Frontend ile iletişim kurabilmek için
// require('dotenv').config();
// //  Rkh60h9mUYo9NWEx password.


// // // MongoDB  local bağlantısı
// // mongoose.connect('mongodb://localhost/todolist', { useNewUrlParser: true, useUnifiedTopology: true })
// //   .then(() => console.log('MongoDB connected')) 
// //   .catch(err => console.log(err));


// // MongoDB container
// mongoose
//   .connect(
//     process.env.MONGO_URL )
//   .then(() => console.log("connected DataBase"))
//   .then(() => {
//     app.listen(5000);
//   })
//   .catch((err) => console.log(err));


// // List Schema ve Modeli
// const listSchema = new mongoose.Schema({
//   name: String,
//   tasks: [{ title: String, completed: Boolean }],
// });

// const List = mongoose.model('List', listSchema);

// // Ana Sayfa Root Endpoint (GET /)
// app.get('/', (req, res) => {
//   res.send('Welcome to the To-Do List API! (backend)' );
// });

// // Tüm Listeleri Getir (GET /lists)
// app.get('/lists', async (req, res) => {
//   try {
//     const lists = await List.find();
//     res.json(lists); // Listeleri döndür
//   } catch (error) {
//     res.status(500).send('Error fetching lists');
//   }
// });

// // Yeni Liste Oluştur (POST /lists)
// app.post('/lists', async (req, res) => {
//   const { name } = req.body;
//   const newList = new List({ name, tasks: [] });

//   try {
//     const savedList = await newList.save();
//     res.status(201).json(savedList); // Yeni listeyi döndür
//   } catch (error) {
//     res.status(400).send('Error creating list');
//   }
// });

// // Listeyi Sil (DELETE /lists/:id)
// app.delete('/lists/:id', async (req, res) => {
//   const { id } = req.params;

//   try {
//     await List.findByIdAndDelete(id);
//     res.status(200).send('List deleted');
//   } catch (error) {
//     res.status(500).send('Error deleting list');
//   }
// });

// // Listeye Görev Ekle (POST /lists/:id/tasks)
// app.post('/lists/:id/tasks', async (req, res) => {
//   const { id } = req.params;
//   const { title, completed } = req.body;

//   try {
//     const list = await List.findById(id);
//     const newTask = { title, completed };
//     list.tasks.push(newTask);
//     await list.save();
//     res.status(201).json(newTask);
//   } catch (error) {
//     res.status(400).send('Error adding task');
//   }
// });

// // Görev Tamamlanma Durumunu Güncelle (PUT /tasks/:id)
// app.put('/tasks/:id', async (req, res) => {
//   const { id } = req.params;
//   const { completed } = req.body;

//   try {
//     const list = await List.findOne({ 'tasks._id': id });
//     const task = list.tasks.id(id);
//     task.completed = completed;
//     await list.save();
//     res.status(200).json(task);
//   } catch (error) {
//     res.status(500).send('Error updating task');
//   }
// });

// // Sunucuyu başlat
// const PORT = 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });





const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Express uygulaması oluşturuluyor
const app = express();

// JSON body'lerini işleyebilmek için middleware
app.use(express.json());

// CORS ayarlarını yapıyoruz. Frontend'in hangi portta çalıştığını belirtmelisiniz.
const corsOptions = {
  origin: 'http://localhost:3000', // Eğer frontend'iniz farklı bir portta çalışıyorsa, bunu değiştirebilirsiniz.
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));

// MongoDB bağlantısı
mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB'ye başarıyla bağlanıldı"))
  .catch((err) => {
    console.error("MongoDB bağlantı hatası:", err.message);
    process.exit(1); // Bağlantı hatası olursa uygulamayı durduruyoruz.
  });

// Liste şeması ve modeli
const listSchema = new mongoose.Schema({
  name: String,
  tasks: [{ title: String, completed: Boolean }],
});

const List = mongoose.model('List', listSchema);

// Ana Sayfa Root Endpoint (GET /)
app.get('/', (req, res) => {
  res.send('Welcome to the To-Do List API!');
});

// Tüm Listeleri Getir (GET /lists)
app.get('/lists', async (req, res) => {
  try {
    const lists = await List.find();
    res.json(lists); // Listeleri döndür
  } catch (error) {
    res.status(500).send('Listeler alınırken bir hata oluştu');
  }
});

// Yeni Liste Oluştur (POST /lists)
app.post('/lists', async (req, res) => {
  const { name } = req.body;
  
  // Liste adı boş olursa, hata döndürülür
  if (!name) {
    return res.status(400).send('Liste adı zorunludur');
  }

  const newList = new List({ name, tasks: [] });

  try {
    const savedList = await newList.save();
    res.status(201).json(savedList); // Yeni listeyi döndür
  } catch (error) {
    res.status(400).send('Liste oluşturulurken bir hata oluştu');
  }
});

// Listeyi Sil (DELETE /lists/:id)
app.delete('/lists/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedList = await List.findByIdAndDelete(id);
    if (!deletedList) {
      return res.status(404).send('Liste bulunamadı');
    }
    res.status(200).send('Liste silindi');
  } catch (error) {
    res.status(500).send('Liste silinirken bir hata oluştu');
  }
});

// Listeye Görev Ekle (POST /lists/:id/tasks)
app.post('/lists/:id/tasks', async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  if (!title) {
    return res.status(400).send('Görev adı zorunludur');
  }

  try {
    const list = await List.findById(id);
    if (!list) {
      return res.status(404).send('Liste bulunamadı');
    }
    
    const newTask = { title, completed };
    list.tasks.push(newTask);
    await list.save();
    
    res.status(201).json(newTask); // Yeni görev oluşturuldu
  } catch (error) {
    res.status(400).send('Görev eklenirken bir hata oluştu');
  }
});

// Görev Tamamlanma Durumunu Güncelle (PUT /tasks/:id)
app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    const list = await List.findOne({ 'tasks._id': id });
    if (!list) {
      return res.status(404).send('Görev bulunamadı');
    }

    const task = list.tasks.id(id);
    task.completed = completed;
    await list.save();
    
    res.status(200).json(task); // Görev güncellenmiş şekilde döndürülür
  } catch (error) {
    res.status(500).send('Görev güncellenirken bir hata oluştu');
  }
});

// Sunucuyu başlat
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
