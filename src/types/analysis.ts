export interface Review {
  id?: string;
  content: string;
  rating?: number;
  review_date?: string;
  language?: string;
}

export interface Signal {
  signal: string;
  significance: 'low' | 'medium' | 'high';
  affectedReviews?: number[];
}

export interface Cluster {
  clusterId: number;
  reviewIndices: number[];
  commonCharacteristics: string[];
  coordinationLikelihood: 'low' | 'medium' | 'high';
}

export interface TimelinePoint {
  date: string;
  count: number;
}

export interface PatternDiscovery {
  linguisticSimilarityScore: number;
  similarPhrases: Array<{
    phrase: string;
    reviewIndices: number[];
    frequency: number;
  }>;
  emotionalPatterns: Array<{
    pattern: string;
    reviewIndices: number[];
    intensity: string;
  }>;
  templateIndicators: Array<{
    indicator: string;
    reviewIndices: number[];
  }>;
  crossLanguageMatches: Array<{
    concept: string;
    languages: string[];
    reviewIndices: number[];
  }>;
  observations: string[];
}

export interface CoordinationAnalysis {
  timingAnalysis: {
    burstsPeriods: Array<{
      startDate: string;
      endDate: string;
      count: number;
    }>;
    distributionScore: number;
    suspiciousTiming: boolean;
  };
  ratingMismatches: Array<{
    reviewIndex: number;
    rating: number;
    sentimentDetected: string;
    mismatchSeverity: string;
  }>;
  clusters: Cluster[];
  coordinationSignals: string[];
}

export interface IntegrityAssessment {
  manipulationBand: 'Low' | 'Medium' | 'High';
  bandRationale: string;
  keySignals: Signal[];
  confidenceExplanation: string;
  limitations: string[];
  recommendations: string[];
  overallAssessment: string;
}

export interface AnalysisResult {
  batchId: string;
  reviewCount: number;
  stages: {
    preprocessing: {
      reviewCount: number;
      languages: string[];
      averageWordCount: number;
    };
    patternDiscovery: PatternDiscovery;
    coordinationAnalysis: CoordinationAnalysis;
    integrityAssessment: IntegrityAssessment;
  };
  summary: {
    manipulationBand: string;
    keySignals: Signal[];
    confidenceExplanation: string;
    clusters: Cluster[];
    timelineData: TimelinePoint[];
  };
}

export interface ReviewBatch {
  id: string;
  created_at: string;
  name: string | null;
  review_count: number;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
}

export type AnalysisStage = 'idle' | 'preprocessing' | 'patterns' | 'coordination' | 'integrity' | 'complete' | 'error';
