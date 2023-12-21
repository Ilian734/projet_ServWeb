const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const mongo = require('mongodb');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
const MONGODB_URI = 'mongodb://localhost:27017/todo-app';


app.use(bodyParser.json());

// Servir les fichiers statiques depuis le dossier 'public'
app.use(express.static('public'));

MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) {
        console.error('Erreur de connexion à MongoDB', err);
        return;
    }

    const db = client.db('todo-app');
    const tasksCollection = db.collection('tasks');

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    // Endpoint pour obtenir les tâches paginées
    app.get('/tasks', async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        const skip = (page - 1) * pageSize;

        const tasks = await tasksCollection.find({}).skip(skip).limit(pageSize).toArray();
        res.json(tasks);
    });

   // Endpoint pour ajouter une nouvelle tâche
app.post('/tasks', async (req, res) => {
    const newTask = req.body;
    await tasksCollection.insertOne(newTask);
    res.status(201).send();
});

// Endpoint pour supprimer une tâche
app.delete('/tasks/:id', async (req, res) => {
    const taskId = req.params.id;
    await tasksCollection.deleteOne({ _id: mongo.ObjectId(taskId) });
    res.status(200).send();
});

// Endpoint pour marquer une tâche comme terminée
app.put('/tasks/:id', async (req, res) => {
    const taskId = req.params.id;
    await tasksCollection.updateOne({ _id: mongo.ObjectId(taskId) }, { $set: { completed: true } });
    res.status(200).send();
});

    app.listen(PORT, () => {
        console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
    });
});