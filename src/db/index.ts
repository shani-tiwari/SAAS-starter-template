import { drizzle } from "drizzle-orm/neon-http";
import {relations} from "./schema";

// client DB URL()Neon DB
const db = drizzle(
    process.env.DATABASE_URL || '', 
    {
        // schema: { user, todo },
        relations
    }
);



export default db;
