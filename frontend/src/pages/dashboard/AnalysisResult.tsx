import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  Heart,
  Apple,
  Dumbbell,
  Stethoscope,
  Shield,
  Zap,
  Loader2,
  ArrowRight,
  GitCompare,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

interface AnalysisData {
  id?: string;
  diseaseDetected: string;
  severity: string;
  riskScore: number;
  aiSummary: string;
  causes: string;
  precautions: string;
  dietSuggestions: string;
  exerciseSuggestions: string;
  medicationsWarning?: string | null;
  doctorRecommendation?: string | null;
}

interface ComparisonData {
  comparisonSummary?: string;
  healthImprovementScore?: number;
  detectedChanges?: {
    improving?: string[];
    worsening?: string[];
    stable?: string[];
    recurring?: string[];
  };
  oldDisease?: string;
  newDisease?: string;
}

interface DiseaseHistoryItem {
  id: string;
  diseaseName: string;
  firstDetected: string;
  lastDetected: string;
  recurrenceCount: number;
  currentStatus: string;
  progressionLevel?: string | null;
}

interface ReportInfo {
  id: string;
  reportName: string;
  fileUrl?: string;
  uploadDate?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function AnalysisResult() {
  const params = useParams();
  const reportId = params.id || params.reportId;
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [medicalHistory, setMedicalHistory] = useState<DiseaseHistoryItem[]>([]);
  const [report, setReport] = useState<ReportInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      setError('Report ID is missing');
      setIsLoading(false);
      return;
    }

    // Prevent double-analyze in Strict Mode
    if (requestedRef.current === reportId) return;
    requestedRef.current = reportId;

    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('accessToken');

