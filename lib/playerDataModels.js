const pg = require('pg');

const connectionString = process.env.SQL
const idleTimeoutMillis = 2000;
const pool = new pg.Pool({ connectionString, idleTimeoutMillis });

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

