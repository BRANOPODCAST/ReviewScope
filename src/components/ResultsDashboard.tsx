import { ManipulationBand } from "./ManipulationBand";
import { SignalsList } from "./SignalsList";
import { ReviewClusters } from "./ReviewClusters";
import { TimelineDensity } from "./TimelineDensity";
import { ConfidenceExplanation } from "./ConfidenceExplanation";
import { PatternDetails } from "./PatternDetails";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle } from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";

interface ResultsDashboardProps {
  results: AnalysisResult;
}

export function ResultsDashboard({ results }: ResultsDashboardProps) {
  const { summary, stages } = results;

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-primary">
        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
        <h2 className="text-lg sm:text-xl font-semibold">Analysis Complete</h2>
        <span className="text-xs sm:text-sm text-muted-foreground">
          {results.reviewCount} reviews analyzed
        </span>
      </div>

      {/* Manipulation Band - Always visible */}
      <ManipulationBand
        band={summary.manipulationBand}
        rationale={stages.integrityAssessment?.bandRationale}
      />

      {/* Main Results Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
          <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2 min-h-[40px]">
            Overview
          </TabsTrigger>
          <TabsTrigger value="patterns" className="text-xs sm:text-sm px-2 py-2 min-h-[40px]">
            Patterns
          </TabsTrigger>
          <TabsTrigger value="clusters" className="text-xs sm:text-sm px-2 py-2 min-h-[40px]">
            Clusters
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs sm:text-sm px-2 py-2 min-h-[40px]">
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            <SignalsList signals={summary.keySignals} />
            <ConfidenceExplanation
              explanation={summary.confidenceExplanation}
              limitations={stages.integrityAssessment?.limitations}
              overallAssessment={stages.integrityAssessment?.overallAssessment}
            />
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="mt-4 sm:mt-6">
          <PatternDetails patterns={stages.patternDiscovery} />
        </TabsContent>

        <TabsContent value="clusters" className="mt-4 sm:mt-6">
          <ReviewClusters clusters={summary.clusters} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-4 sm:mt-6">
          <TimelineDensity timelineData={summary.timelineData} />
        </TabsContent>
      </Tabs>

      {/* Metadata footer */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
        <span>Languages: {stages.preprocessing?.languages?.join(', ') || 'Unknown'}</span>
        <span>Avg. words/review: {stages.preprocessing?.averageWordCount || 'N/A'}</span>
        <span>Analysis powered by Gemini 3</span>
      </div>
    </div>
  );
}
