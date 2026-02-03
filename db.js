const {Pool} = require('pg')
require('dotenv').config()

const pool = new Pool({
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    database:'postgres',
    password:process.env.DB_PASS,
    user:process.env.DB_USER,

    ssl: {
        rejectUnauthorized: false // Allows connection over SSL
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
})

module.exports = {
    query:(text,params) => pool.query(text,params)
}