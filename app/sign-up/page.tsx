'use client'

import { useAuth, useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function SignUp() {

    const { signUp, errors, fetchStatus } = useSignUp()
    const { isSignedIn } = useAuth()
    const router = useRouter()


    const handleSubmit = async (formData: FormData) => {

        const emailAddress = formData.get('email') as string
        const password = formData.get('password') as string

        const { error } = await signUp.password({
            emailAddress,
            password,
        })
        if (error) {
            // for more info on error handling
            console.error(JSON.stringify(error, null, 2))
            return
        }

        if (!error) await signUp.verifications.sendEmailCode()
    };


    const handleVerify = async (formData: FormData) => {
        const code = formData.get('code') as string

        await signUp.verifications.verifyEmailCode({
            code,
        })
        if (signUp.status === 'complete') {
            await signUp.finalize({
                // Redirect the user to the home page after signing up
                navigate: ({ session, decorateUrl }) => {
                    // Handle session tasks
                    if (session?.currentTask) {
                        console.log(session?.currentTask)
                        return
                    }

                    // If no session tasks, navigate the signed-in user to the home page
                    const url = decorateUrl('/')
                    if (url.startsWith('http')) {
                        window.location.href = url
                    } else {
                        router.push(url)
                    }
                },
            })
        } else {
            // Check why the sign-up is not complete
            console.error('Sign-up attempt not complete:', signUp)
        }
    };



    if (signUp.status === 'complete' || isSignedIn) {
        return null
    }

    if (signUp.status === 'missing_requirements' &&
        signUp.unverifiedFields.includes('email_address') &&
        signUp.missingFields.length === 0
    ) {
        return (
            <>
                <h1>Verify your account</h1>
                <form action={handleVerify}>
                    <div>
                        <label htmlFor="code">Code</label>
                        <input id="code" name="code" type="text" />
                    </div>
                    {errors.fields.code && <p>{errors.fields.code.message}</p>}
                    <button type="submit" disabled={fetchStatus === 'fetching'}>
                        Verify
                    </button>
                </form>
                <button onClick={() => signUp.verifications.sendEmailCode()}>I need a new code</button>
            </>
        )
    }

    return (
        <>
            <h1>Sign up</h1>
            <form action={handleSubmit}>
                <div>
                    <label htmlFor="email">Enter email address</label>
                    <input id="email" type="email" name="email" />
                    {errors.fields.emailAddress && <p>{errors.fields.emailAddress.message}</p>}
                </div>
                <div>
                    <label htmlFor="password">Enter password</label>
                    <input id="password" type="password" name="password" />
                    {errors.fields.password && <p>{errors.fields.password.message}</p>}
                </div>
                <button type="submit" disabled={fetchStatus === 'fetching'}>
                    Continue
                </button>
            </form>
            {/* For your debugging purposes. You can just console.log errors, but we put them in the UI for convenience */}
            {errors && <p>{JSON.stringify(errors, null, 2)}</p>}

            {/* Required for sign-up flows. Clerk's bot sign-up protection is enabled by default */}
            <div id="clerk-captcha" />
        </>
    )
}