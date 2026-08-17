* Form
action - for modern react 19, next js app router, formData is used
onSubmit - for older versions of react
some more with this is - useActionState(), useFormStatus()

* Next js
Next.js does not recognize `proxy.ts` as HTTP middleware automatically. We will create `middleware.ts` at the root that delegates to proxy.ts so that @proxy.ts remains the main implementation file while Next.js middleware execution works correctly.

* NextResponse.redirect(new URL('/dashboard', baseURL)) 
--- for Server Components onlly


* 
we wanna have webhook for event driven architecture
made an webhook route on clerk with svix 
webhook can't work with local host
so install localtunnel - gives a local https url of our project


* useEffect(() => { fetchTodos() }, [fetchTodos]);
                     ^^^^^^^^^^ Avoid calling setState() directly within an effect
- we are setting state's inside that function - which bothers, so move entire function in useEffect
- exclude useCallback() - can't be called inside another callback.




- updated how db is created with drizzle to refer schema and relations
- Next.js App Router dynamic route handlers, searchParams is not passed as the 2nd argument (it receives `{ params }`). searchParams will be undefined, throwing: TypeError: Cannot read properties of undefined `(reading 'get')`.
- corrected the api response,  to check success of task,  on frontend.
- Throwing a Response in Next.js causes an unhandled 500 server crash, changed it to return.
- Manage heavy network calls - add public data in clerk session, directly accessed by `auth()` to access and check.
- remove `signIn.create() `as `signIn.password()` already do that work.
- Webhook needed when our own backend/database needs to know about event happening in Clerk(storing data in our DB).
- clerk checks is that event added in webhook or not, and also secret.
- if yes, then it trigger that event ex.`user.created`,  to let us do operation on data.


? Why we use (auth), (authenticated) like this -> () - says i won't be in a url/route, i just help you to group similar route for maintainance.
? all backend code should be in app/api(all routes - endpoints) and `lib/services/utils`


/**
   * req.url - full url (https://localhost:3000/sign-in)
   * req.nextUrl.pathname - pathname of the current url (/sign-in)
*/


- Response.json() -> based on web api's (standard), if not `.json()` used then add `new` before it.
- NextResponse.json()/redirect()/next() -> advance features



* params is not a URLSearchParams instance.
In Next.js 15, route params is asynchronous (Promise<{ id: string }>). 
Calling params.get("id") throws TypeError: params.get is not a function.


*  2 ways to get body data
const payload = await req.json();
const body = JSON.stringify(payload);  
  // or 
const body = await req.text();


Triggering router.push() in the component render body violates React lifecycle rules and can lead to infinite re-renders or runtime warnings.
use `useEffect()` for that code