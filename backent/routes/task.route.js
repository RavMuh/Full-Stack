const express = require('express');
const TaskController = require('../controllers/task.controller');

const router = express.Router();

router.get('/getAllTasks', TaskController.getAllTasks);

router.post('/createTask', TaskController.createTask);

router.delete('/deleteTask/:id', TaskController.deleteTask);

module.exports = router;