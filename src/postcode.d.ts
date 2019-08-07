declare module "postcode";

declare class Postcode {
    _raw: string;
    _valid: boolean;

    constructor(rawPostcode: string)

    static validOutcode(outcode: string): boolean

    valid(): boolean
    normalise(): string

    incode(): string
    outcode(): string
    area(): string
    district(): string
    subDistrict(): string
    sector(): string
    unit(): string
}
