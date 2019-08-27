/**
 * Created by dr-spangle on 17/04/2017.
 */
function SpeciesObj(){}
SpeciesObj.prototype.species_id = 1;
SpeciesObj.prototype.name = "name";
SpeciesObj.prototype.category_id = 1;
SpeciesObj.prototype.zoos = [];

function CategoryObj(){}
CategoryObj.prototype.category_id = 1;
CategoryObj.prototype.name = "name";
CategoryObj.prototype.parent_category_id = 1;
CategoryObj.prototype.sub_categories = [CategoryObj];
CategoryObj.prototype.species = [SpeciesObj];

function ZooObj(){}
ZooObj.prototype.zoo_id = 1;
ZooObj.prototype.name = "name";
ZooObj.prototype.postcode = "postcode";
ZooObj.prototype.link = "link";

function SessionObj(){}
SessionObj.prototype.auth_token = ""; //Random string
SessionObj.prototype.expiry_date = ""; //ISO8601 date
SessionObj.prototype.ip_addr = ""; //User IP address
SessionObj.prototype.username = ""; //Username