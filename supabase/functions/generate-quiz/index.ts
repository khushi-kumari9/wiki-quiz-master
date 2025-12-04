import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    console.log("Processing Wikipedia URL:", url);

    if (!url || !url.includes('wikipedia.org')) {
      return new Response(JSON.stringify({ error: 'Please provide a valid Wikipedia URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch Wikipedia page content
    console.log("Fetching Wikipedia content...");
    const wikiResponse = await fetch(url);
    if (!wikiResponse.ok) {
      throw new Error('Failed to fetch Wikipedia page');
    }
    const htmlContent = await wikiResponse.text();

    // Extract title from HTML
    const titleMatch = htmlContent.match(/<h1[^>]*id="firstHeading"[^>]*>([^<]+)<\/h1>/);
    const title = titleMatch ? titleMatch[1].trim() : 'Unknown Title';
    console.log("Extracted title:", title);

    // Extract main content text (simplified parsing)
    const contentMatch = htmlContent.match(/<div[^>]*id="mw-content-text"[^>]*>([\s\S]*?)<\/div>\s*<div/);
    let textContent = contentMatch ? contentMatch[1] : htmlContent;
    
    // Clean HTML tags and get plain text
    textContent = textContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
      .slice(0, 15000); // Limit content for LLM

    console.log("Extracted text length:", textContent.length);

    // Generate quiz using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Based on the following Wikipedia article content about "${title}", generate a comprehensive quiz.

ARTICLE CONTENT:
${textContent}

Please respond with a valid JSON object (no markdown, no code blocks) containing:
1. "summary": A 2-3 sentence summary of the article
2. "key_entities": An object with "people" (array of person names), "organizations" (array of org names), "locations" (array of place names)
3. "sections": An array of main section topics from the article
4. "quiz": An array of 7 quiz questions, each with:
   - "question": The question text
   - "options": Array of 4 options (A, B, C, D style answers)
   - "answer": The correct answer (must match one of the options exactly)
   - "difficulty": "easy", "medium", or "hard"
   - "explanation": Brief explanation of why this is correct
5. "related_topics": Array of 4-6 related Wikipedia topics for further reading

Make questions varied in difficulty and cover different aspects of the article. Ensure all answers are factually correct based on the article content.`;

    console.log("Calling Lovable AI...");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a quiz generator. Always respond with valid JSON only, no markdown formatting or code blocks." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices?.[0]?.message?.content;
    console.log("AI response received");

    // Parse the JSON response
    let quizData;
    try {
      // Clean potential markdown code blocks
      const cleanedContent = generatedContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      quizData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.log("Raw response:", generatedContent);
      throw new Error("Failed to parse quiz data from AI response");
    }

    // Store in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const quizRecord = {
      url,
      title,
      summary: quizData.summary || "",
      key_entities: quizData.key_entities || {},
      sections: quizData.sections || [],
      quiz: quizData.quiz || [],
      related_topics: quizData.related_topics || [],
    };

    console.log("Saving to database...");
    const { data: insertedData, error: insertError } = await supabase
      .from('quizzes')
      .insert(quizRecord)
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw new Error("Failed to save quiz to database");
    }

    console.log("Quiz saved successfully with ID:", insertedData.id);

    return new Response(JSON.stringify(insertedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error("Error in generate-quiz function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
