import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, cursorPosition, language } = await req.json();

    console.log('Autocomplete request:', { language, codeLength: code?.length, cursorPosition });

    // Mock AI autocomplete suggestions based on language
    const suggestions: Record<string, string[]> = {
      python: [
        "# Consider adding error handling with try/except",
        "# Add type hints for better code clarity",
        "# Use list comprehension for better performance",
        "# Consider using async/await for I/O operations",
        "# Add docstrings to document your functions",
      ],
      javascript: [
        "// Consider using const instead of let for immutable values",
        "// Add error handling with try/catch",
        "// Use async/await for better async code readability",
        "// Consider destructuring for cleaner code",
        "// Add JSDoc comments for better documentation",
      ],
      typescript: [
        "// Define an interface for better type safety",
        "// Use generics for reusable components",
        "// Add return type annotations",
        "// Consider using union types",
        "// Use readonly for immutable properties",
      ],
    };

    // Get suggestions for the language, default to python
    const languageSuggestions = suggestions[language as keyof typeof suggestions] || suggestions.python;
    
    // Return a random suggestion
    const suggestion = languageSuggestions[Math.floor(Math.random() * languageSuggestions.length)];

    return new Response(
      JSON.stringify({ suggestion }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in autocomplete function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});