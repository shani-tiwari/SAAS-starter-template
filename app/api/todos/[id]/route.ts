import db from "@/src/db";
import { todo } from "@/src/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(req: NextRequest, 
    {searchParams}: {searchParams: URLSearchParams}
){

    const {userId} =  await auth();
    const todoId = searchParams.get("id");

    if (!userId) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    if (!todoId) {
        return NextResponse.json(
            { error: "Todo id is required" },
            { status: 400 }
        );
    };

    try {
        const Todo = await db.select({
            id: todo.id,
            user_id: todo.user_id,
        }).from(todo).where(eq(todo.id, Number(todoId)));

        if(!Todo[0]){
            return NextResponse.json({error: "Todo not found"}, {status: 404});
        };

        if(Todo[0].user_id != userId){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        };

        await db.delete(todo).where(eq(todo.id, Number(todoId)));

        return NextResponse.json({message: "Todo deleted successfully"});
        
    }catch(err){
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
};