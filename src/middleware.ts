import { clerkMiddleware } from '@clerk/nextjs/server';

// Make sure that the `/api/webhooks/(.*)` route is not protected here
export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!api/webhooks/clerk|_next/static|_next/image|favicon.ico).*)',
  ],
};