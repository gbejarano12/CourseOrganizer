var mongoose = require('mongoose');

var dbURI = 'mongodb://localhost/CourseOrganizer';
if (process.env.NODE_ENV === 'production') {
  dbURI = 'mongodb://heroku_9q2lk6v3:fg70g0bvbrp15s331rba1faec4@ds215709.mlab.com:15709/heroku_9q2lk6v3';
}
mongoose.connect(dbURI);

var readLine = require("readline");
if (process.platform === "win32") {
  var rl = readLine.createInterface ({
    input: process.stdin,
    output: process.stdout
  });
  rl.on ("SIGINT", function() {
    process.emit("SIGINT");
  });
}

mongoose.connection.on('connected', function() {
  console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', function(err) {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', function() {
  console.log('Mongoose disconnected');
});

var gracefulShutdown = function (msg, callback) {
  mongoose.connection.close(function() {
    console.log('Mongoose disconnected through ' + msg);
    callback();
  });
};

process.once('SIGUSR2', function() {
  gracefulShutdown('nodemon restart', function() {
    process.kill(process.pid, 'SIGUSR2');
  });
});

process.on('SIGINT', function() {
  gracefulShutdown('app termination', function() {
    process.exit(0);
  });
});

process.on('SIGTERM', function() {
  gracefulShutdown('Heroku app shutdown', function() {
    process.exit(0);
  });
});

require('./courses');
