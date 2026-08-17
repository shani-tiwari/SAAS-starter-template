import db from "@/src/db";
import { todo } from "@/src/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


export async function DELETE(req: NextRequest, 
    // {params}: {params: URLSearchParams}
    {params}: {params: Promise<{id: string}>}
){

    const {userId} =  await auth();
    const {id: todoId} = await params;

    if (!userId) {
        return Response.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    if (!todoId) {
        return Response.json(
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
            return Response.json({error: "Todo not found"}, {status: 404});
        };

        if(Todo[0].user_id != userId){
            return Response.json({error: "Unauthorized"}, {status: 401});
        };

        await db.delete(todo).where(eq(todo.id, Number(todoId)));

        return Response.json({message: "Todo deleted successfully", success: true});
        
    }catch(err){
        return Response.json({error: "Internal server error"}, {status: 500});
    }
};

export async function PUT(req: NextRequest, {params}:{params: {id: string}}){

    const {userId} = await auth();
    const todoId = params.id;

    if(!userId){
        return NextResponse.json(
            {error: "Unauthorized"},
            {status: 401}
        );
    };

    if(!todoId){
        return Response.json(
            {error: "Todo id is required"},
            {status: 400}
        );
    };

    const {completed} = await req.json();
    if(typeof completed !== 'boolean'){
        return Response.json(
            {error: "Invalid request"},
            {status: 400}
        );
    };

    try {
        /**handleUpdateTodo receives json.todo which returns the old un-updated todo from db.select(). */
        const Todo = await db.select({ 
            id: todo.id,
            user_id: todo.user_id,
        }).from(todo).where(eq(todo.id, Number(todoId)));

        if(!Todo[0]) return Response.json({error: "Todo not found"}, {status: 404});
        
        if(Todo[0].user_id !== userId) return Response.json({error: "Unauthorized"}, {status: 401});


        await db.update(todo).set({
            completed
        }).where(eq(todo.id, Number(todoId)));

        return Response.json({success: true, todo: Todo}, {status: 200});
        
    }catch(e){
        return Response.json({error: "Internal server error", err: e}, {status: 500});
    }
    
}