import { Check, Loader2, Circle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AnalysisStage } from "@/types/analysis";

interface AnalysisProgressProps {
  currentStage: AnalysisStage;
}

const stages = [
  { id: 'preprocessing', label: 'Stage 0: Preprocessing', description: 'Normalizing reviews and metadata' },
  { id: 'patterns', label: 'Stage 1: Pattern Discovery', description: 'Detecting linguistic similarities' },
  { id: 'coordination', label: 'Stage 2: Coordination Analysis', description: 'Analyzing timing and clusters' },
  { id: 'integrity', label: 'Stage 3: Integrity Assessment', description: 'Synthesizing findings' },
];

const stageOrder: AnalysisStage[] = ['idle', 'preprocessing', 'patterns', 'coordination', 'integrity', 'complete'];

export function AnalysisProgress({ currentStage }: AnalysisProgressProps) {
  const currentIndex = stageOrder.indexOf(currentStage);
  
  const getStageStatus = (stageId: string) => {
    const stageIdx = stageOrder.indexOf(stageId as AnalysisStage);
    if (currentStage === 'complete' || stageIdx < currentIndex) return 'complete';
    if (stageIdx === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
          Multi-Stage Analysis in Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          
          <div className="space-y-6">
            {stages.map((stage, idx) => {
              const status = getStageStatus(stage.id);
              
              return (
                <div
                  key={stage.id}
                  className={cn(
                    "relative flex items-start gap-4 pl-10 transition-all duration-500",
                    status === 'active' && "animate-stage-enter"
                  )}
                >
                  {/* Stage indicator */}
                  <div
                    className={cn(
                      "absolute left-0 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-300",
                      status === 'complete' && "border-primary bg-primary text-primary-foreground",
                      status === 'active' && "border-primary bg-primary/20 text-primary",
                      status === 'pending' && "border-border bg-card text-muted-foreground"
                    )}
                  >
                    {status === 'complete' ? (
                      <Check className="h-4 w-4" />
                    ) : status === 'active' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                  </div>
                  
                  {/* Stage content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "font-medium transition-colors",
                        status === 'complete' && "text-primary",
                        status === 'active' && "text-foreground",
                        status === 'pending' && "text-muted-foreground"
                      )}
                    >
                      {stage.label}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {stage.description}
                    </p>
                    
                    {status === 'active' && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full animate-pulse w-2/3" />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          Processing...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <p className="mt-6 text-xs text-muted-foreground text-center">
          Each stage uses Gemini 3 for deep reasoning analysis
        </p>
      </CardContent>
    </Card>
  );
}
