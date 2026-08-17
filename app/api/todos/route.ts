import db from "@/src/db";
import { todo } from "@/src/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";


export async function GET(req: NextRequest){

    const { userId } = await auth();
    if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    };

    const {searchParams} = new URL(req.url);
    const search = searchParams.get("search") || "";

    try {

        const todos = await db.query.todo.findMany({
            where: {user_id: userId, 
                title: {like: `%${search}%`}
            },
            orderBy : {created_at: 'desc'},
        });

        const count = await db.$count(todo, eq(todo.user_id, userId));

        return Response.json({
            message: "Todos fetched successfully",
            todos,
            count,
            success: true
        }, {status: 200});

    } catch (error) {
        return Response.json({ error: `Error in Server ${error}` }, { status: 500 });
    };

};


export async function POST(req: NextRequest){
    const {userId} = await auth();
    if (!userId) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    };

    const User = await db.query.user.findFirst({
        where: { id: userId },
        with: {
            todos: true,
        },
    });
    if (!User){
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    };
    if(!User.is_subscribed && User.todos.length >= 3){
        return Response.json({ error: "Please upgrade your subscription to create more todos" }, { status: 401 });
    }

    const {title} = await req.json();
    
    const {searchParams} = new URL(req.url);
    const search = searchParams.get("search") || "";

    await db.insert(todo).values({
        title,
        user_id: userId,
        created_at: new Date(),
        updated_at: new Date()
    });
    const todos = await db.query.todo.findMany({
            where: {user_id: userId, 
                title: {like: `%${search}%`}
            },
            orderBy : {created_at: 'desc'},
    });

    return Response.json({ message: "Todo created successfully", success: true, todos: todos });

    
};