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
- exclude useCallback() - can't be called inside another callback




- updated how db is created with drizzle to refer schema and relations
- Next.js App Router dynamic route handlers, searchParams is not passed as the 2nd argument (it receives `{ params }`). searchParams will be undefined, throwing: TypeError: Cannot read properties of undefined `(reading 'get')`.
- corrected the api response,  to check success of task,  on frontend.
- Throwing a Response in Next.js causes an unhandled 500 server crash, changed it to return.
- Manage heavy network calls - add public data in clerk session, directly accessed by `auth()` to access and check.
- remove `signIn.create() `as `signIn.password()` already do that work.