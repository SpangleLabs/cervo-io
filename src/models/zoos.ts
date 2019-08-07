import {connection} from "../dbconnection";


export function getAllZoos(): Promise<ZooJson[]> {
    return connection().then(function (conn) {
        const result = conn.query("select * from zoos");
        conn.end();
        return result;
    });
}

export function getZooById(id: number): Promise<ZooJson[]> {
    return connection().then(function (conn) {
        const result = conn.query("select * from zoos where zoo_id=?", [id]);
        conn.end();
        return result;
    });
}

export function getZoosBySpeciesId(species_id: number): Promise<ZooEntryForSpeciesJson[]> {
    return connection().then(function (conn) {
        const result = conn.query("select * from zoo_species " +
            "left join zoos on zoo_species.zoo_id = zoos.zoo_id " +
            "where zoo_species.species_id = ?", [species_id]);
        conn.end();
        return result;
    });
}

export function addZoo(Zoo: NewZooJson): Promise<void> {
    return connection().then(function (conn) {
        const result = conn.query("insert into zoos (`name`,`postcode`,`latitude`,`longitude`,`link`) " +
            "values (?,?,?,?,?)", [Zoo.name, Zoo.postcode, Zoo.latitude, Zoo.longitude, Zoo.link]);
        conn.end();
        return result;
    });
}

export function deleteZoo(id: number): Promise<void> {
    return connection().then(function (conn) {
        conn.query("delete from zoos where zoo_id=?", [id]);
        conn.end();
        return;
    });
}

export function updateZoo(id: number, updateZoo: NewZooJson): Promise<void> {
    return connection().then(function (conn) {
        conn.query("update zoos set name=?, postcode=?, link=?, latitude=?, longitude=? where zoo_id=?",
            [updateZoo.name, updateZoo.postcode, updateZoo.link, updateZoo.latitude, updateZoo.longitude, id]);
        conn.end();
        return;
    });
}