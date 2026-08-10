// import { integer, pgTable, varchar, boolean, timestamp, json } from "drizzle-orm/pg-core";
// import { drizzle } from 'drizzle-orm/neon-http';
import { defineRelations } from "drizzle-orm";
import * as p from "drizzle-orm/pg-core";

// automatically map camelCase from TypeScript to snake_case in the database via a dedicated builder.
export const user = p.pgTable("user", {
  id: p.text("id").primaryKey(),
  name: p.varchar({ length: 255 }).notNull(),
  email: p.varchar({ length: 255 }).notNull().unique(),
  is_subscribed: p.boolean().default(false),
  subscription_ends: p.timestamp().notNull(),
  // todos: todo[],
});

export const todo = p.pgTable("todo", {
  id: p.integer().primaryKey().generatedAlwaysAsIdentity(),
  user_id: p
    .text("user_id")
    .notNull()
    .references(() => user.id),
  title: p.varchar({ length: 255 }).notNull(),
  completed: p.boolean().default(false),
  created_at: p.timestamp(),
  updated_at: p.timestamp(),
});

export const relations = defineRelations({ user, todo }, (r) => ({
  todo: {
    user: r.one.user({
      from: r.todo.user_id,
      to: r.user.id,
    }),
  },

  user: {
    todos: r.many.todo(),
  },
}));

// const relations = defineRelations({ user, todo }, (r) => ({
// 		user: r.one.user({
// 			from: r.todo.id,
// 			to: r.user.id,
// 		}),
// 	},
//     user: {

//     }
// }));
