import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Signal, AlertCircle } from "lucide-react";
import type { Signal as SignalType } from "@/types/analysis";

interface SignalsListProps {
  signals: SignalType[];
}

export function SignalsList({ signals }: SignalsListProps) {
  if (!signals || signals.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Signal className="h-5 w-5 text-primary" />
            Key Signals Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No significant signals detected.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Signal className="h-5 w-5 text-primary" />
          Key Signals Detected
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {signals.map((signal, index) => (
            <li
              key={index}
              className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 p-3 rounded-lg bg-muted/30 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <AlertCircle className={cn(
                  "h-4 w-4 mt-0.5 shrink-0",
                  signal.significance === 'high' && "text-risk-high",
                  signal.significance === 'medium' && "text-risk-medium",
                  signal.significance === 'low' && "text-muted-foreground"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{signal.signal}</p>
                  {signal.affectedReviews && signal.affectedReviews.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono break-all">
                      Affects: {signal.affectedReviews.slice(0, 5).join(', ')}
                      {signal.affectedReviews.length > 5 && ` +${signal.affectedReviews.length - 5} more`}
                    </p>
                  )}
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 text-xs self-start sm:self-auto",
                  signal.significance === 'high' && "border-risk-high/50 text-risk-high",
                  signal.significance === 'medium' && "border-risk-medium/50 text-risk-medium",
                  signal.significance === 'low' && "border-border text-muted-foreground"
                )}
              >
                {signal.significance}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
