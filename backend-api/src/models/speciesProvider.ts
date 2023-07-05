import {AbstractProvider} from "./abstractProvider"
import {LetterJson} from "../dbInterfaces"
import {NewSpeciesJson, SpeciesEntryForZooJson, SpeciesJson} from "@cervoio/common-lib/src/apiInterfaces"

function processIntoSpeciesJson(data: SpeciesJson[] | any): SpeciesJson[] {
    return data.map((datum: SpeciesJson | any) => ({
        species_id: datum.species_id,
        common_name: datum.common_name,
        latin_name: datum.latin_name,
        category_id: datum.category_id,
        hidden: datum.hidden,
    }))
}

export class SpeciesProvider extends AbstractProvider {

    async getAllSpecies(): Promise<SpeciesJson[]> {
        const result = await this.pool.query(
            "select * from species order by common_name"
        )
        return processIntoSpeciesJson(result.rows)
    }

    async getSpeciesById(id: number): Promise<SpeciesJson[]> {
        const result = await this.pool.query(
            "select * from species where species_id=$1",
            [id]
        )
        return processIntoSpeciesJson(result.rows)
    }

    async getSpeciesByCategoryId(id: number): Promise<SpeciesJson[]> {
        const result = await this.pool.query(
            "select * from species where category_id=$1 order by common_name",
            [id]
        )
        return processIntoSpeciesJson(result.rows)
    }

    async getSpeciesByZooId(zoo_id: number): Promise<SpeciesEntryForZooJson[]> {
        const result = await this.pool.query(
            "select * from zoo_species " +
            "left join species on zoo_species.species_id = species.species_id " +
            "where zoo_species.zoo_id = $1",
            [zoo_id]
        )
        return result.rows.map(
            (datum: SpeciesEntryForZooJson) => ({
                species_id: datum.species_id,
                common_name: datum.common_name,
                latin_name: datum.latin_name,
                category_id: datum.category_id,
                hidden: datum.hidden,
                zoo_species_id: datum.zoo_species_id,
                zoo_id: datum.zoo_id,
            })
        )
    }

    async getSpeciesByName(search: string): Promise<SpeciesJson[]> {
        const result = await this.pool.query(
            "select * from species " +
            "where common_name ILIKE $1 or latin_name ILIKE $2 " +
            "order by common_name",
            [search, search]
        )
        return processIntoSpeciesJson(result.rows)
    }

    async getSpeciesByCommonName(search: string): Promise<SpeciesJson[]> {
        const result = await this.pool.query(
            "select * from species " +
            "where common_name ILIKE $1 " +
            "order by common_name",
            [search]
        )
        return processIntoSpeciesJson(result.rows)
    }

    async getFirstLetters(): Promise<LetterJson[]> {
        const result = await this.pool.query(
            "select distinct upper(left(common_name, 1)) as letter, hidden " +
            "from species " +
            "order by letter"
        )
        return result.rows.map((datum: LetterJson) => ({
            letter: datum.letter,
            hidden: datum.hidden
        }))
    }

    async addSpecies(newSpecies: NewSpeciesJson): Promise<SpeciesJson> {
        const result = await this.pool.query(
            "insert into species (`common_name`,`latin_name`,`category_id`,`hidden`) " +
                "values ($1,$2,$3,$4) returning species_id",
            [newSpecies.common_name, newSpecies.latin_name, newSpecies.category_id, newSpecies.hidden]
        )
        return {
            species_id: result.rows[0].species_id,
            common_name: newSpecies.common_name,
            latin_name: newSpecies.latin_name,
            category_id: newSpecies.category_id,
            hidden: newSpecies.hidden
        }
    }

    async deleteSpecies(id: number): Promise<void> {
        await this.pool.query("delete from species where species_id=$1", [id])
    }

    async updateSpecies(id: number, Species: NewSpeciesJson): Promise<void> {
        await this.pool.query(
            "update species set common_name=$1, latin_name=$2, category_id=$3 where species_id=$4",
            [Species.common_name, Species.latin_name, Species.category_id, id]
        )
    }
}
