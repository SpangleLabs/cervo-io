import {AbstractProvider} from "./abstractProvider"
import {NewZooSpeciesLinkJson, ZooSpeciesLinkJson} from "@cervoio/common-lib/src/apiInterfaces"

function hasUniqueId(arg: any): arg is ZooSpeciesLinkJson {
    return arg.zoo_species_id !== undefined
}

function processIntoZooSpeciesLinkJson(data: ZooSpeciesLinkJson[] | any): ZooSpeciesLinkJson[] {
    return data.map((datum: ZooSpeciesLinkJson | any)  => ({
        zoo_species_id: datum.zoo_species_id,
        zoo_id: datum.zoo_id,
        species_id: datum.species_id,
    }))
}

export class ZooSpeciesProvider extends AbstractProvider {

    async getZooSpeciesByZooId(id: number): Promise<ZooSpeciesLinkJson[]> {
        await this.client.connect()
        const result = await this.client.query(
            "select * from zoo_species where zoo_id=$1",
            [id]
        )
        await this.client.end()
        return processIntoZooSpeciesLinkJson(result.rows)
    }

    async getZooSpeciesBySpeciesId(id: number): Promise<ZooSpeciesLinkJson[]> {
        await this.client.connect()
        const result = await this.client.query(
            "select * from zoo_species where species_id=$1",
            [id]
        )
        await this.client.end()
        return processIntoZooSpeciesLinkJson(result.rows)
    }

    async addZooSpecies(newZooSpecies: NewZooSpeciesLinkJson): Promise<ZooSpeciesLinkJson> {
        await this.client.connect()
        const result = await this.client.query(
            "insert into zoo_species (`zoo_id`,`species_id`) values ($1,$2) returning zoo_species_id",
            [newZooSpecies.zoo_id, newZooSpecies.species_id],
        )
        await this.client.end()
        return {
            zoo_species_id: result.rows[0].zoo_species_id,
            zoo_id: newZooSpecies.zoo_id,
            species_id: newZooSpecies.species_id,
        }
    }

    async deleteZooSpecies(deleteLink: ZooSpeciesLinkJson | NewZooSpeciesLinkJson): Promise<void> {
        await this.client.connect()
        if (hasUniqueId(deleteLink)) {
            await this.client.query(
                "delete from zoo_species where zoo_species_id=$1",
                [deleteLink.zoo_species_id]
            )
        } else {
            await this.client.query(
                "delete from zoo_species where zoo_id=$1 and species_id=$2",
                [deleteLink.zoo_id, deleteLink.species_id]
            )
        }
        await this.client.end()
    }
}