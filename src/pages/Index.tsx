import { useState } from "react";
import { ReviewInput } from "@/components/ReviewInput";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { PastAnalyses } from "@/components/PastAnalyses";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Scan, Database, Brain } from "lucide-react";
import type { Review, AnalysisResult, AnalysisStage } from "@/types/analysis";

const Index = () => {
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>('idle');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async (reviews: Review[], batchName?: string) => {
    setResults(null);
    setAnalysisStage('preprocessing');

    try {
      // Create batch in database
      const { data: batch, error: batchError } = await supabase
        .from('review_batches')
        .insert({
          name: batchName || null,
          review_count: reviews.length,
          status: 'analyzing',
        })
        .select()
        .single();

      if (batchError) throw batchError;
      setCurrentBatchId(batch.id);

      // Insert reviews
      const reviewsToInsert = reviews.map(r => ({
        batch_id: batch.id,
        content: r.content,
        rating: r.rating,
        review_date: r.review_date,
        language: r.language,
      }));

      await supabase.from('reviews').insert(reviewsToInsert);

      // Simulate stage progression (actual stages happen in edge function)
      setAnalysisStage('patterns');
      
      // Call analysis edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            reviews,
            batchId: batch.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const analysisResults: AnalysisResult = await response.json();

      // Update stages as we progress
      setAnalysisStage('coordination');
      await new Promise(resolve => setTimeout(resolve, 500));
      setAnalysisStage('integrity');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Save results to database
      await supabase.from('analysis_results').insert([{
        batch_id: batch.id,
        preprocessing: JSON.parse(JSON.stringify(analysisResults.stages.preprocessing)),
        pattern_discovery: JSON.parse(JSON.stringify(analysisResults.stages.patternDiscovery)),
        coordination_analysis: JSON.parse(JSON.stringify(analysisResults.stages.coordinationAnalysis)),
        integrity_assessment: JSON.parse(JSON.stringify(analysisResults.stages.integrityAssessment)),
        manipulation_band: analysisResults.summary.manipulationBand,
        key_signals: JSON.parse(JSON.stringify(analysisResults.summary.keySignals)),
        confidence_explanation: analysisResults.summary.confidenceExplanation,
        review_clusters: JSON.parse(JSON.stringify(analysisResults.summary.clusters)),
        timeline_data: JSON.parse(JSON.stringify(analysisResults.summary.timelineData)),
      }]);

      // Update batch status
      await supabase
        .from('review_batches')
        .update({ status: 'completed' })
        .eq('id', batch.id);

      setResults(analysisResults);
      setAnalysisStage('complete');

      toast({
        title: "Analysis Complete",
        description: `Analyzed ${reviews.length} reviews with ${analysisResults.summary.manipulationBand} manipulation likelihood.`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisStage('error');
      
      if (currentBatchId) {
        await supabase
          .from('review_batches')
          .update({ status: 'failed' })
          .eq('id', currentBatchId);
      }

      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis",
        variant: "destructive",
      });
    }
  };

  const loadPastAnalysis = async (batchId: string) => {
    try {
      const { data, error } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('batch_id', batchId)
        .single();

      if (error) throw error;

      if (data) {
        const preprocessing = (data as any).preprocessing || { reviewCount: 0, languages: [], averageWordCount: 0 };
        const reconstructedResults: AnalysisResult = {
          batchId: data.batch_id,
          reviewCount: preprocessing.reviewCount || 0,
          stages: {
            preprocessing,
            patternDiscovery: data.pattern_discovery as any,
            coordinationAnalysis: data.coordination_analysis as any,
            integrityAssessment: data.integrity_assessment as any,
          },
          summary: {
            manipulationBand: data.manipulation_band || 'Unknown',
            keySignals: (data.key_signals as any) || [],
            confidenceExplanation: data.confidence_explanation || '',
            clusters: (data.review_clusters as any) || [],
            timelineData: (data.timeline_data as any) || [],
          },
        };

        setResults(reconstructedResults);
        setCurrentBatchId(batchId);
        setAnalysisStage('complete');
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
      toast({
        title: "Error",
        description: "Failed to load past analysis",
        variant: "destructive",
      });
    }
  };

  const isAnalyzing = ['preprocessing', 'patterns', 'coordination', 'integrity'].includes(analysisStage);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">ReviewScope</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Review Integrity Analysis</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span>Powered by Gemini 3</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main Column */}
          <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
            {/* Hero Section */}
            {analysisStage === 'idle' && !results && (
              <div className="text-center py-4 sm:py-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                  <span className="text-gradient">Analyze Review Integrity</span>
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
                  Detect patterns that may indicate coordinated or manipulated reviewing behavior 
                  using multi-stage AI reasoning. Paste your reviews below to begin.
                </p>
                <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Scan className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    <span>Pattern Detection</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Database className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    <span>Cluster Analysis</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    <span>Multi-Stage Reasoning</span>
                  </div>
                </div>
              </div>
            )}

            {/* Review Input */}
            {!isAnalyzing && (
              <ReviewInput onAnalyze={handleAnalyze} isLoading={isAnalyzing} />
            )}

            {/* Analysis Progress */}
            {isAnalyzing && <AnalysisProgress currentStage={analysisStage} />}

            {/* Results Dashboard */}
            {results && analysisStage === 'complete' && (
              <ResultsDashboard results={results} />
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            <PastAnalyses onSelect={loadPastAnalysis} currentBatchId={currentBatchId || undefined} />
            
            {/* Info Card */}
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <h3 className="font-medium mb-2 text-sm">How it works</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-mono">0.</span>
                  Preprocess and normalize reviews
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-mono">1.</span>
                  Detect linguistic patterns with Gemini 3
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-mono">2.</span>
                  Analyze coordination signals
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-mono">3.</span>
                  Synthesize integrity assessment
                </li>
              </ul>
            </div>

            {/* Disclaimer */}
            <div className="rounded-lg border border-risk-medium/30 bg-risk-medium/5 p-4">
              <p className="text-xs text-muted-foreground">
                <strong className="text-risk-medium">Research Tool:</strong> This tool identifies 
                patterns but does not determine if reviews are "fake" or "real". 
                Results are probabilistic and should be interpreted with caution.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Index;
