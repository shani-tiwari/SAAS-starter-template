
import {auth} from "@clerk/nextjs/server";



// export async function isAdmin(){

//     const {sessionClaims} = await auth();
//     const userRole = sessionClaims?.role as string | undefined;
//     if(userRole === 'admin'){
//         return Response.json({
//             // status: 200,  ->  here this is just a property only, not HTTP status
//             success: true,
//             isAdmin: true
//         }, {status: 200});  // -> this is for HTTP status
//     }else{
//         return Response.json(   
//             // { status: 401, success: false},
//             { 
//                 isAdmin: false,
//                 message: 'Not authorized',
//                 success: false,
//             },
//             { status: 401 },  // HTTP status
//         );
//     }
    
//     // const clerk = await clerkClient();
//     // const user = await clerk.users.getUser(userId);
//     // const userRole = user.publicMetadata.role as string | undefined;
    
//     // return userRole === 'admin';
// };


export async function isAdmin() {
  const { sessionClaims } = await auth();

  const userRole = sessionClaims?.role as string | undefined;

  return userRole === "admin";
};


export default async function GET(req: Request){ 
    const {userId} = await auth();
    if(!userId) return Response.json({error: "Unauthorized"}, {status: 401});

    const admin = await isAdmin();
    if(!admin){
        return Response.json({
            success: false,
            admin: false,
            message: 'not an admin - unauthorize'
        }, {status: 403});
    }
    return Response.json({
        success: true,
        admin: true,
        message: 'admin access granted'
    }, {status: 200});

}