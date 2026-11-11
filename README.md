This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase authentication

This project uses Google OAuth via Supabase Auth. Email/password and magic-link sign-in are intentionally not enabled.

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-or-publishable-key>"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Setup notes:

- Enable Google as an auth provider in your Supabase project
- Add your app redirect URLs in Supabase Auth settings
- The login flow redirects to `/auth/callback` and then back into the app

Routes included:

- `/auth/login` for Google sign in
- `/auth/callback` and `/auth/confirm` for auth redirects
- `/dashboard` for a protected authenticated page

## Dashboard forms

The admin dashboard includes a forms workspace with draft, active, and past form lists. New forms always start as drafts. Use the form editor to save changes or explicitly publish a form.

Apply the SQL migration in `supabase/migrations/202611110001_create_forms.sql` to the Supabase project before using the forms workspace. The table uses row-level security so authenticated users can only access their own forms; the app further restricts the workspace to `ADMIN_USER_UID`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
