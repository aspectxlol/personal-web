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

### Local UI preview without signing in

For local development only, set `DEV_AUTH_BYPASS=true` in `.env.local` and restart
the development server. The preview is enabled only when `NODE_ENV` is
`development`; it is always disabled in production.

The dashboard uses demo data at `/dashboard/forms`, with a sample editor at
`/form/dev-preview/edit` and a sample response page at `/form/dev-preview`.
Preview changes stay in the current page; creating, saving, and publishing
forms are disabled. The preview does not read or write Supabase data, and the
forms API remains protected by normal authentication.

## Dashboard forms

The admin dashboard includes a forms workspace with draft and active forms. New forms always start as drafts. Use the form editor to save changes or explicitly publish a form.

Apply all SQL migrations in `supabase/migrations` in filename order before using the forms workspace and public response pages. Public forms are available at `/form/<slug>` only while published and accepting responses. Form titles, descriptions, section headings, and question labels support safe GitHub-flavored Markdown; raw HTML is not rendered.

The database policies expose only published form data and validate response inserts. Response records stay private to the form owner, and one-response-per-account forms require sign-in.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
