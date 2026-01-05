import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Layers, Users } from "lucide-react";
import type { Cluster } from "@/types/analysis";

interface ReviewClustersProps {
  clusters: Cluster[];
}

export function ReviewClusters({ clusters }: ReviewClustersProps) {
  if (!clusters || clusters.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="h-5 w-5 text-primary" />
            Review Clusters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No distinct clusters identified. Reviews appear independently written.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Layers className="h-5 w-5 text-primary" />
          Review Clusters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clusters.map((cluster, index) => (
            <div
              key={cluster.clusterId || index}
              className={cn(
                "p-4 rounded-lg border transition-all animate-slide-up",
                cluster.coordinationLikelihood === 'high' && "border-risk-high/30 bg-risk-high/5",
                cluster.coordinationLikelihood === 'medium' && "border-risk-medium/30 bg-risk-medium/5",
                cluster.coordinationLikelihood === 'low' && "border-border bg-muted/20"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium">Cluster {cluster.clusterId || index + 1}</span>
                  <span className="text-sm text-muted-foreground">
                    ({cluster.reviewIndices.length} reviews)
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs self-start sm:self-auto shrink-0",
                    cluster.coordinationLikelihood === 'high' && "border-risk-high/50 text-risk-high",
                    cluster.coordinationLikelihood === 'medium' && "border-risk-medium/50 text-risk-medium",
                    cluster.coordinationLikelihood === 'low' && "border-border text-muted-foreground"
                  )}
                >
                  {cluster.coordinationLikelihood} likelihood
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {cluster.reviewIndices.slice(0, 10).map((idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded font-mono"
                  >
                    #{idx}
                  </span>
                ))}
                {cluster.reviewIndices.length > 10 && (
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                    +{cluster.reviewIndices.length - 10} more
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Common characteristics:</p>
                <ul className="text-sm text-muted-foreground">
                  {cluster.commonCharacteristics.map((char, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      {char}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
