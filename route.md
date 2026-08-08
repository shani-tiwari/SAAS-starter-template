before every route hitting 

import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { isAuthenticated, has } = await auth()
  
  if (!isAuthenticated) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  if (!has({ role: 'admin' })) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  return Response.json({ message: 'Admin access granted' })
}