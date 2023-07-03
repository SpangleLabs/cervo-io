import {Application, Request, Response, NextFunction} from "express";
import {CategoriesRouter} from "./routes/categoriesRouter";
import {CategoryLevelsRouter} from "./routes/categoryLevelsRouter";
import {IndexRouter} from "./routes/indexRouter";
import {SessionsRouter} from "./routes/sessionsRouter";
import {ZooSpeciesRouter} from "./routes/zooSpeciesRouter";
import {ZoosRouter} from "./routes/zoosRouter";
import {SpeciesRouter} from "./routes/speciesRouter";
import {ZooDistancesRouter} from "./routes/zooDistancesRouter";
import {connection} from "./dbconnection";
import {CategoriesProvider} from "./models/categoriesProvider";
import {SpeciesProvider} from "./models/speciesProvider";
import {CategoryLevelsProvider} from "./models/categoryLevelsProvider";
import {SessionsProvider} from "./models/sessionsProvider";
import {UserPostcodesProvider} from "./models/userPostcodesProvider";
import {ZooDistancesProvider} from "./models/zooDistancesProvider";
import {ZooSpeciesProvider} from "./models/zooSpeciesProvider";
import {ZoosProvider} from "./models/zoosProvider";
import {AuthChecker} from "./authChecker";
import { Client } from "pg";

const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

export const App: Application = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
App.use(cors());  // TODO: cut that down to only from cervo.io?
App.use(logger('dev'));
App.use(bodyParser.json());
App.use(bodyParser.urlencoded({extended: false}));
App.use(express.static(path.join(__dirname, 'public')));
App.enable('trust proxy');

// Create db client
const client = new Client();

// Create data providers
const categoryProvider = new CategoriesProvider(connection, client);
const categoryLevelsProvider = new CategoryLevelsProvider(connection, client);
const sessionsProvider = new SessionsProvider(connection, client);
const speciesProvider = new SpeciesProvider(connection, client);
const userPostcodesProvider = new UserPostcodesProvider(connection, client);
const zooDistancesProvider = new ZooDistancesProvider(connection, client);
const zooSpeciesProvider = new ZooSpeciesProvider(connection, client);
const zoosProvider = new ZoosProvider(connection, client);

// Create auth checker
const authChecker = new AuthChecker(sessionsProvider);

// Create and register routers
const indexRouter = new IndexRouter(authChecker);
indexRouter.register(App);
const categoryRouter = new CategoriesRouter(authChecker, categoryProvider, speciesProvider);
categoryRouter.register(App);
const categoryLevelsRouter = new CategoryLevelsRouter(authChecker, categoryLevelsProvider);
categoryLevelsRouter.register(App);
const sessionsRouter = new SessionsRouter(authChecker, sessionsProvider);
sessionsRouter.register(App);
const speciesRouter = new SpeciesRouter(authChecker, speciesProvider, zoosProvider);
speciesRouter.register(App);
const zooDistancesRouter = new ZooDistancesRouter(authChecker, zooDistancesProvider, userPostcodesProvider, zoosProvider);
zooDistancesRouter.register(App);
const zooSpeciesRouter = new ZooSpeciesRouter(authChecker, zooSpeciesProvider);
zooSpeciesRouter.register(App);
const zoosRouter = new ZoosRouter(authChecker, zoosProvider, speciesProvider);
zoosRouter.register(App);

// catch 404 and forward to error handler
export const handler404 = function (req: Request, res: Response, next: NextFunction) {
    const err: Error = new Error('Not Found');
    res.status(404);
    next(err);
};
App.use(handler404);

// error handler
export const handler500 = function (err: Error, req: Request, res: Response, next: NextFunction) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(res.statusCode || 500);
    res.json(err);
};
App.use(handler500);
