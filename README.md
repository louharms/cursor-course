# Vibe Coding with Cursor Course

## Udemy Course
Use Cursor to Vibe Code Full Stack Apps (MCP, NextJS, Supabase)

[Course + Discount Code](https://www.udemy.com/course/cursor-ai-mcp-nextjs-supabase/?couponCode=VIBE-CODE)

![image](https://github.com/user-attachments/assets/31beaa36-a61c-46f3-822f-bad91836b653)



## Demo
![image](https://github.com/user-attachments/assets/f889e3ef-deea-4790-85a2-a55c22c08899)



https://github.com/user-attachments/assets/2c2ada4e-c7ed-4176-be20-0afd63ea9b98



## Vibe Coding Workflow
![image](https://github.com/user-attachments/assets/6120ecb6-5be2-4bcb-9b63-7389051621fd)


# Setup Guide (10min)

## Project Setup
1. Fork the course repository on GitHub [here](0https://github.com/shawnesquivel/cursor-course) 

2. Clone the repository

```
git clone HTTPS_URL
```

1. Populate ANTHROPIC_API_KEY and OPENAI_API_KEY.
- In the root directory, rename `.env.example` and rename as `.env` 

2. Get your OPENAI_API_KEY
- Populate `supabase/functions/.env`


3. Setup Task Master in MCP settings [Task Master AI](https://github.com/eyaltoledano/claude-task-master?tab=readme-ov-file)

4. Go through the Task Master Setup above.

## Backend Setup
1. Download Docker according to your system [Docker](https://docs.docker.com/get-started/get-docker/)

2. Download the Supabase CLI [Supabase CLI Install](https://supabase.com/docs/guides/local-development/cli/getting-started)

3. Add OpenAI Keys: In the `supabase` folder, rename `supabase/functions/.env.example` and rename as `.env` [Get OpenAI Keys](http://platform.openai.com/account/)



4. Start Supabase
```
npx supabase start
```
Note: If you change your `supabase/functions/.env` file locally, then you'll need to restart `npx supabase stop && npx supabase start`

5. Update your NextJS app `.env.local` file
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=ey...
```

6. Serve Functions Locally
```
npx supabase functions serve --import-map ./supabase/functions/import_map.json
```

7.  Call the `hello-world` edge function.
```
  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/hello-world' \
    --header 'Authorization: Bearer SUPABASE_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'
```






Instructions
- Rename .env.example to .env in `supabase/functions/.env` and add your OPENAI_API_KEY
