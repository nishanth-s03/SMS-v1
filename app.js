var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");


const winston = require('winston');
const fs = require('fs');

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/staff");
var dummyRouter = require("./routes/dummyRoute");


const fileupload=require ('express-fileupload');




const session = require("express-session");
const flash = require("connect-flash");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");



app.use(
  session({
    secret: "key to sign",
    resave: false,
    saveUninitialized: false,
    cookie: {
      // Set the session cookie properties
      maxAge: 3600000, // 1 hour in milliseconds
      httpOnly: true, // The cookie is not accessible via JavaScript
    },
  })
);





const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const log = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
    }),
  ],
});


app.use((req, res, next) => {
  // Log the incoming request
  log.info(`${req.method} ${req.url}`);
  next();
});







//these are the middleware used for all routes, but we can't include specific routes here..
app.use(flash());
app.use(logger("dev"));
app.use(express.json());
const bodyParser = require("body-parser");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public"))); //__dirname refers to the NEWAPP directory "public " refers that
//we are going inside public subdirectory and including that..

//app.use('', indexRouter); only for root path
app.use("/", indexRouter);
//app.use('/', indexRouter);// not only for root also to subpaths..
app.use("/staff", usersRouter);


app.use("/dummy", dummyRouter);

app.use(fileupload({
  useTempFiles:true
}))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
