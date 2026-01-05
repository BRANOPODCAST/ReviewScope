import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fingerprint, MessageSquare, Languages, Sparkles } from "lucide-react";
import type { PatternDiscovery } from "@/types/analysis";

interface PatternDetailsProps {
  patterns: PatternDiscovery;
}

export function PatternDetails({ patterns }: PatternDetailsProps) {
  if (!patterns) return null;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Fingerprint className="h-5 w-5 text-primary" />
          Pattern Discovery Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Linguistic Similarity Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Linguistic Similarity</span>
            <span className="text-sm font-mono text-primary">
              {patterns.linguisticSimilarityScore ?? 'N/A'}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${patterns.linguisticSimilarityScore || 0}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Higher scores indicate more similar language patterns across reviews
          </p>
        </div>

        {/* Similar Phrases */}
        {patterns.similarPhrases && patterns.similarPhrases.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Reused Phrases
            </h4>
            <div className="space-y-2">
              {patterns.similarPhrases.slice(0, 5).map((phrase, index) => (
                <div
                  key={index}
                  className="p-2 bg-muted/30 rounded-lg text-sm"
                >
                  <p className="font-mono text-xs mb-1 break-all">"{phrase.phrase}"</p>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
                    <span>Found in {phrase.frequency} reviews</span>
                    <span className="text-primary font-mono break-all">
                      #{phrase.reviewIndices.slice(0, 3).join(', #')}
                      {phrase.reviewIndices.length > 3 && '...'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emotional Patterns */}
        {patterns.emotionalPatterns && patterns.emotionalPatterns.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Emotional Patterns
            </h4>
            <div className="flex flex-wrap gap-2">
              {patterns.emotionalPatterns.map((pattern, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={
                    pattern.intensity === 'high'
                      ? 'border-risk-high/50 text-risk-high'
                      : pattern.intensity === 'medium'
                      ? 'border-risk-medium/50 text-risk-medium'
                      : 'border-border'
                  }
                >
                  {pattern.pattern}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Cross-Language Matches */}
        {patterns.crossLanguageMatches && patterns.crossLanguageMatches.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Cross-Language Matches
            </h4>
            <div className="space-y-2">
              {patterns.crossLanguageMatches.map((match, index) => (
                <div key={index} className="flex flex-wrap items-center gap-1 sm:gap-2 text-sm">
                  <span className="text-muted-foreground break-all">"{match.concept}"</span>
                  <span className="text-xs">found in</span>
                  <div className="flex flex-wrap gap-1">
                    {match.languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="text-xs">
                        {lang.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observations */}
        {patterns.observations && patterns.observations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Observations</h4>
            <ul className="space-y-1">
              {patterns.observations.map((obs, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  {obs}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
