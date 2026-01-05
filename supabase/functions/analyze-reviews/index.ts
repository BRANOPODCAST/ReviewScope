import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Review {
  id: string;
  content: string;
  rating?: number;
  review_date?: string;
  language?: string;
}

interface PreprocessedReview extends Review {
  normalizedContent: string;
  detectedLanguage: string;
  wordCount: number;
  hasDate: boolean;
}

// ============================================
// STAGE 0: PREPROCESSING
// Normalize reviews, group by language, attach metadata
// ============================================
function preprocessReviews(reviews: Review[]): PreprocessedReview[] {
  console.log(`[Stage 0] Preprocessing ${reviews.length} reviews...`);
  
  // Limit to max 50 reviews
  const limitedReviews = reviews.slice(0, 50);
  
  return limitedReviews.map((review, index) => {
    // Normalize content: trim, collapse whitespace
    const normalizedContent = review.content
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
    
    // Simple language detection heuristic (would use proper detection in production)
    const detectedLanguage = review.language || detectLanguage(review.content);
    
    return {
      ...review,
      id: review.id || `review-${index}`,
      normalizedContent,
      detectedLanguage,
      wordCount: normalizedContent.split(' ').length,
      hasDate: !!review.review_date,
    };
  });
}

function detectLanguage(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Comprehensive word lists for better detection
  const englishWords = /\b(the|and|is|are|was|were|have|has|this|that|with|for|you|your|my|our|will|would|could|should|can|not|but|very|just|been|being|more|some|also|than|only|into|about|from|they|them|their|we|us|it|its|an|a|of|to|in|on|at|great|good|best|love|excellent|amazing|product|quality|recommend|buy|bought|ordered|shipping|delivery)\b/gi;
  const germanWords = /\b(der|die|das|und|ist|sind|war|waren|habe|haben|ein|eine|nicht|auch|noch|mit|bei|sich|auf|für|oder|aber|nach|wenn|nur|schon|sehr|gut|produkt|qualität)\b/gi;
  const frenchWords = /\b(le|la|les|et|est|sont|un|une|de|du|des|que|qui|dans|pour|sur|avec|ce|cette|pas|plus|tout|très|bien|mais|comme|aussi|produit|qualité)\b/gi;
  const spanishWords = /\b(el|la|los|las|es|son|un|una|de|del|que|para|por|con|en|no|muy|pero|como|más|todo|esta|este|bien|si|ya|producto|calidad|excelente)\b/gi;
  
  // Count matches for each language
  const englishMatches = (lowerText.match(englishWords) || []).length;
  const germanMatches = (lowerText.match(germanWords) || []).length;
  const frenchMatches = (lowerText.match(frenchWords) || []).length;
  const spanishMatches = (lowerText.match(spanishWords) || []).length;
  
  const maxMatches = Math.max(englishMatches, germanMatches, frenchMatches, spanishMatches);
  
  // Default to English if no clear match (most reviews are in English)
  if (maxMatches === 0) return 'en';
  if (germanMatches === maxMatches && germanMatches > englishMatches) return 'de';
  if (frenchMatches === maxMatches && frenchMatches > englishMatches) return 'fr';
  if (spanishMatches === maxMatches && spanishMatches > englishMatches) return 'es';
  
  return 'en';
}

