import {AbstractProvider} from "./abstractProvider";
import {NewZooJson, ZooEntryForSpeciesJson, ZooJson} from "@cervoio/common-lib/src/apiInterfaces";
import {NewEntryData} from "../dbInterfaces";

function processIntoZooJson(data: ZooJson[] | any): ZooJson[] {
    return data.map(function (datum: ZooJson | any) {
        return {
            zoo_id: datum.zoo_id,
            name: datum.name,
            postcode: datum.postcode,
            link: datum.link,
            latitude: datum.latitude,
            longitude: datum.longitude
        }
    });
}

export class ZoosProvider extends AbstractProvider {

    getAllZoos(): Promise<ZooJson[]> {
        return this.connection().then(function (conn) {
            const result = conn.query("select * from zoos");
            conn.end();
            return result;
        }).then(processIntoZooJson);
    }

    getZooById(id: number): Promise<ZooJson[]> {
        return this.connection().then(function (conn) {
            const result = conn.query("select * from zoos where zoo_id=?", [id]);
            conn.end();
            return result;
        }).then(processIntoZooJson);
    }

    getZoosBySpeciesId(species_id: number): Promise<ZooEntryForSpeciesJson[]> {
        return this.connection().then(function (conn) {
            const result = conn.query("select * from zoo_species " +
                "left join zoos on zoo_species.zoo_id = zoos.zoo_id " +
                "where zoo_species.species_id = ?", [species_id]);
            conn.end();
            return result;
        }).then(function (data: ZooEntryForSpeciesJson[]) {
            return data.map(function (datum: ZooEntryForSpeciesJson) {
                return {
                    zoo_species_id: datum.zoo_species_id,
                    species_id: datum.species_id,
                    zoo_id: datum.zoo_id,
                    name: datum.name,
                    postcode: datum.postcode,
                    link: datum.link,
                    latitude: datum.latitude,
                    longitude: datum.longitude
                }
            })
        })
    }

    addZoo(newZoo: NewZooJson): Promise<ZooJson> {
        return this.connection().then(function (conn) {
            const result = conn.query("insert into zoos (`name`,`postcode`,`latitude`,`longitude`,`link`) " +
                "values (?,?,?,?,?)", [newZoo.name, newZoo.postcode, newZoo.latitude, newZoo.longitude, newZoo.link]);
            conn.end();
            return result.then(function (data: NewEntryData) {
                const result: ZooJson = {
                    zoo_id: data.insertId,
                    name: newZoo.name,
                    postcode: newZoo.postcode,
                    latitude: newZoo.latitude,
                    longitude: newZoo.longitude,
                    link: newZoo.link
                };
                return result;
            });
        });
    }

    deleteZoo(id: number): Promise<void> {
        return this.connection().then(function (conn) {
            conn.query("delete from zoos where zoo_id=?", [id]);
            conn.end();
            return;
        });
    }

    updateZoo(id: number, updateZoo: NewZooJson): Promise<void> {
        return this.connection().then(function (conn) {
            conn.query("update zoos set name=?, postcode=?, link=?, latitude=?, longitude=? where zoo_id=?",
                [updateZoo.name, updateZoo.postcode, updateZoo.link, updateZoo.latitude, updateZoo.longitude, id]);
            conn.end();
            return;
        });
    }
}