CREATE DATABASE `zoo_species`;
USE `zoo_species`;

-- Create tables

DROP TABLE IF EXISTS `zoos`;
CREATE TABLE `zoos` (
  `zoo_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `postcode` varchar(100) NOT NULL,
  `link` varchar(500) NOT NULL,
  PRIMARY KEY (`zoo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `category_levels`;
CREATE TABLE `category_levels` (
  `category_level_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`category_level_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category_level_id` int(11) NOT NULL,
  `parent_category_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`category_id`),
  KEY `category_level_id_idx` (`category_level_id`),
  KEY `parent_category_id_idx` (`parent_category_id`),
  CONSTRAINT `category_level_id`
    FOREIGN KEY (`category_level_id`)
    REFERENCES `category_levels` (`category_level_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `parent_category_id`
    FOREIGN KEY (`parent_category_id`)
    REFERENCES `categories` (`category_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `species`;
CREATE TABLE `species` (
  `species_id` int(11) NOT NULL AUTO_INCREMENT,
  `common_name` varchar(100) NOT NULL,
  `latin_name` varchar(100) NOT NULL,
  `category_id` int(11) NOT NULL,
  PRIMARY KEY (`species_id`),
  KEY `category_id_idx` (`category_id`),
  CONSTRAINT `category_id`
    FOREIGN KEY (`category_id`)
    REFERENCES `categories` (`category_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `zoo_species`;
CREATE TABLE `zoo_species`.`zoo_species` (
  `zoo_species_id` INT NOT NULL AUTO_INCREMENT COMMENT '',
  `zoo_id` INT NOT NULL COMMENT '',
  `species_id` INT NOT NULL COMMENT '',
  PRIMARY KEY (`zoo_species_id`)  COMMENT '',
  INDEX `zoo_id_idx` (`zoo_id` ASC)  COMMENT '',
  INDEX `species_id_idx` (`species_id` ASC)  COMMENT '',
  UNIQUE INDEX `zoo_species` (`zoo_id` ASC, `species_id` ASC),
  CONSTRAINT `zoo_id`
    FOREIGN KEY (`zoo_id`)
    REFERENCES `zoo_species`.`zoos` (`zoo_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `species_id`
    FOREIGN KEY (`species_id`)
    REFERENCES `zoo_species`.`species` (`species_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

DROP TABLE IF EXISTS `user_postcodes`;
CREATE TABLE `zoo_species`.`user_postcodes` (
  `user_postcode_id` INT NOT NULL AUTO_INCREMENT,
  `postcode_sector` NVARCHAR(10) NOT NULL,
  PRIMARY KEY (`user_postcode_id`),
  UNIQUE INDEX `postcode_sector_UNIQUE` (`postcode_sector` ASC));

DROP TABLE IF EXISTS `zoo_distances`;
CREATE TABLE `zoo_species`.`zoo_distances` (
  `zoo_distance_id` INT NOT NULL AUTO_INCREMENT,
  `zoo_id` INT NOT NULL,
  `user_postcode_id` INT NOT NULL,
  `metres` INT NOT NULL,
  PRIMARY KEY (`zoo_distance_id`),
  INDEX `zoo_id_idx` (`zoo_id` ASC),
  INDEX `user_postcode_id_idx` (`user_postcode_id` ASC),
  CONSTRAINT `zoo_id2`
    FOREIGN KEY (`zoo_id`)
    REFERENCES `zoo_species`.`zoos` (`zoo_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `user_postcode_id`
    FOREIGN KEY (`user_postcode_id`)
    REFERENCES `zoo_species`.`user_postcodes` (`user_postcode_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

ALTER TABLE `zoo_species`.`zoo_distances`
ADD UNIQUE INDEX `index4` (`user_postcode_id` ASC, `zoo_id` ASC);


-- Load up some data

INSERT INTO `zoo_species`.`category_levels` (`name`) VALUES ('genus');
INSERT INTO `zoo_species`.`category_levels` (`name`) VALUES ('tribe');
INSERT INTO `zoo_species`.`category_levels` (`name`) VALUES ('subfamily');
INSERT INTO `zoo_species`.`category_levels` (`name`) VALUES ('family');
INSERT INTO `zoo_species`.`category_levels` (`name`) VALUES ('infraorder');
INSERT INTO `zoo_species`.`category_levels` (`name`) VALUES ('suborder');
INSERT INTO `zoo_species`.`category_levels` (`name`) VALUES ('clade');
INSERT INTO `zoo_species`.`category_levels` (`name`) VALUES ('order');
INSERT INTO `zoo_species`.`category_levels` (`name`) VALUES ('superorder');
INSERT INTO `zoo_species`.`category_levels` (`name`) VALUES ('magnorder');
INSERT INTO `zoo_species`.`category_levels` (`name`) VALUES ('(unranked)');
INSERT INTO `zoo_species`.`category_levels` (`name`) VALUES ('infraclass');
INSERT INTO `zoo_species`.`category_levels` (`name`) VALUES ('subclass');
INSERT INTO `zoo_species`.`category_levels` (`name`) VALUES ('class');
INSERT INTO `zoo_species`.`category_levels` (`name`) VALUES ('phylum');
INSERT INTO `zoo_species`.`category_levels` (`name`) VALUES ('kingdom');

INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`) VALUES ('animalia', '16');
INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`, `parent_category_id`) VALUES ('chordata', '15', '1');
INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`, `parent_category_id`) VALUES ('mammalia', '14', '2');
INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`, `parent_category_id`) VALUES ('theria', '13', '3');
INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`, `parent_category_id`) VALUES ('eutheria', '12', '4');
INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`, `parent_category_id`) VALUES ('exafroplacentalia', '11', '5');
INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`, `parent_category_id`) VALUES ('boreoeutheria', '10', '6');
INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`, `parent_category_id`) VALUES ('laurasiatheria', '9', '7');
INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`, `parent_category_id`) VALUES ('scrotifera', '11', '8');
INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`, `parent_category_id`) VALUES ('artiodactyla', '8', '9');
INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`, `parent_category_id`) VALUES ('artiofabula', '7', '10');
INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`, `parent_category_id`) VALUES ('cetruminantia', '7', '11');
INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`, `parent_category_id`) VALUES ('ruminantiamorpha', '7', '12');
INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`, `parent_category_id`) VALUES ('ruminantia', '6', '13');
INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`, `parent_category_id`) VALUES ('pecora', '5', '14');
INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`, `parent_category_id`) VALUES ('cervidae', '4', '15');
INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`, `parent_category_id`) VALUES ('cervinae', '3', '16');
INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`, `parent_category_id`) VALUES ('cervini', '2', '17');
INSERT INTO `zoo_species`.`categories` (`name`, `category_level_id`, `parent_category_id`) VALUES ('axis', '1', '18');

INSERT INTO `zoo_species`.`species` (`common_name`, `latin_name`, `category_id`) VALUES ('Chital', 'axis axis', '19');