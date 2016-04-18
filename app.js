//var env = require('node-env-file');
//env(__dirname + '.env');

//console.log(process.env);

var express = require('express');

var session = require('express-session');
var FileStore = require('session-file-store')(session);

var cors = require('cors');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var exphbs  = require('express-handlebars');
//var consolidate = require('consolidate');
var swig = require('swig');
var marked = require('marked');

var routes = require('./routes/index');
var api = require('./routes/api');

var basicAuth = require('basicauth-middleware');

var url=require('url');

var app = express();

var env = process.env.ENVIRONMENT || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// view engine setup
app.engine('.html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
swig.setDefaults({autoescape: false, cache: process.env.ENVIRONMENT == 'development' ? false : 'memory', root: path.join(__dirname, 'views')});
swig.setFilter('markdown', function(input) {
  return marked(input);
});

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
    store: new FileStore({}),
    secret: process.env.WEB_SESSION_SECRET || 'supersecretsession!'
}));
app.use(cookieParser());

app.use("/static", express.static(path.join(__dirname, 'public')));
app.use('/', routes);
app.use('/api',api);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace

if (process.env.ENVIRONMENT === "development") {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
} else {
    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {},
            title: 'error'
        });
    });
}


module.exports = app;