// ============================================
// STAGE 1: PATTERN DISCOVERY (Gemini 3 Call #1)
// Detect linguistic similarity, emotional patterns, template phrases
// ============================================
async function analyzePatterns(reviews: PreprocessedReview[], apiKey: string): Promise<any> {
  console.log(`[Stage 1] Pattern Discovery - Calling Gemini 3...`);
  
  const prompt = `You are an expert linguistic analyst. Analyze the following ${reviews.length} reviews for patterns that may indicate coordinated reviewing behavior.

IMPORTANT: Do NOT label any review as "fake" or "fraudulent". Focus only on detecting patterns.

Reviews to analyze:
${reviews.map((r, i) => `[${i + 1}] Rating: ${r.rating || 'N/A'} | Language: ${r.detectedLanguage} | Words: ${r.wordCount}
"${r.content.substring(0, 500)}${r.content.length > 500 ? '...' : ''}"`).join('\n\n')}

Analyze for:
1. Linguistic similarity between reviews (similar sentence structures, word choices)
2. Emotional exaggeration patterns (hyperbolic language, unusual enthusiasm/negativity)
3. Template-like phrasing (cookie-cutter language, repetitive structures)
4. Cross-language content reuse (same message translated)

Return ONLY a valid JSON object with this structure:
{
  "linguisticSimilarityScore": <0-100>,
  "similarPhrases": [{"phrase": "...", "reviewIndices": [1,2,3], "frequency": 3}],
  "emotionalPatterns": [{"pattern": "...", "reviewIndices": [1,2], "intensity": "low|medium|high"}],
  "templateIndicators": [{"indicator": "...", "reviewIndices": [1,2]}],
  "crossLanguageMatches": [{"concept": "...", "languages": ["en", "de"], "reviewIndices": [1,5]}],
  "observations": ["observation 1", "observation 2"]
}`;

  const response = await callGemini(prompt, apiKey);
  return parseJsonResponse(response, "patternDiscovery");
}

// ============================================
// STAGE 2: COORDINATION ANALYSIS (Gemini 3 Call #2)
// Analyze timing patterns, rating mismatches, suspicious bursts
// ============================================
async function analyzeCoordination(
  reviews: PreprocessedReview[], 
  patternResults: any,
  apiKey: string
): Promise<any> {
  console.log(`[Stage 2] Coordination Analysis - Calling Gemini 3...`);
  
  // Prepare timing data
  const reviewsWithDates = reviews.filter(r => r.review_date);
  const timingData = reviewsWithDates.map(r => ({
    index: reviews.indexOf(r) + 1,
    date: r.review_date,
    rating: r.rating
  }));

  const prompt = `You are an expert in detecting coordinated online behavior. Analyze these reviews for coordination signals.

Reviews (${reviews.length} total):
${reviews.map((r, i) => `[${i + 1}] Rating: ${r.rating || 'N/A'} | Date: ${r.review_date || 'Unknown'} | Words: ${r.wordCount}
"${r.content.substring(0, 300)}..."`).join('\n\n')}

Previous pattern analysis found:
- Linguistic similarity score: ${patternResults.linguisticSimilarityScore || 'N/A'}
- Similar phrases found: ${patternResults.similarPhrases?.length || 0}
- Template indicators: ${patternResults.templateIndicators?.length || 0}

Timing data available: ${JSON.stringify(timingData)}

Analyze for:
1. Timing patterns (bursts of reviews in short periods)
2. Rating-text mismatches (positive text with low rating or vice versa)
3. Suspicious review bursts (many similar reviews in quick succession)
4. Group reviews into possible coordination clusters

IMPORTANT: Use probabilistic language. Do not make accusations.

Return ONLY a valid JSON object:
{
  "timingAnalysis": {
    "burstsPeriods": [{"startDate": "...", "endDate": "...", "count": 5}],
    "distributionScore": <0-100 where 100 is perfectly even distribution>,
    "suspiciousTiming": true|false
  },
  "ratingMismatches": [{"reviewIndex": 1, "rating": 5, "sentimentDetected": "negative", "mismatchSeverity": "low|medium|high"}],
  "clusters": [
    {
      "clusterId": 1,
      "reviewIndices": [1, 3, 7],
      "commonCharacteristics": ["similar phrasing", "posted same day"],
      "coordinationLikelihood": "low|medium|high"
    }
  ],
  "coordinationSignals": ["signal 1", "signal 2"]
}`;

  const response = await callGemini(prompt, apiKey);
  return parseJsonResponse(response, "coordinationAnalysis");
}

