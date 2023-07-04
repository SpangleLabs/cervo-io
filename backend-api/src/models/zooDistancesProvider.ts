import {AbstractProvider} from "./abstractProvider"
import {NewZooDistanceJson, ZooDistanceJson} from "@cervoio/common-lib/src/apiInterfaces"

export class ZooDistancesProvider extends AbstractProvider {

    async getZooDistanceByZooIdAndUserPostcodeId(zoo_id: number, user_postcode_id: number): Promise<ZooDistanceJson[]> {
        const result = await this.pool.query(
            "select * from zoo_distances where zoo_id=$1 and user_postcode_id=$2",
            [zoo_id, user_postcode_id]
        )
        return result.rows.map(
            (datum: ZooDistanceJson) => ({
                zoo_distance_id: datum.zoo_distance_id,
                user_postcode_id: datum.user_postcode_id,
                zoo_id: datum.zoo_id,
                metres: datum.metres,
            })
        )
    }

    async addZooDistance(ZooDistance: NewZooDistanceJson): Promise<ZooDistanceJson> {
        const result = await this.pool.query(
            "insert into zoo_distances (`zoo_id`,`user_postcode_id`,`metres`) values ($1,$2,$3) returning zoo_distance_id",
            [ZooDistance.zoo_id, ZooDistance.user_postcode_id, ZooDistance.metres]
        )
        return {
            metres: ZooDistance.metres,
            user_postcode_id: ZooDistance.user_postcode_id,
            zoo_distance_id: result.rows[0].zoo_distance_id,
            zoo_id: ZooDistance.zoo_id,
        }
    }
}
