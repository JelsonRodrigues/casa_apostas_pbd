const Pool = require("pg").Pool;

const jsonInitFile = require("./init.json"); 

const pool = new Pool({
    user: jsonInitFile.db_user,
    password: jsonInitFile.db_password,
    host: jsonInitFile.db_host,
    port: jsonInitFile.db_port,
    database: jsonInitFile.db_database
});

module.exports = pool;