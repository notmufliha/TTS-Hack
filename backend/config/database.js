const config = require("./config");
const pg = require("pg");

const pool = new pg.Pool({
  user: config.user,
  password: config.password,
  host: config.host,
  database: config.database,
  max: config.connectionLimit,
  port: config.port,
  ssl: {
    rejectUnauthorized: false,
  },
});

const oldQuery = pool.query;
pool.query = function (...args) {
  const [sql, params] = args;
  return oldQuery.apply(pool, args);
};

module.exports = pool;
