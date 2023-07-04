import {AbstractProvider} from "./abstractProvider"
import {NewZooJson, ZooEntryForSpeciesJson, ZooJson} from "@cervoio/common-lib/src/apiInterfaces"

function processIntoZooJson(data: ZooJson[] | any): ZooJson[] {
    return data.map((datum: ZooJson | any)  => ({
        zoo_id: datum.zoo_id,
        name: datum.name,
        postcode: datum.postcode,
        link: datum.link,
        latitude: datum.latitude,
        longitude: datum.longitude,
    }))
}

export class ZoosProvider extends AbstractProvider {

    async getAllZoos(): Promise<ZooJson[]> {
        const result = await this.pool.query(
            "select * from zoos"
        )
        return processIntoZooJson(result.rows)
    }

    async getZooById(id: number): Promise<ZooJson[]> {
        const result = await this.pool.query(
            "select * from zoos where zoo_id=$1",
            [id]
        )
        return processIntoZooJson(result.rows)
    }

    async getZoosBySpeciesId(species_id: number): Promise<ZooEntryForSpeciesJson[]> {
        const result = await this.pool.query(
            "select * from zoo_species " +
            "left join zoos on zoo_species.zoo_id = zoos.zoo_id " +
            "where zoo_species.species_id = $1",
            [species_id],
        )
        return result.rows.map(
            (datum: ZooEntryForSpeciesJson) => ({
                zoo_species_id: datum.zoo_species_id,
                species_id: datum.species_id,
                zoo_id: datum.zoo_id,
                name: datum.name,
                postcode: datum.postcode,
                link: datum.link,
                latitude: datum.latitude,
                longitude: datum.longitude,
            })
        )
    }

    async addZoo(newZoo: NewZooJson): Promise<ZooJson> {
        const result = await this.pool.query(
            "insert into zoos (`name`,`postcode`,`latitude`,`longitude`,`link`) values ($1,$2,$3,$4,$5) returning zoo_id",
            [newZoo.name, newZoo.postcode, newZoo.latitude, newZoo.longitude, newZoo.link]
        )
        return {
            zoo_id: result.rows[0].zoo_id,
            name: newZoo.name,
            postcode: newZoo.postcode,
            latitude: newZoo.latitude,
            longitude: newZoo.longitude,
            link: newZoo.link
        }
    }

    async deleteZoo(id: number): Promise<void> {
        await this.pool.query(
            "delete from zoos where zoo_id=$1",
            [id],
        )
    }

    async updateZoo(id: number, updateZoo: NewZooJson): Promise<void> {
        await this.pool.query(
            "update zoos set name=$1, postcode=$2, link=$3, latitude=$4, longitude=$5 where zoo_id=$6",
            [updateZoo.name, updateZoo.postcode, updateZoo.link, updateZoo.latitude, updateZoo.longitude, id]
        )
    }
}
