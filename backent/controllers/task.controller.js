const TaskModal = require('../models/task.modal');

class TaskController {
  async getAllTasks(req, res) {
    try {
      const allTasks = await TaskModal.find();
      return res.status(200).json(allTasks);
    } catch (error) {
      console.log(error);
    }
  }

  async createTask(req, res) {
    try {
      const task = TaskModal.create(req.body);
      return res.status(201).json({
        message: 'Task created successfully',
        task,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      await TaskModal.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new TaskController();