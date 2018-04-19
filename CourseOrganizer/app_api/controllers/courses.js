var mongoose = require('mongoose');
var Course = mongoose.model('Course');

var sendJsonResponse = function(res, status, content) {
  res.status(status);
  res.json(content);
}

module.exports.courses = function(req, res, next) {
  Course
    .find()
    .exec(function(err, courses) {
      if (!courses) {
        sendJsonResponse(res, 404, {
          "message": "courseid not found"
        });
        return;
      } else if (err) {
        sendJsonResponse(res, 404, err);
        return;
      }
      sendJsonResponse(res, 200, courses);
    });
};

module.exports.assignmentsUnsubmitted = function(req, res, next) {
  if (req.params && req.params.courseid) {
    Course
      .findById(req.params.courseid)
      .exec(function(err, course) {
        if (!course) {
          sendJsonResponse(res, 404, {
            "message": "courseid not found"
          });
          return;
        } else if (err) {
          sendJsonResponse(res, 404, err);
          return;
        }
        for (var i = 0; i < course.assignments.length; i++) {
          if (course.assignments[i].status == "Submitted") {
            course.assignments.splice(i, 1);
            i--;
          }
        }
        sendJsonResponse(res, 200, course);
      });
  } else {
    sendJsonResponse(res, 404, {
      "message": "No courseid in request"
    });
  }
};

module.exports.coursesReadOne = function(req, res, next) {
  if (req.params && req.params.courseid) {
    Course
      .findById(req.params.courseid)
      .exec(function(err, course) {
        if (!course) {
          sendJsonResponse(res, 404, {
            "message": "courseid not found"
          });
          return;
        } else if (err) {
          sendJsonResponse(res, 404, err);
          return;
        }
        sendJsonResponse(res, 200, course);
      });
  } else {
    sendJsonResponse(res, 404, {
      "message": "No courseid in request"
    });
  }
};

var doAddReview = function(req, res, course) {
  if (!course) {
    sendJsonResponse(res, 404, {
      "message": "courseid not found"
    });
  } else {
    course.assignments.push({
      name: req.body.name,
      dueDate: req.body.dueDate,
      points: req.body.points,
      status: req.body.status
    });
    course.save(function(err, course) {
      var thisAssignment;
      if (err) {
        sendJsonResponse(res, 400, err);
      } else {
        thisAssignment = course.assignments[course.assignments.length - 1];
        sendJsonResponse(res, 201, thisAssignment);
      }
    });
  }
};

module.exports.coursesCreateAssignment = function(req, res, next) {
  var courseid = req.params.courseid;
  if (courseid) {
    Course
    .findById(courseid)
    .select('assignments')
    .exec(
      function(err, course) {
        if (err) {
          sendJsonResponse(res, 400, err);
        } else {
          doAddReview(req, res, course);
        }
      }
    );
  } else {
    sendJsonResponse(res, 404, {
      "message": "Not found, courseid required"
    });
  }
};

module.exports.coursesListAssignments = function(req, res, next) {
  if (req.params && req.params.courseid) {
    Course
      .findById(req.params.courseid)
      .exec(function(err, course) {
        if (!course) {
          sendJsonResponse(res, 404, {
            "message": "courseid not found"
          });
          return;
        } else if (err) {
          sendJsonResponse(res, 404, err);
          return;
        }
        sendJsonResponse(res, 200, course);
      });
  } else {
    sendJsonResponse(res, 404, {
      "message": "No courseid in request"
    });
  }
};

module.exports.coursesUpdateOne = function(req, res, next) {
  if (!req.params.courseid || !req.params.assignmentid) {
    sendJsonResponse(res, 404, {
      "message": "Not found, courseid and assignmentid are both required"
    });
    return;
  }
  Course
    .findById(req.params.courseid)
    .select('assignments')
    .exec(
      function(err, course) {
        var thisAssignment;
        if (!course) {
          sendJsonResponse(res, 404, {
            "message": "courseid not found"
          });
          return;
        } else if (err) {
          sendJsonResponse(res, 400, err);
          return;
        }
        if(course.assignments && course.assignments.length > 0) {
          thisAssignment = course.assignments.id(req.params.assignmentid);
          if (!thisAssignment) {
            sendJsonResponse(res, 404, {
              "message": "courseid not found"
            });
          } else {
            thisAssignment.name = req.body.name;
            thisAssignment.dueDate = req.body.dueDate;
            thisAssignment.points = req.body.points;
            thisAssignment.status = req.body.status;
            course.save(function(err, course) {
              if (err) {
                sendJsonResponse(res, 404, err);
              } else {
                sendJsonResponse(res, 200, thisAssignment);
              }
            });
          }
        } else {
          sendJsonResponse(res, 404, {
            "message": "No assignment to update"
          });
        }
      }
    );
};

module.exports.coursesDeleteOne = function(req, res, next) {
  if (!req.params.courseid || !req.params.assignmentid) {
    sendJsonResponse(res, 404, {
      "message": "Not found, courseid and assignmentid are both required"
    });
    return;
  }
  Course
    .findById(req.params.courseid)
    .select('assignments')
    .exec(
      function(err, course) {
        if (!course) {
          sendJsonResponse(res, 404, {
            "message": "courseid not found"
          });
          return;
        } else if (err) {
          sendJsonResponse(res, 400, err);
          return;
        }
        if (course.assignments && course.assignments.length > 0) {
          if (!course.assignments.id(req.params.assignmentid)) {
            sendJsonResponse(res, 404, {
              "message": "assignmentid not found"
            });
          } else {
            course.assignments.id(req.params.assignmentid).remove();
            course.save(function(err) {
              if (err) {
                sendJsonResponse(res, 404, err);
              } else {
                sendJsonResponse(res, 204, null);
              }
            });
          }
        } else {
          sendJsonResponse(res, 404, {
            "message": "No review to delete"
          });
        }
      }
    );
};
