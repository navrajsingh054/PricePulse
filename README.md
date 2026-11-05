# PricePulse -- Smart Product Price Tracker

PricePulse is a full-stack product price-tracking application that helps
users monitor products across e-commerce websites, view price history,
and receive email alerts when prices drop.

Built with Next.js, Supabase, Firecrawl, Resend, and Vercel.

## Features

-   **Track products:** Add product URLs from supported e-commerce
    websites.
-   **Automatic product extraction:** Firecrawl extracts product names,
    current prices, currencies, and product images.
-   **Price history:** Store price changes and visualize price trends
    with interactive charts.
-   **Google authentication:** Sign in securely using Google OAuth
    through Supabase.
-   **Automated price checks:** Vercel Cron invokes the protected
    price-check API on a daily schedule.
-   **Email alerts:** Resend sends an email when a tracked product's
    price decreases.

## Tech Stack

-   **Next.js 16** -- React framework with App Router
-   **React** -- User interface
-   **Tailwind CSS** -- Styling
-   **shadcn/ui** -- UI components
-   **Recharts** -- Price-history charts
-   **Supabase** -- PostgreSQL database, authentication, and Row Level
    Security
-   **Firecrawl** -- Product-page scraping and structured data
    extraction
-   **Resend** -- Price-drop email notifications
-   **Vercel** -- Hosting and scheduled Cron Jobs

## How It Works

### Adding a product

1.  A user submits an e-commerce product URL.
2.  The application sends the URL to Firecrawl.
3.  Firecrawl extracts the product name, current price, currency, and
    image URL when available.
4.  The product is stored in Supabase and displayed in the user's
    dashboard.

### Automatic price checking

1.  Vercel Cron invokes `/api/cron/check-prices` according to the
    schedule in `vercel.json`.
2.  The endpoint checks the `Authorization` header against
    `CRON_SECRET`.
3.  The server uses the Supabase service-role key to retrieve tracked
    products.
4.  Firecrawl checks each product URL and extracts the latest product
    information.
5.  The application updates the product record in Supabase.
6.  When the price changes, a new entry is added to `price_history`.
7.  When the new price is lower than the previous price, the application
    attempts to send an email alert through Resend.

## Getting Started

### Prerequisites

-   Node.js and npm
-   A Supabase project
-   A Firecrawl account and API key
-   A Resend account and API key
-   Google OAuth credentials
-   A Vercel account for deployment and Cron Jobs

### 1. Clone the repository

``` bash
git clone https://github.com/navrajsingh054/PricePulse.git
cd PricePulse
npm install
```

### 2. Configure Supabase

