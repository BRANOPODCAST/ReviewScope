import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, AlertOctagon, Info } from "lucide-react";

interface ManipulationBandProps {
  band: string;
  rationale?: string;
}

export function ManipulationBand({ band, rationale }: ManipulationBandProps) {
  const normalizedBand = band.toLowerCase();
  
  const config = {
    low: {
      icon: CheckCircle,
      label: "Low",
      description: "Patterns appear consistent with organic reviewing behavior",
      className: "risk-badge-low",
      bgGradient: "from-risk-low/10 to-transparent",
    },
    medium: {
      icon: AlertTriangle,
      label: "Medium",
      description: "Some patterns warrant further examination",
      className: "risk-badge-medium",
      bgGradient: "from-risk-medium/10 to-transparent",
    },
    high: {
      icon: AlertOctagon,
      label: "High",
      description: "Multiple signals suggest coordinated activity",
      className: "risk-badge-high",
      bgGradient: "from-risk-high/10 to-transparent",
    },
  };

  const current = config[normalizedBand as keyof typeof config] || config.medium;
  const Icon = current.icon;

  return (
    <div className={cn(
      "relative rounded-lg border p-4 sm:p-6 overflow-hidden",
      "bg-gradient-to-br",
      current.bgGradient,
      normalizedBand === 'low' && "border-risk-low/30",
      normalizedBand === 'medium' && "border-risk-medium/30",
      normalizedBand === 'high' && "border-risk-high/30"
    )}>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={cn(
          "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full shrink-0",
          normalizedBand === 'low' && "bg-risk-low/20 text-risk-low",
          normalizedBand === 'medium' && "bg-risk-medium/20 text-risk-medium",
          normalizedBand === 'high' && "bg-risk-high/20 text-risk-high"
        )}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <h3 className="text-base sm:text-lg font-semibold">Manipulation Likelihood</h3>
            <span className={cn(
              "px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium",
              current.className
            )}>
              {current.label}
            </span>
          </div>
          
          <p className="text-muted-foreground text-xs sm:text-sm">
            {current.description}
          </p>
          
          {rationale && (
            <div className="mt-3 sm:mt-4 flex items-start gap-2 p-2 sm:p-3 bg-muted/50 rounded-md">
              <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs sm:text-sm text-muted-foreground">
                {rationale}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Decorative glow */}
      <div className={cn(
        "absolute -right-20 -top-20 h-40 w-40 rounded-full blur-3xl opacity-20",
        normalizedBand === 'low' && "bg-risk-low",
        normalizedBand === 'medium' && "bg-risk-medium",
        normalizedBand === 'high' && "bg-risk-high"
      )} />
    </div>
  );
}
