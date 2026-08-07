import { clerkMiddleware, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';
// clerkClient - easier to interact with the API


// maybe some changes were there to make route public on clerk level
const publicRoutes = [
  '/',
  'api/webhook/register',
  'sign-in',
  'sign-up'
];

export default clerkMiddleware(async (auth, req) => {

  /**
   * req.url - full url (https://localhost:3000/sign-in)
   * req.nextUrl.pathname - pathname of the current url (/sign-in)
   */

  const { isAuthenticated, redirectToSignIn, userId } = await auth()

  if (!isAuthenticated && !publicRoutes.includes(req.nextUrl.pathname)) return redirectToSignIn();

  try{
    if(userId) {

      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      const userRole = user.publicMetadata.role as string | undefined;

      // admin user
      if(userRole ===  "admin" && req.nextUrl.pathname === '/dashboard') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      };

      // non-admin user
      if(userRole !==  "admin" && req.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      };

      // redirect auth user, to not access sign-in/up page
      if(isAuthenticated && publicRoutes.includes(req.nextUrl.pathname)) {
        return NextResponse.redirect(new URL('/dashboard', req.url)); 
      };
      
      // redirect auth users trying to use public routes
      if(publicRoutes.includes(req.nextUrl.pathname)){
        return NextResponse.redirect(new URL(
          userRole === 'admin' ? '/admin/dashboard' : '/dashboard'
        )); 
      }

    }

    // return NextResponse.next();

  }catch(error){
    console.error('Error in proxy.ts:', error);
    return NextResponse.redirect(new URL('/error', req.url));
  };


}, { debug: true });


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Always run for Clerk-specific frontend API routes
    '/__clerk/(.*)',
  ],
}