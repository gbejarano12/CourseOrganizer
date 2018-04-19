var express = require('express');
var router = express.Router();
var ctrlCourses = require('../controllers/courses');

router.get('/courses', ctrlCourses.courses);
router.get('/course/:courseid', ctrlCourses.coursesReadOne);
router.get('/course/:courseid/unsubmitted', ctrlCourses.assignmentsUnsubmitted);
router.post('/courses/:courseid/assignments', ctrlCourses.coursesCreateAssignment);
router.get('/courses/:courseid/assignments', ctrlCourses.coursesListAssignments);
router.put('/courses/:courseid/assignments/:assignmentid', ctrlCourses.coursesUpdateOne);
router.delete('/courses/:courseid/assignment/:assignmentid', ctrlCourses.coursesDeleteOne);

module.exports = router;
