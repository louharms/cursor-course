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
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      throw new Error("Missing or invalid prompt parameter");
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

    // Call OpenAI to generate an image
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
    });

    // The API returns base64-encoded image data
    const imageBase64 = response.data[0].b64_json;

    if (!imageBase64) {
      throw new Error("Failed to generate image");
    }

    // Return the base64 data
    return new Response(
      JSON.stringify({ imageUrl: `data:image/png;base64,${imageBase64}` }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    // Handle any errors
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/image-generation' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"prompt":"A beautiful mountain landscape with a sunset"}'

  Use with frontend:
  ```javascript
  async function generateImage(prompt) {
    const response = await fetch('http://127.0.0.1:54321/functions/v1/image-generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY'
      },
      body: JSON.stringify({ prompt }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Error generating image:', data.error);
      return null;
    }
    
    return data.imageUrl; // URL to the generated image
  }
  ```
*/
