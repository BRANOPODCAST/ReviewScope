import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { History, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ReviewBatch } from "@/types/analysis";

interface PastAnalysesProps {
  onSelect: (batchId: string) => void;
  currentBatchId?: string;
}

export function PastAnalyses({ onSelect, currentBatchId }: PastAnalysesProps) {
  const [batches, setBatches] = useState<ReviewBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      const { data, error } = await supabase
        .from('review_batches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setBatches(data as ReviewBatch[]);
      }
      setIsLoading(false);
    };

    fetchBatches();
  }, [currentBatchId]);

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-primary" />
            Past Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (batches.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-primary" />
            Past Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No previous analyses yet. Run your first analysis above.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" />
          Past Analyses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[200px] lg:max-h-none overflow-y-auto">
          {batches.map((batch) => (
            <Button
              key={batch.id}
              variant="ghost"
              className={cn(
                "w-full justify-between h-auto py-2 sm:py-3 px-2 sm:px-3",
                batch.id === currentBatchId && "bg-primary/10"
              )}
              onClick={() => onSelect(batch.id)}
            >
              <div className="text-left min-w-0 flex-1">
                <p className="font-medium text-xs sm:text-sm truncate">
                  {batch.name || `Analysis ${batch.id.slice(0, 8)}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(batch.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs hidden sm:inline-flex",
                    batch.status === 'completed' && "border-risk-low/50 text-risk-low",
                    batch.status === 'analyzing' && "border-primary/50 text-primary",
                    batch.status === 'failed' && "border-risk-high/50 text-risk-high"
                  )}
                >
                  {batch.status}
                </Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {batch.review_count}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