// ============================================
// STAGE 3: INTEGRITY ASSESSMENT (Gemini 3 Call #3)
// Synthesize findings, assign manipulation band, generate explanation
// ============================================
async function assessIntegrity(
  reviews: PreprocessedReview[],
  patternResults: any,
  coordinationResults: any,
  apiKey: string
): Promise<any> {
  console.log(`[Stage 3] Integrity Assessment - Calling Gemini 3...`);

  const prompt = `You are an expert integrity analyst. Synthesize the following analysis results and provide a final assessment.

CRITICAL GUIDELINES:
- Do NOT claim any review is "fake" or "fraudulent"
- Use probabilistic, cautious language
- Focus on patterns and signals, not accusations
- Explicitly mention uncertainty and limitations
- Provide educational context about what these signals may or may not indicate

Number of reviews analyzed: ${reviews.length}

PATTERN DISCOVERY RESULTS:
${JSON.stringify(patternResults, null, 2)}

COORDINATION ANALYSIS RESULTS:
${JSON.stringify(coordinationResults, null, 2)}

Based on all evidence, provide:
1. Overall Manipulation Likelihood Band (Low, Medium, or High)
2. Key signals detected (most important findings)
3. A careful, non-accusatory explanation
4. Confidence level and limitations

Return ONLY a valid JSON object:
{
  "manipulationBand": "Low|Medium|High",
  "bandRationale": "Explanation for the band assignment",
  "keySignals": [
    {"signal": "Description of signal", "significance": "low|medium|high", "affectedReviews": [1, 2, 3]}
  ],
  "confidenceExplanation": "A 2-3 sentence explanation of confidence level and key uncertainties",
  "limitations": ["limitation 1", "limitation 2"],
  "recommendations": ["recommendation for further analysis or context"],
  "overallAssessment": "A balanced 3-4 sentence summary that acknowledges both concerning patterns and alternative explanations"
}`;

  const response = await callGemini(prompt, apiKey);
  return parseJsonResponse(response, "integrityAssessment");
}

// Helper: Call Gemini 3 via Lovable AI Gateway
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  console.log(`Calling Gemini 3 (google/gemini-3-pro-preview)...`);
  
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-pro-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert analyst specializing in review integrity assessment. Always respond with valid JSON only. Never accuse reviews of being fake - focus on patterns and signals."
        },
        { role: "user", content: prompt }
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gemini API error: ${response.status} - ${errorText}`);
    
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    if (response.status === 402) {
      throw new Error("AI credits exhausted. Please add credits to continue.");
    }
    throw new Error(`AI analysis failed: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// Helper: Parse JSON from model response
function parseJsonResponse(response: string, stage: string): any {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    console.error(`[${stage}] Could not find JSON in response:`, response.substring(0, 200));
    return { error: "Failed to parse AI response", raw: response.substring(0, 500) };
  } catch (e) {
    console.error(`[${stage}] JSON parse error:`, e);
    return { error: "Failed to parse AI response", raw: response.substring(0, 500) };
  }
}

