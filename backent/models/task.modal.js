const { Schema, model } = require('mongoose');

const TaskSchema = new Schema({
  title: { type: String, required: true },
  complited: { type: Boolean, default: false },
});

module.exports = model('Task', TaskSchema);