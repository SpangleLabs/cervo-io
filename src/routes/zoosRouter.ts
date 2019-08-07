import {Router} from "express";
import {addZoo, getAllZoos, getZooById} from "../models/zoos";
import {getSpeciesByZooId} from "../models/species";

export const ZoosRouter = Router();

function fillOutZoo(zoo: ZooJson): Promise<FullZooJson> {
    return getSpeciesByZooId(zoo.zoo_id).then(function(data) {
        const fullZoo: FullZooJson = {
            zoo_id: zoo.zoo_id,
            name: zoo.name,
            link: zoo.link,
            postcode: zoo.postcode,
            latitude: zoo.latitude,
            longitude: zoo.longitude,
            species: data
        };
        return fullZoo;
    })
}

/* GET zoos listing. */
ZoosRouter.get('/:id?', function (req, res, next) {
    if (req.params.id) {
        getZooById(req.params.id).then(function (rows) {
            return Promise.all(rows.map(x => fillOutZoo(x)))
        }).then(function (fullRows) {
            res.json(fullRows);
        }).catch(function (err) {
            res.status(500).json(err);
        });
    } else {
        getAllZoos().then(function (rows) {
            res.json(rows);
        }).catch(function (err) {
            res.status(500).json(err);
        });
    }
});

ZoosRouter.post('/', function (req, res, next) {
    addZoo(req.body).then(function () {
        res.json(req.body);
    }).catch(function (err) {
        res.status(500).json(err);
    });
});
