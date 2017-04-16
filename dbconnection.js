var mysql=require('mysql');
var connection=mysql.createPool({

    host:'localhost',
    user:'root',
    password:'password', // Obviously not in production
    database:'zoo_species'

});
module.exports=connection;