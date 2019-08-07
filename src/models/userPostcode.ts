import {connection} from "../dbconnection";

export function getUserPostcodeById(id: number): Promise<UserPostcodeJson[]> {
    return connection().then(function (conn) {
        const result = conn.query("select * from user_postcodes where user_postcode_id=?", [id]);
        conn.end();
        return result;
    });
}

export function getUserPostcodeByPostcodeSector(sector: string): Promise<UserPostcodeJson[]> {
    return connection().then(function (conn) {
        const result = conn.query("select * from user_postcodes where postcode_sector=?", [sector]);
        conn.end();
        return result;
    });
}

export function addUserPostcode(newUserPostcode: NewUserPostcodeJson): Promise<UserPostcodeJson> {
    return connection().then(function (conn) {
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

export function deleteUserPostcode(id: string): Promise<void> {
    return connection().then(function (conn) {
        conn.query("delete from user_postcodes where user_postcodes_id=?", [id]);
        conn.end();
        return;
    });
}
