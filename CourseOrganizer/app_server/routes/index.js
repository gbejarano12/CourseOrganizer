var express = require('express');
var router = express.Router();
var ctrlCourses = require('../controllers/courses');

/* GET courses pages */
router.get('/', ctrlCourses.homelist);
router.get('/course/:courseid', ctrlCourses.courseAssignments);
router.get('/course/:courseid/unsubmitted', ctrlCourses.unsubmittedAssignments)
router.get('/course/:courseid/assignment/new', ctrlCourses.addAssignment);
router.post('/course/:courseid/assignment/new', ctrlCourses.doAddAssignment);
router.get('/course/:courseid/assignment/:assignmentid/delete', ctrlCourses.deleteAssignment);
router.get('/course/:courseid/assignment/:assignmentid/edit', ctrlCourses.editAssignment);
router.post('/course/:courseid/assignment/:assignmentid/edit', ctrlCourses.doEditAssignment);


module.exports = router;
