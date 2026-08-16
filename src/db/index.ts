import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { relations } from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, relations: relations }); 

// await db.execute('select 1');

export default db;
