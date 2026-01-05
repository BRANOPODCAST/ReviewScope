import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, AlertTriangle } from "lucide-react";

interface ConfidenceExplanationProps {
  explanation: string;
  limitations?: string[];
  overallAssessment?: string;
}

export function ConfidenceExplanation({ 
  explanation, 
  limitations,
  overallAssessment 
}: ConfidenceExplanationProps) {
  return (
    <Card className="glass-card">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Info className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
          <span>Confidence & Limitations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {overallAssessment && (
          <div className="p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-xs sm:text-sm leading-relaxed">{overallAssessment}</p>
          </div>
        )}

        <div>
          <h4 className="text-xs sm:text-sm font-medium mb-2">Confidence Assessment</h4>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {explanation}
          </p>
        </div>

        {limitations && limitations.length > 0 && (
          <div>
            <h4 className="text-xs sm:text-sm font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-risk-medium shrink-0" />
              Important Limitations
            </h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {limitations.map((limitation, index) => (
                <li key={index} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-risk-medium mt-1.5 shrink-0" />
                  {limitation}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground italic">
            This analysis is for research and demonstration purposes only. 
            Signals detected do not constitute proof of fraudulent activity. 
            Many legitimate factors can produce similar patterns.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
