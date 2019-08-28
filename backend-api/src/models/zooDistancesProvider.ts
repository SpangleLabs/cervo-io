import {ConnectionProvider} from "../dbconnection";
import {AbstractProvider} from "./abstractProvider";
import {NewZooDistanceJson, ZooDistanceJson} from "../apiInterfaces";
import {NewEntryData} from "../dbInterfaces";

export class ZooDistancesProvider extends AbstractProvider {

    constructor(connection: ConnectionProvider) {
        super(connection);
    }
    
    getZooDistanceByZooIdAndUserPostcodeId(zoo_id: number, user_postcode_id: number): Promise<ZooDistanceJson[]> {
        return this.connection().then(function (conn) {
            const result = conn.query("select * from zoo_distances where zoo_id=? and user_postcode_id=?", [zoo_id, user_postcode_id]);
            conn.end();
            return result;
        }).then(function (data: ZooDistanceJson[]) {
            return data.map(function (datum: ZooDistanceJson) {
                return {
                    zoo_distance_id: datum.zoo_distance_id,
                    user_postcode_id: datum.user_postcode_id,
                    zoo_id: datum.zoo_id,
                    metres: datum.metres
                }
            })
        })
    }

    addZooDistance(ZooDistance: NewZooDistanceJson): Promise<ZooDistanceJson> {
        return this.connection().then(function (conn) {
            const result = conn.query("insert into zoo_distances (`zoo_id`,`user_postcode_id`,`metres`) " +
                "values (?,?,?)", [ZooDistance.zoo_id, ZooDistance.user_postcode_id, ZooDistance.metres]);
            conn.end();
            return result.then(function (data: NewEntryData) {
                const result: ZooDistanceJson = {
                    metres: ZooDistance.metres,
                    user_postcode_id: ZooDistance.user_postcode_id,
                    zoo_distance_id: data.insertId,
                    zoo_id: ZooDistance.zoo_id
                };
                return result;
            })
        });
    }
}