var request = require('request');
var apiOptions = {
  server : "http://localhost:3000"
};
if (process.env.NODE_ENV === 'production') {
  apiOptions.server = "http://gentle-beach-64504.herokuapp.com";
}

var renderHomepage = function(req, res, next, responseBody) {
  var message;
  if (!(responseBody instanceof Array)) {
    message = "API lookup error";
    responseBody = [];
  } else {
    if (!responseBody.length) {
      message = "No courses found";
    }
  }
  res.render('course-list', {
    title: 'Course Organizer',
    pageHeader: {
      title: 'Course Organizer',
      strapline: 'You got due dates, let us help!'
    },
    courses: responseBody,
    message: message
  });
};

/* GET home page */
module.exports.homelist = function(req, res, next) {
  var requestOptions, path;
  path = '/api/courses';
  requestOptions = {
    url : apiOptions.server + path,
    method : "GET",
    json : {},
    qs : {}
  };
  request(
    requestOptions,
    function(err, response, body) {
      renderHomepage(req, res, next, body);
    }
  );
};

var getCourseInfo = function(req, res, next, callback) {
  var requestOptions, path;
  path = "/api/course/" + req.params.courseid;
  requestOptions = {
    url : apiOptions.server + path,
    method : "GET",
    json : {}
  };
  request(
    requestOptions,
    function(err, response, body) {
      if (response.statusCode === 200) {
        callback(req, res, body);
      } else {
        _showError(req, res, next, response.statusCode);
      }
    }
  );
};

var renderCoursePage = function(req, res, next, courseDetail) {
  res.render('course-assignments', {
    title: courseDetail.name,
    pageHeader: {
      title: courseDetail.courseId
    },
    course: courseDetail
  });
};

var _showError = function(req, res, next, status) {
  var title, content;
  if (status === 404) {
    title = "404, page not found";
    content = "Oh dear. Looks like we can't find this page. Sorry.";
  } else {
    title = status + ", something's gone wrong";
    content = "Something, somewhere, has gone wrong just a little but wrong.";
  }
  res.status(status);
  res.render('generic-text', {
    title : title,
    content : content
  });
};
/* GET Course assignments page */
module.exports.courseAssignments = function(req, res, next) {
  getCourseInfo(req, res, next, function(req, res, responseData) {
    renderCoursePage(req, res, next, responseData);
  });
};

module.exports.unsubmittedAssignments = function(req, res, next) {
  var requestOptions, path, courseid;
  courseid = req.params.courseid;
  path = "/api/course/" + courseid + '/unsubmitted';
  requestOptions = {
    url : apiOptions.server + path,
    method : "GET",
    json : {}
  };
  request(
    requestOptions,
    function(err, response, body) {
      renderCoursePage(req, res, next, body);
    }
  );
};

var renderAssignmentForm = function(req, res, next, courseDetail) {
  if (courseDetail.assignments.length > 1) {
    courseDetail.assignments[0].name = "";
    courseDetail.assignments[0].dueDate = "";
    courseDetail.assignments[0].points = "";
    courseDetail.assignments[0].status = "Not started";
  } else if (courseDetail.assignments.length == 0) {
    courseDetail.assignments.push({
      name: "",
      dueDate: "",
      points: "",
      status: "Not started"
    });
  }
  res.render('assignment-form', {
    title: 'Add assignment',
    pageHeader: {
      title: 'Add Assignment for ',
      courseId: courseDetail.courseId
    },
    error: req.query.err,
    course: courseDetail
  });
};

/* GET Add assignment page */
module.exports.addAssignment = function(req, res, next) {
  getCourseInfo(req, res, next, function(req, res, responseData) {
    renderAssignmentForm(req, res, next, responseData);
  });
};

module.exports.editAssignment = function(req, res, next) {
  getCourseInfo(req, res, next, function(req, res, responseData) {
    for (var i = 0; i < responseData.assignments.length; i++) {
      if (responseData.assignments[i]._id != req.params.assignmentid) {
        responseData.assignments.splice(i, 1);
        i--;
      }
    }
    renderAssignmentForm(req, res, next, responseData);
  });
};

module.exports.doEditAssignment = function(req, res, next) {
  var requestOptions, path, courseid, assignmentid, postdata;
  courseid = req.params.courseid;
  assignmentid = req.params.assignmentid;
  path = "/api/courses/" + courseid + '/assignments/' + assignmentid;
  postdata = {
    name: req.body.name,
    dueDate: req.body.due,
    points: parseInt(req.body.points, 10),
    status: req.body.status
  };
  requestOptions = {
    url : apiOptions.server + path,
    method : "PUT",
    json : postdata
  };
  if (!postdata.name || !postdata.points || !postdata.status) {
    res.redirect('/course/' + courseid + '/assignment/' + assignmentid + '/edit?err=val');
  } else if(postdata.points < 0 || postdata.points > 100) {
    res.redirect('/course/' + courseid + '/assignment/' + assignmentid + '/edit?err=points')
  } else {
    request(
      requestOptions,
      function(err, response, body) {
        if (response.statusCode === 200) {
          res.redirect('/course/' + courseid);
        } else if (response.statusCode === 400 && body.name && body.name === "ValidationError"){
          res.redirect('/course/' + courseid + '/assignment/' + assignmentid + '/edit?err=val');
        } else {
          _showError(req, res, next, response.statusCode);
        }
      }
    );
  }
}

module.exports.doAddAssignment = function(req, res, next) {
  var requestOptions, path, courseid, postdata;
  courseid = req.params.courseid;
  path = "/api/courses/" + courseid + '/assignments';
  postdata = {
    name: req.body.name,
    dueDate: req.body.due,
    points: parseInt(req.body.points, 10),
    status: req.body.status
  };
  requestOptions = {
    url : apiOptions.server + path,
    method : "POST",
    json: postdata
  };
  if (!postdata.name || !postdata.points || !postdata.status) {
    res.redirect('/course/' + courseid + '/assignment/new?err=val');
  } else if(postdata.points < 0 || postdata.points > 100) {
    res.redirect('/course/' + courseid + '/assignment/new?err=points')
  } else {
    request(
      requestOptions,
      function(err, response, body) {
        if (response.statusCode === 201) {
          res.redirect('/course/' + courseid);
        } else if (response.statusCode === 400 && body.name && body.name === "ValidationError"){
          res.redirect('/course/' + courseid + '/assignment/new?err=val');
        } else {
          _showError(req, res, next, response.statusCode);
        }
      }
    );
  }
};

module.exports.deleteAssignment = function(req, res, next) {
  var requestOptions, path, courseid, assignmentid;
  courseid = req.params.courseid;
  assignmentid = req.params.assignmentid;
  path = "/api/courses/" + courseid + '/assignment/' + assignmentid;
  requestOptions = {
    url : apiOptions.server + path,
    method : "DELETE",
    json : {}
  };
  request(
    requestOptions,
    function(err, response, body) {
      res.redirect('/course/' + courseid);
    }
  );
};
