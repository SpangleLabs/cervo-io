import {ConnectionProvider} from "../dbconnection";
import {AbstractProvider} from "./abstractProvider";

function processIntoUserPostcodeJson(data: UserPostcodeJson[] | any): UserPostcodeJson[] {
    return data.map(function (datum: UserPostcodeJson | any) {
        return {
            user_postcode_id: datum.user_postcode_id,
            postcode_sector: datum.postcode_sector
        }
    });
}

export class UserPostcodesProvider extends AbstractProvider {

    constructor(connection: ConnectionProvider) {
        super(connection);
        
    }

    getUserPostcodeById(id: number): Promise<UserPostcodeJson[]> {
        return this.connection().then(function (conn) {
            const result = conn.query("select * from user_postcodes where user_postcode_id=?", [id]);
            conn.end();
            return result;
        }).then(processIntoUserPostcodeJson);
    }

    getUserPostcodeByPostcodeSector(sector: string): Promise<UserPostcodeJson[]> {
        return this.connection().then(function (conn) {
            const result = conn.query("select * from user_postcodes where postcode_sector=?", [sector]);
            conn.end();
            return result;
        }).then(processIntoUserPostcodeJson);
    }

    addUserPostcode(newUserPostcode: NewUserPostcodeJson): Promise<UserPostcodeJson> {
        return this.connection().then(function (conn) {
            const result = conn.query("insert into user_postcodes (`postcode_sector`) " +
                "values (?)", [newUserPostcode.postcode_sector]);
            conn.end();
            return result.then(function (data: NewEntryData) {
                const newRow: UserPostcodeJson = {
                    user_postcode_id: data.insertId,
                    postcode_sector: newUserPostcode.postcode_sector
                };
                return newRow;
            });
        });
    }

    deleteUserPostcode(id: string): Promise<void> {
        return this.connection().then(function (conn) {
            conn.query("delete from user_postcodes where user_postcodes_id=?", [id]);
            conn.end();
            return;
        });
    }
}