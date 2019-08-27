declare module "mysql-import"

declare function config(settings: object): importer;

declare class mysqlConnection {
    end(): void
}

declare class importer {
    conn: mysqlConnection
    import(filename: string): Promise<void>
}
