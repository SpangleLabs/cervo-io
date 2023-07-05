import {AbstractProvider} from "./abstractProvider"
import {NewUserPostcodeJson, UserPostcodeJson} from "@cervoio/common-lib/src/apiInterfaces"

function processIntoUserPostcodeJson(data: UserPostcodeJson[] | any): UserPostcodeJson[] {
    return data.map((datum: UserPostcodeJson | any) => ({
        user_postcode_id: datum.user_postcode_id,
        postcode_sector: datum.postcode_sector,
    }))
}

export class UserPostcodesProvider extends AbstractProvider {

    async getUserPostcodeById(id: number): Promise<UserPostcodeJson[]> {
        const result = await this.pool.query(
            "select * from user_postcodes where user_postcode_id=$1",
            [id],
        )
        return processIntoUserPostcodeJson(result.rows)
    }

    async getUserPostcodeByPostcodeSector(sector: string): Promise<UserPostcodeJson[]> {
        const result = await this.pool.query(
            "select * from user_postcodes where postcode_sector=$1",
            [sector]
        )
        return processIntoUserPostcodeJson(result.rows)
    }

    async addUserPostcode(newUserPostcode: NewUserPostcodeJson): Promise<UserPostcodeJson> {
        const result = await this.pool.query(
            "insert into user_postcodes (postcode_sector) values ($1) returning user_postcode_id",
            [newUserPostcode.postcode_sector],
        )
        return {
            user_postcode_id: result.rows[0].user_postcode_id,
            postcode_sector: newUserPostcode.postcode_sector,
        }
    }

    async deleteUserPostcode(id: string): Promise<void> {
        await this.pool.query(
            "delete from user_postcodes where user_postcodes_id=$1",
            [id],
        )
    }
}