        const response = await axios.post(
          `${API_URL}/ai/${reportId}/analyze`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const payload = response.data?.data;
        if (!payload?.analysis) {
          throw new Error('Analysis data missing from response');
        }

        setAnalysis(payload.analysis);
        setComparison(payload.comparison || null);
        setMedicalHistory(payload.medicalHistory || []);
        setReport(payload.report || null);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || 'Failed to fetch analysis');
        toast.error('Failed to load analysis');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [reportId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-12 w-12 text-primary" />
          <p className="text-lg font-semibold">Analyzing your report...</p>
          <p className="text-sm text-muted-foreground">
            AI is processing your medical data
          </p>
        </motion.div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md p-8 text-center rounded-[2rem]">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/dashboard')} className="w-full rounded-xl">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const riskScore = Number(analysis.riskScore) || 0;

  const getRiskColor = (score: number) => {
    if (score < 30) return 'from-green-400 to-emerald-600';
    if (score < 60) return 'from-yellow-400 to-orange-600';
    if (score < 80) return 'from-orange-400 to-red-600';
    return 'from-red-500 to-red-700';
  };

  const getRiskBg = (score: number) => {
    if (score < 30) return 'bg-green-50 dark:bg-green-950/20';
    if (score < 60) return 'bg-yellow-50 dark:bg-yellow-950/20';
    if (score < 80) return 'bg-orange-50 dark:bg-orange-950/20';
    return 'bg-red-50 dark:bg-red-950/20';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`rounded-[2rem] ${getRiskBg(riskScore)} p-4 md:p-8 space-y-8`}>
      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2 }}
            className="flex justify-center"
          >
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </motion.div>
          <h1 className="text-4xl font-bold">Analysis Complete!</h1>
          <p className="text-lg text-muted-foreground">
            {report?.reportName
              ? `Results for ${report.reportName}`
              : 'Your AI-powered medical report analysis'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={`overflow-hidden border-0 shadow-2xl ${getRiskBg(riskScore)}`}>
            <div className={`bg-gradient-to-r ${getRiskColor(riskScore)} p-12 text-white`}>
              <div className="grid md:grid-cols-3 gap-8">
                <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                  <p className="text-white/80 mb-2">Overall Risk Score</p>
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-6xl font-bold">{riskScore}</span>
                    <span className="text-2xl opacity-80 mb-2">/100</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2 mt-4">
                    <div
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${Math.min(riskScore, 100)}%` }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col justify-center text-center"
                >
                  <p className="text-white/80 mb-2">Detected Condition</p>
                  <p className="text-3xl font-bold">
                    {analysis.diseaseDetected || 'No Issues'}
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col justify-center items-center"
                >
                  <p className="text-white/80 mb-2">Severity Level</p>
                  <span
                    className={`text-2xl font-bold px-6 py-2 rounded-full ${getSeverityColor(
                      analysis.severity
                    )}`}
                  >
                    {analysis.severity?.toUpperCase() || 'NORMAL'}
                  </span>
                </motion.div>
              </div>
            </div>

            <div className="p-8">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                AI Summary
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {analysis.aiSummary}
              </p>
            </div>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {analysis.causes && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full p-6 hover:shadow-lg transition-shadow rounded-2xl">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Possible Causes
                </h3>
                <p className="text-muted-foreground">{analysis.causes}</p>
              </Card>
            </motion.div>
          )}

          {analysis.precautions && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full p-6 hover:shadow-lg transition-shadow bg-blue-50 dark:bg-blue-950/20 rounded-2xl">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Precautions
                </h3>
                <p className="text-muted-foreground">{analysis.precautions}</p>
              </Card>
            </motion.div>
          )}

          {analysis.dietSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full p-6 hover:shadow-lg transition-shadow bg-green-50 dark:bg-green-950/20 rounded-2xl">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Apple className="h-5 w-5 text-green-600" />
                  Diet Suggestions
                </h3>
                <p className="text-muted-foreground">{analysis.dietSuggestions}</p>
              </Card>
            </motion.div>
          )}

          {analysis.exerciseSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full p-6 hover:shadow-lg transition-shadow bg-orange-50 dark:bg-orange-950/20 rounded-2xl">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-orange-600" />
                  Exercise Tips
                </h3>
                <p className="text-muted-foreground">{analysis.exerciseSuggestions}</p>
              </Card>
            </motion.div>
          )}

          {analysis.medicationsWarning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="md:col-span-2"
            >
              <Card className="h-full p-6 hover:shadow-lg transition-shadow bg-red-50 dark:bg-red-950/20 rounded-2xl">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  Medication Warnings
                </h3>
                <p className="text-muted-foreground">{analysis.medicationsWarning}</p>
              </Card>
            </motion.div>
          )}
        </div>

        {analysis.doctorRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-[2rem]">
              <div className="flex items-start gap-4">
                <Stethoscope className="h-8 w-8 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2 text-purple-900 dark:text-purple-200">
                    Doctor's Recommendation
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {analysis.doctorRecommendation}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {comparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <Card className="p-8 rounded-[2rem] border-none shadow-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-primary" />
                Comparison with Previous Report
              </h3>
              {typeof comparison.healthImprovementScore === 'number' && (
                <p className="text-sm text-muted-foreground mb-3">
                  Health improvement score:{' '}
                  <span className="font-bold text-foreground">
                    {comparison.healthImprovementScore}
                  </span>
                </p>
              )}
              {comparison.comparisonSummary && (
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {comparison.comparisonSummary}
                </p>
              )}
              {(comparison.oldDisease || comparison.newDisease) && (
                <p className="text-sm mb-4">
                  Condition: <strong>{comparison.oldDisease || '—'}</strong>
                  {' → '}
                  <strong>{comparison.newDisease || '—'}</strong>
                </p>
              )}
              {comparison.detectedChanges && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(comparison.detectedChanges).map(([key, items]) =>
                    Array.isArray(items) && items.length > 0 ? (
                      <div key={key} className="bg-muted/40 rounded-xl p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                          {key}
                        </p>
                        <ul className="space-y-1 text-sm">
                          {items.map((item, idx) => (
                            <li key={idx}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {medicalHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-8 rounded-[2rem] border-none shadow-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Medical History
              </h3>
              <div className="space-y-3">
                {medicalHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-2xl bg-muted/40"
                  >
                    <div>
                      <p className="font-bold">{item.diseaseName}</p>
                      <p className="text-xs text-muted-foreground">
                        First: {formatDate(item.firstDetected)} · Last:{' '}
                        {formatDate(item.lastDetected)} · Recurrences:{' '}
                        {item.recurrenceCount}
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full w-fit">
                      {item.currentStatus}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
        >
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="h-12 px-8 rounded-xl"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => navigate('/dashboard/upload')}
            className="h-12 px-8 rounded-xl flex items-center gap-2"
          >
            Upload Another Report
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>

        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-2xl p-6 text-center">
          <p className="text-sm text-blue-900 dark:text-blue-200">
            <strong>Medical Disclaimer:</strong> This AI analysis is for informational
            purposes only. Please consult with a qualified healthcare professional before
            making any medical decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
