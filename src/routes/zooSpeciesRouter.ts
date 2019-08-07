import {Router} from "express";
import {addZooSpecies, deleteZooSpecies} from "../models/zooSpecies";

export const ZooSpeciesRouter = Router();


ZooSpeciesRouter.post('/', function (req, res, next) {
    addZooSpecies(req.body).then(function () {
        res.json(req.body);
    }).catch(function (err) {
        res.status(500).json(err);
    });
});

ZooSpeciesRouter.delete('/', function (req, res, next) {
    deleteZooSpecies(req.body).then(function () {
        res.json(req.body);
    }).catch(function (err) {
        res.status(500).json(err);
    });
});
