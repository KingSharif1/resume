# Setting Up AI Chat

## Current Status
The AI chat is currently using **fallback/simulated responses** because:
- ❌ OpenAI API quota exceeded (Error 429)
- ⚠️ Need to add credits to your OpenAI account

## How to Fix

### 1. Get an OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in or create an account
3. Go to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (starts with `sk-...`)

### 2. Add Credits to Your Account
1. Go to [platform.openai.com/settings/organization/billing](https://platform.openai.com/settings/organization/billing)
2. Add a payment method
3. Add at least $5-10 in credits
4. The AI chat uses `gpt-3.5-turbo` which costs about $0.002 per conversation

### 3. Add API Key to Your Project
1. Open your `.env` file in the project root
2. Add this line:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Restart your dev server (`npm run dev`)

### 4. Test the AI
1. Open the resume builder
2. Click **Tailor AI** button
3. Ask a question like "How can I improve my resume?"
4. You should see:
   - ✓ **AI** badge (green) = Real AI response
   - **gpt-3.5-turbo** model name shown below the message

## What You'll See

### With Real AI
- ✅ Badge: **✓ AI** (green)
- Model: **gpt-3.5-turbo**
- Personalized, context-aware feedback

### With Fallback (No API Key)
- ⚠️ Badge: **⚠️ Fallback** (amber)
- Model: **Simulated**
- Generic template responses
- Clear warning message at the top

## Troubleshooting

### Still seeing "Fallback" after adding key?
- Make sure you restarted the dev server
- Check that the key starts with `sk-`
- Verify the key is on a new line in `.env`
- Check for typos in the variable name (`OPENAI_API_KEY`)

### Getting 401 error?
- Your API key is invalid
- Generate a new key from OpenAI dashboard

### Getting 429 error?
- You've exceeded your quota
- Add more credits to your OpenAI account
- Check your usage at platform.openai.com
