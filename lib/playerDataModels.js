const pg = require('pg');
const fs = require('fs');
const config = {
  user: process.env.DB_user,
  password: process.env.DB_password,
  host: process.env.DB_host,
  port: process.env.DB_port,
  database: process.env.DB_database,
  ssl: {
      rejectUnauthorized: false,
      // ca: fs.readFileSync('./ca.pem').toString(),
  },
};
const pool = new pg.Pool(config);

module.exports = {
  connect: async () =>{
    return await pool.connect();
  },
  query: async (text, params, callback) => {
    console.log('executed query', text);
    
    return await pool.query(text, params, callback);
  },
  end: async () =>{
      return await pool.end();
  }
};
