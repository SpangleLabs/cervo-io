/**
 * Created by dr-spangle on 17/04/2017.
 */
function SpeciesObj(){}
SpeciesObj.prototype.species_id = 1;
SpeciesObj.prototype.name = "name";
SpeciesObj.prototype.category_id = 1;

function Category(){}
Category.prototype.category_id = 1;
Category.prototype.name = "name";
Category.prototype.parent_category_id = 1;
Category.prototype.sub_categories = [Category];
Category.prototype.species = [SpeciesObj];