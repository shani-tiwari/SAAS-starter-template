'use client'

import { useAuth, useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';


export default function SignUp() {

    const router = useRouter();
    const { isSignedIn } = useAuth();
    const [verifying, setVerifying] = useState(false);
    const { signUp, errors, fetchStatus } = useSignUp();


    const handleSubmit = async (formData: FormData) => {

        const emailAddress = formData.get('email') as string;
        const password = formData.get('password') as string;

        const { error } = await signUp.password({ emailAddress, password });

        if (error) {
            console.log(error?.message);
            return;
        };

        if (!error) await signUp.verifications.sendEmailCode();
        setVerifying(true);

    };


    const handleVerify = async (formData: FormData) => {

        const code = formData.get('code') as string;
        const {error} = await signUp.verifications.verifyEmailCode({ code });
        if (error) {
            console.error(error);
            return;
        };

        if (signUp.status === 'complete') {
            await signUp.finalize({
                // Redirect the user to the home page after sign up
                navigate: () => router.push('/'), 
            })
        } else {
            // Check why the sign-up is not complete
            console.error('Sign-up attempt not complete:', signUp.status);
        };

    };

    useEffect(() => {
        if (signUp.status === 'complete' || isSignedIn) 
            return router.push('/dashboard');
    }, [isSignedIn, router, signUp.status]);


    if (verifying && signUp.status === 'missing_requirements' && 
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
                <button type="button" onClick={() => setVerifying(false)}>
                    Start over / Change email
                </button>
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

        </>
    )
}