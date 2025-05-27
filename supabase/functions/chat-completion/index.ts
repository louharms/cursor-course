// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Import from import_map.json instead of direct URLs
import OpenAI from "openai";

console.log("Hello from Functions!");

// Enable CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Use Deno.serve instead of serve
Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { messages } = await req.json();

    // Validate message format
    if (
      !Array.isArray(messages) ||
      !messages.every(
        (m) =>
          typeof m === "object" &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
    ) {
      throw new Error("Invalid message format");
    }

    // Get API key from environment variables
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    // Create a text encoder for the stream
    const encoder = new TextEncoder();

    // Create a TransformStream for streaming the response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start the OpenAI streaming request
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages,
      stream: true,
    });

    // Process the stream in the background
    (async () => {
      try {
        for await (const chunk of completion) {
          // Get the content delta
          const content = chunk.choices[0]?.delta?.content || "";

          if (content) {
            // Send each token immediately as a separate SSE event
            // This ensures the client receives each token as soon as it's available
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
            );
          }
        }

        // Close the stream when done
        await writer.write(encoder.encode("data: [DONE]\n\n"));
        await writer.close();
      } catch (error) {
        // Handle any errors during streaming
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
        );
        await writer.close();
      }
    })();

    // Return the streaming response
    return new Response(stream.readable, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    // Handle any other errors
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});

/* To invoke locally:

  1. Run `npx supabase functions serve --import-map ./supabase/functions/import_map.json` from your project root
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/chat-completion' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"messages":[{"role":"user","content":"Hello, how are you?"}]}'

  Use with frontend:
  ```javascript
  async function fetchChatCompletion(messages) {
    const response = await fetch('http://127.0.0.1:54321/functions/v1/chat-completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
      },
      body: JSON.stringify({ messages }),
    });

    // For streaming responses, handle the stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      // Process each event in the chunk
      for (const line of chunk.split('\n')) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          const data = JSON.parse(line.substring(6));
          console.log(data.content); // Process content
        }
      }
    }
  }
  ```
*/
