# Vercel Environment Variables Setup

To fix the deployment issues, you need to configure the following environment variables in your Vercel project:

## Required Environment Variables

### 1. Supabase Configuration
```
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Email Service (Optional - for email notifications)
```
RESEND_API_KEY=your_resend_api_key
```

### 3. Site Configuration
```
PUBLIC_SITE_URL=https://your-domain.vercel.app
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with the appropriate value
5. Make sure to set them for "Production" environment
6. Redeploy your project

## Supabase Setup

If you haven't set up Supabase yet:

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy the Project URL and anon public key
5. Set up your database tables using the provided SQL files:
   - `supabase_setup.sql` - Initial setup
   - `supabase_cleanup.sql` - Cleanup script

## Email Service Setup (Optional)

If you want email notifications:

1. Go to [resend.com](https://resend.com)
2. Create an account and get your API key
3. Add the `RESEND_API_KEY` environment variable

## Testing

After setting up the environment variables:

1. Redeploy your project in Vercel
2. Check the Vercel function logs for any errors
3. Test the booking functionality

## Common Issues

- **Missing Supabase credentials**: Make sure both `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` are set
- **Database not initialized**: Run the SQL setup scripts in your Supabase project
- **Email not working**: Check that `RESEND_API_KEY` is set correctly
- **CORS issues**: The API routes include CORS headers, but make sure your domain is allowed
