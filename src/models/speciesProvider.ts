import {ConnectionProvider} from "../dbconnection";
import {AbstractProvider} from "./abstractProvider";

export class SpeciesProvider extends AbstractProvider {

    constructor (connection: ConnectionProvider) {
        super(connection);
    }

    getAllSpecies(): Promise<SpeciesJson[]> {
        return this.connection().then(function (conn) {
            const result = conn.query("select * from species");
            conn.end();
            return result;
        });
    }

    getSpeciesById(id: number): Promise<SpeciesJson[]> {
        return this.connection().then(function (conn) {
            const result = conn.query("select * from species where species_id=?", [id]);
            conn.end();
            return result;
        });
    }

    getSpeciesByCategoryId(id: number): Promise<SpeciesJson[]> {
        return this.connection().then(function (conn) {
            const result = conn.query("select * from species where category_id=?", [id]);
            conn.end();
            return result;
        });
    }

    getSpeciesByZooId(zoo_id: number): Promise<SpeciesEntryForZooJson[]> {
        return this.connection().then(function (conn) {
            const result = conn.query("select * from zoo_species " +
                "left join species on zoo_species.species_id = species.species_id " +
                "where zoo_species.zoo_id = ?", [zoo_id]);
            conn.end();
            return result;
        });
    }

    getSpeciesByName(search: string): Promise<SpeciesJson[]> {
        return this.connection().then(function (conn) {
            const result = conn.query("select * from species " +
                "where common_name like ? or latin_name like ? " +
                "order by common_name", [search, search]);
            conn.end();
            return result;
        });
    }

    getSpeciesByCommonName(search: string): Promise<SpeciesJson[]> {
        return this.connection().then(function (conn) {
            const result = conn.query("select * from species " +
                "where common_name like ? " +
                "order by common_name", [search]);
            conn.end();
            return result;
        });
    }

    getFirstLetters(): Promise<LetterJson[]> {
        return this.connection().then(function (conn) {
            const result = conn.query("select distinct left(common_name, 1) as letter " +
                "from species " +
                "order by letter");
            conn.end();
            return result;
        })
    }

    addSpecies(newSpecies: NewSpeciesJson): Promise<SpeciesJson> {
        return this.connection().then(function (conn) {
            const result = conn.query("insert into species (`common_name`,`latin_name`,`category_id`) " +
                "values (?,?,?)", [newSpecies.common_name, newSpecies.latin_name, newSpecies.category_id]);
            conn.end();
            return result.then(function (data: NewEntryData) {
                const result: SpeciesJson = {
                    species_id: data.insertId,
                    common_name: newSpecies.common_name,
                    latin_name: newSpecies.latin_name,
                    category_id: newSpecies.category_id
                };
                return result;
            });
        });
    }

    deleteSpecies(id: number): Promise<void> {
        return this.connection().then(function (conn) {
            conn.query("delete from species where species_id=?", [id]);
            conn.end();
            return;
        });
    }

    updateSpecies(id: number, Species: NewSpeciesJson): Promise<void> {
        return this.connection().then(function (conn) {
            conn.query("update species set common_name=?, latin_name=?, category_id=? where species_id=?",
                [Species.common_name, Species.latin_name, Species.category_id, id]);
            conn.end();
            return;
        });
    }
}
