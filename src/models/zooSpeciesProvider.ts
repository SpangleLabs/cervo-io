import {ConnectionProvider} from "../dbconnection";
import {AbstractProvider} from "./abstractProvider";

function hasUniqueId(arg: any): arg is ZooSpeciesLinkJson {
    return arg.zoo_species_id !== undefined;
}

function processIntoZooSpeciesLinkJson(data: ZooSpeciesLinkJson[] | any): ZooSpeciesLinkJson[] {
    return data.map(function (datum: ZooSpeciesLinkJson | any) {
        return {
            zoo_species_id: datum.zoo_species_id,
            zoo_id: datum.zoo_id,
            species_id: datum.species_id
        }
    });
}

export class ZooSpeciesProvider extends AbstractProvider {

    constructor(connection: ConnectionProvider) {
        super(connection);
    }
    
    getZooSpeciesByZooId(id: number): Promise<ZooSpeciesLinkJson[]> {
        return this.connection().then(function (conn) {
            const result = conn.query("select * from zoo_species where zoo_id=?", [id]);
            conn.end();
            return result;
        }).then(processIntoZooSpeciesLinkJson);
    }

    getZooSpeciesBySpeciesId(id: number): Promise<ZooSpeciesLinkJson[]> {
        return this.connection().then(function (conn) {
            const result = conn.query("select * from zoo_species where species_id=?", [id]);
            conn.end();
            return result;
        }).then(processIntoZooSpeciesLinkJson);
    }

    addZooSpecies(newZooSpecies: NewZooSpeciesLinkJson): Promise<ZooSpeciesLinkJson> {
        return this.connection().then(function (conn) {
            const result = conn.query("insert into zoo_species (`zoo_id`,`species_id`) " +
                "values (?,?)", [newZooSpecies.zoo_id, newZooSpecies.species_id]);
            conn.end();
            return result.then(function (data: NewEntryData) {
                const result: ZooSpeciesLinkJson = {
                    zoo_species_id: data.insertId,
                    zoo_id: newZooSpecies.zoo_id,
                    species_id: newZooSpecies.species_id
                };
                return result;
            })
        });
    }

    deleteZooSpecies(deleteLink: ZooSpeciesLinkJson | NewZooSpeciesLinkJson): Promise<void> {
        return this.connection().then(function (conn) {
            if (hasUniqueId(deleteLink)) {
                conn.query("delete from zoo_species where zoo_species_id=?", [deleteLink.zoo_species_id]);
                conn.end();
                return;
            } else {
                conn.query("delete from zoo_species where zoo_id=? and species_id=?", [deleteLink.zoo_id, deleteLink.species_id]);
                conn.end();
                return;
            }
        });
    }
}