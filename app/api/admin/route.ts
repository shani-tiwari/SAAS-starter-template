import db from "@/src/db";
import { user } from "@/src/db/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

async function isAdmin(userId: string){
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const userRole = user.publicMetadata.role as string | undefined;
    
    return userRole === 'admin';
};


// export async function PUT(req: NextRequest, {
//     searchParams
// }: { searchParams: URLSearchParams }) {
    
//     const adminId = searchParams.get("id");
//     const {userId} = await auth();
    
// }