# Cascade Map

Cascade Map is a single-page Next.js tool that turns a plain-English business workflow into an AI/human ownership map with an attention recapture estimate.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` and add your OpenAI key:
   ```bash
   OPENAI_API_KEY=your_key_here
   ```
3. Start the app:
   ```bash
   npm run dev
   ```

## Deploy

Deploy to Vercel, set the `OPENAI_API_KEY` environment variable in the Vercel dashboard, and configure the target subdomain as `cascade.josephvoelbel.com`.