1.  Create a project in [Supabase](https://supabase.com).
2.  In the Supabase SQL Editor, create the application tables and
    policies.
3.  Enable Google as an authentication provider under **Authentication →
    Providers**.
4.  Add your Google OAuth Client ID and Client Secret to the Supabase
    Google provider configuration.
5.  Configure the Supabase authentication URL settings so your local and
    deployed application URLs are allowed.

The application uses two tables:

-   `products` -- stores each user's tracked products and their current
    product details.
-   `price_history` -- stores price observations associated with a
    product.

Enable Row Level Security (RLS). Users should only be able to access
their own products and the price history belonging to those products.
The server-side cron route uses the service-role key for its
administrative product-checking work; never expose that key in
browser-side code.

### 3. Configure Google OAuth

In Google Cloud Console, create OAuth credentials and configure the
authorized redirect URI shown in your Supabase Google provider settings.
The URI normally follows this pattern:

``` text
https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
```

Use the exact callback URI displayed by your Supabase project. Add your
local and production application URLs to the appropriate Supabase
redirect URL allowlist.

### 4. Configure environment variables

Create a `.env.local` file in the project root:

``` env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Firecrawl
FIRECRAWL_API_KEY=your_firecrawl_api_key

# Resend
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_verified_sender_email

# Cron security
CRON_SECRET=your_long_random_secret

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Use the variable names expected by the application. Add the same
required variables to the Vercel project for the Production environment,
and set `NEXT_PUBLIC_APP_URL` to your deployed application URL.

**Security notes:** - Do not commit `.env.local` to Git. - Never expose
`SUPABASE_SERVICE_ROLE_KEY`, `FIRECRAWL_API_KEY`, `RESEND_API_KEY`, or
`CRON_SECRET` in client-side code. - Do not share secret values in
screenshots, issues, or public repositories.

### 5. Run locally

``` bash
npm run dev
```

Open <http://localhost:3000>.

## Deployment

### Deploy with Vercel

1.  Push the project to your GitHub repository.
2.  Import the repository into [Vercel](https://vercel.com).
3.  Add the required environment variables in **Project Settings →
    Environment Variables**.
4.  Deploy the project to Production.
5.  Confirm that the Cron Job is registered and Active in **Project
    Settings → Cron Jobs**.

### Cron schedule

The project uses the `vercel.json` configuration:

``` json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/cron/check-prices",
      "schedule": "0 5 * * *"
    }
  ]
}
```

The schedule is **05:00 UTC daily (10:30 AM India Standard Time)**. On
Vercel Hobby, cron execution timing may have up to 59 minutes of
scheduling flexibility. Check Vercel's current plan limits for the
latest details.

Vercel Cron sends a `GET` request to the configured route. The route
must validate the cron authorization header using the configured
`CRON_SECRET`.

## Testing the Price-Check Endpoint

The production endpoint is protected. A request without the correct
authorization header should return `401 Unauthorized`.

You can manually test it from PowerShell:

``` powershell
$headers = @{
  Authorization = "Bearer YOUR_CRON_SECRET"
}

Invoke-RestMethod `
  -Uri "https://pricepulsehere.vercel.app/api/cron/check-prices" `
  -Method POST `
  -Headers $headers
```

Replace the URL with your deployed application URL and use your own
`CRON_SECRET`. Do not publish the secret.

A successful response includes a summary such as the number of products
processed, updated, failed, price changes detected, and alerts sent.

## Project Structure

``` text
PricePulse/
├── app/
│   ├── api/
│   │   └── cron/
│   │       └── check-prices/
│   │           └── route.js       # Protected scheduled price-check endpoint
│   ├── auth/
│   │   └── callback/
│   │       └── route.js           # OAuth callback handler
│   ├── actions.js                 # Server actions
│   └── page.js                    # Main application page
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── AddProductForm.js
│   ├── ProductCard.js
│   ├── PriceChart.js
│   └── AuthModal.js
├── lib/
│   ├── email.js                   # Resend email integration
│   ├── firecrawl.js               # Firecrawl integration
│   └── utils.js
├── utils/
│   └── supabase/
│       ├── client.js
│       └── server.js
├── vercel.json                    # Vercel Cron configuration
└── .env.local                     # Local environment variables (not committed)
```

This is an indicative overview; your repository may contain additional
files and folders.

## Troubleshooting

### Product extraction fails

-   Confirm that `FIRECRAWL_API_KEY` is configured correctly.
-   Some e-commerce websites may block automated access or change their
    page structure.
-   Check the Firecrawl dashboard and the application logs for errors.

### Products are not updated by the scheduled job

-   Confirm the Cron Job is Active in Vercel Project Settings.
-   Confirm that `CRON_SECRET` is configured in the Vercel Production
    environment.
-   Confirm that `SUPABASE_SERVICE_ROLE_KEY` and
    `NEXT_PUBLIC_SUPABASE_URL` are configured.
-   Review the function logs available on your Vercel plan.

### Email alerts are not received

-   Confirm `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
-   Make sure the sender address is permitted by your Resend account.
-   Check the Resend dashboard for delivery or rejection details.
-   An alert is only attempted when the newly scraped price is lower
    than the previously stored price.

## Future Improvements

Potential future enhancements include additional retailer support,
configurable target-price alerts, more detailed price analytics, and
notification preferences.

## License

Add the license that applies to this repository before distributing or
accepting contributions.

------------------------------------------------------------------------

Built with ❤️ by **Navraj Singh** using Next.js, Supabase, Firecrawl,
and Resend.
