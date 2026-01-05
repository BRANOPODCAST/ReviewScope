import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, FileText, Zap } from "lucide-react";
import type { Review } from "@/types/analysis";

interface ReviewInputProps {
  onAnalyze: (reviews: Review[], batchName?: string) => void;
  isLoading: boolean;
}

const SAMPLE_REVIEWS = `Rating: 5/5 | 2026-01-03
Great product! Exactly what I needed. Fast shipping and excellent quality. Would definitely recommend to anyone looking for this type of item.

Rating: 5/5 | 2026-01-03
Absolut fantastisch! Der beste Kauf, den ich dieses Jahr gemacht habe. Die Liebe zum Detail ist bemerkenswert. Schnelle Lieferung!

Rating: 4/5 | 2026-01-02
I was skeptical at first but this exceeded my expectations! The build quality is amazing and customer service was very responsive when I had questions.

Rating: 5/5 | 2026-01-03
Produit excellent! Qualité incroyable et livraison rapide. Je recommande vivement à tous mes amis et ma famille. Très satisfait!

Rating: 5/5 | 2026-01-03
This product changed my life! I can't believe how good it is. Everyone should buy this immediately! Best purchase ever!

Rating: 5/5 | 2026-01-03
¡Excelente calidad! El mejor producto que he comprado. La atención al cliente fue muy buena y el envío fue rápido. Muy recomendable!

Rating: 5/5 | 2026-01-03
Amazing quality, fast delivery, great customer service! Will buy again! This is exactly what I was looking for!

Rating: 5/5 | 2026-01-03
Das Produkt ist genau wie beschrieben. Sehr zufrieden mit dem Kauf. Würde es wieder kaufen. Tolle Qualität!

Rating: 3/5 | 2025-12-28
Good product overall. Works as described. Shipping was a bit slow but no major complaints. Decent value for money.

Rating: 5/5 | 2026-01-03
Très satisfait de mon achat. Le produit correspond parfaitement à la description. Service client réactif. Livraison rapide!

Rating: 4/5 | 2025-12-15
I've tried many similar products but this one is by far the best. The value for money is incredible! Minor packaging issues but product is great.

Rating: 5/5 | 2026-01-03
¡Increíble! Este producto superó todas mis expectativas. Ya lo recomendé a todos mis conocidos. Calidad premium!

Rating: 5/5 | 2026-01-03
Perfect in every way! Exceeded all my expectations. Already recommended to friends and family. Best purchase of the year!

Rating: 2/5 | 2025-11-20
Received exactly what was shown in the pictures. Quality is decent for the price. Satisfactory experience but nothing special.

Rating: 5/5 | 2026-01-03
This is the best thing ever invented! I bought 5 more for my entire family! Everyone loves it! Amazing amazing amazing!`;

export function ReviewInput({ onAnalyze, isLoading }: ReviewInputProps) {
  const [reviewText, setReviewText] = useState("");
  const [batchName, setBatchName] = useState("");

  const handleAnalyze = () => {
    const reviews = parseReviews(reviewText);
    if (reviews.length > 0) {
      onAnalyze(reviews, batchName.trim() || undefined);
    }
  };

  const parseReviews = (text: string): Review[] => {
    // Split by double newlines or numbered patterns
    const reviewTexts = text
      .split(/\n\n+|\n(?=\d+\.\s)/)
      .map(r => r.trim())
      .filter(r => r.length > 10);

    return reviewTexts.map((content, index) => {
      // Try to extract rating if present (e.g., "5/5", "Rating: 4")
      const ratingMatch = content.match(/(?:Rating[:\s]*)?(\d)(?:\/5|\s*stars?)?/i);
      const rating = ratingMatch ? parseInt(ratingMatch[1]) : undefined;

      // Try to extract date if present
      const dateMatch = content.match(/(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/);
      const review_date = dateMatch ? dateMatch[1] : undefined;

      return {
        id: `review-${index + 1}`,
        content: content.replace(/Rating[:\s]*\d(?:\/5|\s*stars?)?/gi, '').trim(),
        rating,
        review_date,
      };
    });
  };

  const reviewCount = reviewText.trim() ? parseReviews(reviewText).length : 0;

  const loadSampleData = () => {
    setReviewText(SAMPLE_REVIEWS);
    setBatchName("Sample Review Analysis");
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5 text-primary" />
          Review Input
        </CardTitle>
        <CardDescription>
          Paste 30-50 reviews to analyze for integrity signals. Separate reviews with blank lines.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="batch-name">Batch Name (optional)</Label>
          <Input
            id="batch-name"
            placeholder="e.g., Product X Reviews - January 2026"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            className="bg-input border-border"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="reviews">Reviews</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSampleData}
              className="text-xs gap-1"
            >
              <Zap className="h-3 w-3" />
              Load Sample Data
            </Button>
          </div>
          <Textarea
            id="reviews"
            placeholder={`Paste your reviews here, one per paragraph...

Example format:
Great product! Exactly what I needed. Fast shipping.

Another review here. The quality was excellent.

Each review should be separated by a blank line.`}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="min-h-[200px] sm:min-h-[300px] bg-input border-border font-mono text-xs sm:text-sm resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              {reviewCount} review{reviewCount !== 1 ? 's' : ''} detected
              {reviewCount > 50 && ' (max 50 will be analyzed)'}
            </span>
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={reviewCount < 3 || isLoading}
            className="gap-2 w-full sm:w-auto"
          >
            <Zap className="h-4 w-4" />
            {isLoading ? 'Analyzing...' : 'Analyze Review Integrity'}
          </Button>
        </div>

        {reviewCount > 0 && reviewCount < 10 && (
          <p className="text-xs text-muted-foreground">
            Tip: For more accurate analysis, include at least 30 reviews.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
