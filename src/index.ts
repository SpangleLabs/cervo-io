import {Application, Request, Response, NextFunction} from "express";
import {CategoriesRouter} from "./routes/categoriesRouter";
import {CategoryLevelsRouter} from "./routes/categoryLevelsRouter";
import {IndexRouter} from "./routes/indexRouter";
import {SessionsRouter} from "./routes/sessionsRouter";

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const zoos = require('./routes/zoos');
const species = require('./routes/species');
const zoo_species = require('./routes/zoo_species');
const zoo_distances = require('./routes/zoo_distances');

// Express errors can have a status code
interface ResponseError extends Error {
    status?: number;
}

const app: Application = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cors());  // TODO: cut that down to only from cervo.io?
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', IndexRouter);
app.use('/zoos', zoos);
app.use('/categories', CategoriesRouter);
app.use('/category_levels', CategoryLevelsRouter);
app.use('/species', species);
app.use('/zoo_species', zoo_species);
app.use('/zoo_distances', zoo_distances);
app.use('/session', SessionsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    res.status(404);
    next(err);
});

// error handler
app.use(function (err: ResponseError, req: Request, res: Response, next: NextFunction) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json(err);
});

module.exports = {"app": app};