// Helper: Build timeline data for visualization
function buildTimelineData(reviews: PreprocessedReview[]): any[] {
  const reviewsWithDates = reviews.filter(r => r.review_date);
  
  // Group by date
  const dateGroups: Record<string, number> = {};
  reviewsWithDates.forEach(r => {
    const date = r.review_date!.split('T')[0];
    dateGroups[date] = (dateGroups[date] || 0) + 1;
  });
  
  return Object.entries(dateGroups)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ============================================
// RATE LIMITING (IP-based for public access)
// Prevents abuse by limiting requests per IP
// ============================================
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 20; // 20 analyses per hour per IP

function checkRateLimit(clientId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(clientId);
  
  if (!record || now > record.resetTime) {
    // New window - allow and set up tracking
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    // Rate limit exceeded
    return { 
      allowed: false, 
      remaining: 0, 
      resetIn: record.resetTime - now 
    };
  }
  
  // Increment and allow
  record.count++;
  return { 
    allowed: true, 
    remaining: MAX_REQUESTS_PER_WINDOW - record.count, 
    resetIn: record.resetTime - now 
  };
}

// Helper: Get client IP for rate limiting
function getClientIP(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  // Fallback to a hash of user-agent
  const ua = req.headers.get('user-agent') || 'unknown';
  return `ua-${ua.substring(0, 50)}`;
}

// Helper: Validate UUID format
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Main handler
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // IP-based rate limiting
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP);
    console.log(`[Rate Limit] IP: ${clientIP.substring(0, 20)}... - Allowed: ${rateLimit.allowed}, Remaining: ${rateLimit.remaining}`);
    
    if (!rateLimit.allowed) {
      const resetMinutes = Math.ceil(rateLimit.resetIn / 60000);
      console.warn(`[Rate Limit] Blocked request from IP ${clientIP.substring(0, 20)}...`);
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded",
          message: `Too many analysis requests. Please try again in ${resetMinutes} minutes.`,
          retryAfter: Math.ceil(rateLimit.resetIn / 1000)
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil(rateLimit.resetIn / 1000))
          } 
        }
      );
    }

    const { reviews, batchId } = await req.json();
    
    // Input validation
    if (!reviews || !Array.isArray(reviews)) {
      return new Response(
        JSON.stringify({ error: "Reviews must be an array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (reviews.length === 0 || reviews.length > 50) {
      return new Response(
        JSON.stringify({ error: "Provide 1-50 reviews" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate each review
    for (const review of reviews) {
      if (!review.content || typeof review.content !== 'string') {
        return new Response(
          JSON.stringify({ error: "Invalid review format - content must be a string" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (review.content.length > 5000) {
        return new Response(
          JSON.stringify({ error: "Review too long (max 5000 characters)" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate batchId format
    if (!batchId || typeof batchId !== 'string' || !isValidUUID(batchId)) {
      return new Response(
        JSON.stringify({ error: "Invalid batch ID format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting analysis for batch ${batchId} with ${reviews.length} reviews`);

    // STAGE 0: Preprocessing
    const preprocessedReviews = preprocessReviews(reviews);
    console.log(`[Stage 0] Preprocessed ${preprocessedReviews.length} reviews`);

    // STAGE 1: Pattern Discovery
    const patternResults = await analyzePatterns(preprocessedReviews, LOVABLE_API_KEY);
    console.log(`[Stage 1] Pattern discovery complete`);

    // STAGE 2: Coordination Analysis
    const coordinationResults = await analyzeCoordination(
      preprocessedReviews, 
      patternResults, 
      LOVABLE_API_KEY
    );
    console.log(`[Stage 2] Coordination analysis complete`);

    // STAGE 3: Integrity Assessment
    const integrityResults = await assessIntegrity(
      preprocessedReviews,
      patternResults,
      coordinationResults,
      LOVABLE_API_KEY
    );
    console.log(`[Stage 3] Integrity assessment complete`);

    // Build timeline data
    const timelineData = buildTimelineData(preprocessedReviews);

    // Compile final results
    const results = {
      batchId,
      reviewCount: preprocessedReviews.length,
      stages: {
        preprocessing: {
          reviewCount: preprocessedReviews.length,
          languages: [...new Set(preprocessedReviews.map(r => r.detectedLanguage))],
          averageWordCount: Math.round(
            preprocessedReviews.reduce((sum, r) => sum + r.wordCount, 0) / preprocessedReviews.length
          ),
        },
        patternDiscovery: patternResults,
        coordinationAnalysis: coordinationResults,
        integrityAssessment: integrityResults,
      },
      summary: {
        manipulationBand: integrityResults.manipulationBand || "Unknown",
        keySignals: integrityResults.keySignals || [],
        confidenceExplanation: integrityResults.confidenceExplanation || "",
        clusters: coordinationResults.clusters || [],
        timelineData,
      },
    };

    console.log(`Analysis complete for batch ${batchId}. Band: ${results.summary.manipulationBand}`);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const errorMessage = error instanceof Error ? error.message : "Analysis failed";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
