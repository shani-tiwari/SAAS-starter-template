'use client'

import { useSignIn } from '@clerk/nextjs'
import Link from 'next/link';
import { useRouter } from 'next/navigation'

export default function Page() {

  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();


  const handleSubmit = async (formData: FormData) => {

    const emailAddress = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn.password({ emailAddress, password });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    };

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: () => router.push('/dashboard'),
      });
    } else if (signIn.status === 'needs_second_factor') {
      // Handle MFA
    } else if (signIn.status === 'needs_client_trust') {
      // Handle client trust
    } else {
      console.error('Sign-in not complete:', signIn.status);
    }

};


  const handleVerify = async (formData: FormData) => {
    const code = formData.get('code') as string

    await signIn.mfa.verifyEmailCode({ code })

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {

          const url = decorateUrl('/')
          if (url.startsWith('http')) {
            window.location.href = url
          } else {
            router.push(url)
          }
        },
      })
    } else {
      // Check why the sign-in is not complete
      console.error('Sign-in attempt not complete:', signIn)
    }
  }

  if (signIn.status === 'needs_client_trust') {
    return (
      <>
        <h1>Verify your account</h1>
        <form action={handleVerify}>
          <div>
            <label htmlFor="code">Code</label>
            <input id="code" name="code" type="text" />
            {errors.fields.code && <p>{errors.fields.code.message}</p>}
          </div>
          <button type="submit" disabled={fetchStatus === 'fetching'}>
            Verify
          </button>
        </form>
        <button onClick={() => signIn.mfa.sendEmailCode()}>I need a new code</button>
        <button onClick={() => signIn.reset()}>Start over</button>
      </>
    )
  };

  return (
    <>
      <h1>Sign in</h1>
      <form action={handleSubmit}>
        <div>
          <label htmlFor="email">Enter email address</label>
          <input id="email" name="email" type="email" />
          {errors.fields.identifier && <p>{errors.fields.identifier.message}</p>}
        </div>
        <div>
          <label htmlFor="password">Enter password</label>
          <input id="password" name="password" type="password" />
          {errors.fields.password && <p>{errors.fields.password.message}</p>}
        </div>
        <button type="submit" disabled={fetchStatus === 'fetching'}>
          Continue
        </button>

        {/* You can just console.log errors, but we put them in the UI for convenience */}
        {errors && <p>
          {/* {JSON.stringify(errors, null, 2)} */}
          {/* Invalid credential  */}
        </p>}

        <div>
          <p>Create your <Link className="text-blue-500 underline" href="/sign-up">Account</Link></p>
        </div>

      </form>
    </>
  )
}