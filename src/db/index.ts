import { Db, MongoClient } from "mongodb";

const connectionStrings = {
  local: "mongodb://localhost:27017",
  alpha:
    "mongodb+srv://rcmalpha:rcmalpha@rcmalpha.ymcakmt.mongodb.net/?retryWrites=true&w=majority", // For local testing against a live DB. Supports search
  prod: `mongodb+srv://rcmadmin:${process.env.MONGO_PROD_PASSWORD}@rcmprod.nsjci.mongodb.net/?retryWrites=true&w=majority`,
};

const databaseNames = {
  local: "LighthouseLocalDB",
  alpha: "LighthouseAlphaDB",
  prod: "LighthouseProdDB",
};

const connectionString =
  // @ts-ignore
  connectionStrings[process.env.DB_ENV] ?? connectionStrings["local"];
const client = new MongoClient(connectionString);
let conn: MongoClient;

async function getConnection() {
  if (!conn) {
    conn = await client.connect();
  }
  return conn;
}

let db: Db;

const connectionPromise = getConnection().then((conn) => {
  // @ts-ignore
  db = conn.db(
    // @ts-ignore
    databaseNames[process.env.DB_ENV] ?? databaseNames["local"]
  );
});

async function getDb() {
  await connectionPromise;
  return db;
}

export { getDb };
