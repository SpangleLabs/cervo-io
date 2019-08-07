import {connection} from "../dbconnection";

export function getZooDistanceByZooIdAndUserPostcodeId(zoo_id: number, user_postcode_id: number): Promise<ZooDistanceJson[]> {
    return connection().then(function (conn) {
        const result = conn.query("select * from zoo_distances where zoo_id=? and user_postcode_id=?", [zoo_id, user_postcode_id]);
        conn.end();
        return result;
    });
}

export function addZooDistance(ZooDistance: NewZooDistanceJson): Promise<void> {
    return connection().then(function (conn) {
        conn.query("insert into zoo_distances (`zoo_id`,`user_postcode_id`,`metres`) " +
            "values (?,?,?)", [ZooDistance.zoo_id, ZooDistance.user_postcode_id, ZooDistance.metres]);
        conn.end();
        return;
    });
}
