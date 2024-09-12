import pkg from 'pg';
const { Pool } =  pkg;
import 'dotenv/config'  

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port:  process.env.DATABASE_PORT,
  ssl: {
    ca: process.env.SSL_CERT,
  },
  
})

pool.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

export default pool;