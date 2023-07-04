import {Application, Request, Response, NextFunction} from "express";
import {CategoriesRouter} from "./routes/categoriesRouter";
import {CategoryLevelsRouter} from "./routes/categoryLevelsRouter";
import {IndexRouter} from "./routes/indexRouter";
import {SessionsRouter} from "./routes/sessionsRouter";
import {ZooSpeciesRouter} from "./routes/zooSpeciesRouter";
import {ZoosRouter} from "./routes/zoosRouter";
import {SpeciesRouter} from "./routes/speciesRouter";
import {ZooDistancesRouter} from "./routes/zooDistancesRouter";
import {CategoriesProvider} from "./models/categoriesProvider";
import {SpeciesProvider} from "./models/speciesProvider";
import {CategoryLevelsProvider} from "./models/categoryLevelsProvider";
import {SessionsProvider} from "./models/sessionsProvider";
import {UserPostcodesProvider} from "./models/userPostcodesProvider";
import {ZooDistancesProvider} from "./models/zooDistancesProvider";
import {ZooSpeciesProvider} from "./models/zooSpeciesProvider";
import {ZoosProvider} from "./models/zoosProvider";
import {AuthChecker} from "./authChecker";
import {Pool} from "pg";

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

// Create db connection pool
const pool = new Pool()

// Create data providers
const categoryProvider = new CategoriesProvider(pool);
const categoryLevelsProvider = new CategoryLevelsProvider(pool);
const sessionsProvider = new SessionsProvider(pool);
const speciesProvider = new SpeciesProvider(pool);
const userPostcodesProvider = new UserPostcodesProvider(pool);
const zooDistancesProvider = new ZooDistancesProvider(pool);
const zooSpeciesProvider = new ZooSpeciesProvider(pool);
const zoosProvider = new ZoosProvider(pool);

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
    res.json({"error": err});
};
App.use(handler500);
