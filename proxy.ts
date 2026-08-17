import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';



const publicRoutes = [
  '/',
  '/api/webhook/register', 
  '/sign-in',
  '/sign-up'
];


export default clerkMiddleware(async (auth, req) => {

  const { isAuthenticated, userId, sessionClaims } = await auth()

  if (!isAuthenticated && !publicRoutes.includes(req.nextUrl.pathname)){
    // return redirectToSignIn({returnBackUrl: new URL('/sign-in', req.url)});
    console.log('trying to redirect on sign up ', req.nextUrl.pathname)
    return NextResponse.redirect(new URL('/sign-up', req.url));
  } 

  try{
    if(userId) {

      const userRole = sessionClaims?.role;

      // admin user
      if(userRole ===  "admin" && req.nextUrl.pathname === '/dashboard') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      };

      // non-admin user
      if(userRole !==  "admin" && req.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      };

      // redirect auth user, to not access sign-in/up page
        // if(isAuthenticated && publicRoutes.includes(req.nextUrl.pathname)) {
        //   return NextResponse.redirect(new URL('/dashboard', req.url)); 
        // };
      
      // redirect auth users trying to use public routes
      if(publicRoutes.includes(req.nextUrl.pathname)){
        return NextResponse.redirect(new URL(
          userRole === 'admin' ? '/admin/dashboard' : '/dashboard',
          req.url
        )); 
      }

    }

    return NextResponse.next();  // when no redirect is required.

  }catch(error){
    console.error('Error in proxy.ts:', error);
    return NextResponse.redirect(new URL('/error', req.url));
  };


});


export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
}