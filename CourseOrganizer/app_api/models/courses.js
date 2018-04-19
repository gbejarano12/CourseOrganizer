var mongoose = require('mongoose');

var assignmentSchema = new mongoose.Schema({
  name: {type: String, required: true},
  dueDate: String,
  points: {type: Number, required: true, "default": 0, min: 0, max: 100},
  status: {type: String, required: true}
});

var courseSchema = new mongoose.Schema({
  courseId: {type: String, required: true},
  name: {type: String, required: true},
  instructor: String,
  credits: Number,
  location: String,
  assignments: [assignmentSchema]
});

mongoose.model('Course', courseSchema);
