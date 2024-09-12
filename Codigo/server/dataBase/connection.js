const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'ep-shy-boat-a4wftm12-pooler.us-east-1.aws.neon.tech',
  user: 'default',
  password: 'y10VZJiUpjhg',
  database: 'verceldb',
});

module.exports = connection;
