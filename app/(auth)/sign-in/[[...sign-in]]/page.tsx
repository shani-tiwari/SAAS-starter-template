'use client'

import { useSignIn } from '@clerk/nextjs'
import Link from 'next/link';
import { useRouter } from 'next/navigation'

export default function Page() {

  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  // console.log(errors)

  const handleSubmit = async (formData: FormData) => {

    const emailAddress = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await signIn.password({
      emailAddress,
      password,
    })

    if (error && errors) {
      console.log('error is from here only')
      console.error(JSON.stringify(error, null, 2))
      return;
    }

    try {
        await signIn.create({
            identifier: emailAddress, password
        });
        if(signIn.status === 'complete'){
          router.push('/dashboard');
            // await signIn.finalize({
            //     navigate: ({ decorateUrl }) => {
            //         const url = decorateUrl('/');
            //         if(url.startsWith('http')){
            //             window.location.href = url
            //         }else{
            //             router.push(url)
            //         }
            //     }
            // }); 
        }
        else if (signIn.status === 'needs_second_factor') {
        } else if (signIn.status === 'needs_client_trust') {
        // For other second factor strategies,
        const emailCodeFactor = signIn.supportedSecondFactors.find(
            (factor) => factor.strategy === 'email_code',
        )

        if (emailCodeFactor) {
            await signIn.mfa.sendEmailCode()
        }
        } else {
        // Check why the sign-in is not complete
        console.error('Sign-in attempt not complete:', signIn)
        }
    }catch(error){
        console.error('Error in signIn:', error);
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
          {/* {errors.fields.identifier && <p>{errors.fields.identifier.message}</p>} */}
        </div>
        <div>
          <label htmlFor="password">Enter password</label>
          <input id="password" name="password" type="password" />
          {/* {errors.fields.password && <p>{errors.fields.password.message}</p>} */}
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