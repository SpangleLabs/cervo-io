const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const index = require('./routes/index');
const zoos = require('./routes/zoos');
const categories = require('./routes/categories');
const category_levels = require('./routes/category_levels');
const species = require('./routes/species');
const zoo_species = require('./routes/zoo_species');
const zoo_distances = require('./routes/zoo_distances');
const session = require('./routes/session');

const app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors());  // TODO: cut that down to only from cervo.io?
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);  // TODO: do I need this?
app.use('/zoos', zoos);
app.use('/categories', categories);
app.use('/category_levels', category_levels);
app.use('/species', species);
app.use('/zoo_species', zoo_species);
app.use('/zoo_distances', zoo_distances);
app.use('/session', session);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
