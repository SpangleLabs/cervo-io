import {Application, Request, Response, NextFunction} from "express";
import {CategoriesRouter} from "./routes/categoriesRouter";
import {CategoryLevelsRouter} from "./routes/categoryLevelsRouter";
import {IndexRouter} from "./routes/indexRouter";
import {SessionsRouter} from "./routes/sessionsRouter";
import {ZooSpeciesRouter} from "./routes/zooSpeciesRouter";
import {ZoosRouter} from "./routes/zoosRouter";
import {SpeciesRouter} from "./routes/speciesRouter";
import {ZooDistancesRouter} from "./routes/zooDistancesRouter";

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

// Express errors can have a status code
interface ResponseError extends Error {
    status?: number;
}

export const App: Application = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
App.use(cors());  // TODO: cut that down to only from cervo.io?
App.use(logger('dev'));
App.use(bodyParser.json());
App.use(bodyParser.urlencoded({extended: false}));
App.use(express.static(path.join(__dirname, 'public')));

App.use('/', IndexRouter);
App.use('/zoos', ZoosRouter);
App.use('/categories', CategoriesRouter);
App.use('/category_levels', CategoryLevelsRouter);
App.use('/species', SpeciesRouter);
App.use('/zoo_species', ZooSpeciesRouter);
App.use('/zoo_distances', ZooDistancesRouter);
App.use('/session', SessionsRouter);

// catch 404 and forward to error handler
App.use(function (req, res, next) {
    const err = new Error('Not Found');
    res.status(404);
    next(err);
});

// error handler
App.use(function (err: ResponseError, req: Request, res: Response, next: NextFunction) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json(err);
});
