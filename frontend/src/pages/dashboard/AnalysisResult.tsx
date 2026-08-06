import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  AlertCircle,
  Heart,
  TrendingDown,
  Apple,
  Dumbbell,
  Stethoscope,
  Shield,
  Zap,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

interface AnalysisData {
  id: string;
  disease_detected: string;
  severity: string;
  risk_score: number;
  ai_summary: string;
  causes: string;
  precautions: string;
  diet_suggestions: string;
  exercise_suggestions: string;
  medications_warning: string;
  doctor_recommendation: string;
  abnormal_values: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function AnalysisResult() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
    
        // Trigger analysis
        await axios.post(
          `${API_URL}/ai/${reportId}/analyze`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
    
        // ✅ WAIT 2 SECONDS for AI to process
        await new Promise(resolve => setTimeout(resolve, 2000));
    
        // Fetch analysis result
        const response = await axios.get(
          `${API_URL}/ai/${reportId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
    
        setAnalysis(response.data.data);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to fetch analysis');
        toast.error('Failed to load analysis');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysis();
  }, [reportId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-12 w-12 text-primary" />
          <p className="text-lg font-semibold text-gray-700">
            Analyzing your report...
          </p>
          <p className="text-sm text-gray-500">
            AI is processing your medical data
          </p>
        </motion.div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <Card className="w-full max-w-md p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Analysis Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/dashboard')} className="w-full">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Risk level color mapping
  const getRiskColor = (score: number) => {
    if (score < 30) return 'from-green-400 to-emerald-600';
    if (score < 60) return 'from-yellow-400 to-orange-600';
    if (score < 80) return 'from-orange-400 to-red-600';
    return 'from-red-500 to-red-700';
  };

  const getRiskBg = (score: number) => {
    if (score < 30) return 'bg-green-50';
    if (score < 60) return 'bg-yellow-50';
    if (score < 80) return 'bg-orange-50';
    return 'bg-red-50';
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

  return (
    <div className={`min-h-screen ${getRiskBg(analysis.risk_score)} py-12`}>
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        {/* HEADER */}
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
          <h1 className="text-4xl font-bold text-gray-900">
            Analysis Complete!
          </h1>
          <p className="text-lg text-gray-600">
            Your AI-powered medical report analysis
          </p>
        </motion.div>

        {/* MAIN RISK CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={`overflow-hidden border-0 shadow-2xl ${getRiskBg(analysis.risk_score)}`}>
            <div className={`bg-gradient-to-r ${getRiskColor(analysis.risk_score)} p-12 text-white`}>
              <div className="grid md:grid-cols-3 gap-8">
                {/* Risk Score */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <p className="text-white/80 mb-2">Overall Risk Score</p>
                  <div className="flex items-end justify-center gap-1">
                    <span className="text-6xl font-bold">
                      {analysis.risk_score}
                    </span>
                    <span className="text-2xl opacity-80 mb-2">/100</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-2 mt-4">
                    <div
                      className="bg-white rounded-full h-2 transition-all duration-500"
                      style={{ width: `${analysis.risk_score}%` }}
                    />
                  </div>
                </motion.div>

                {/* Disease */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex flex-col justify-center text-center"
                >
                  <p className="text-white/80 mb-2">Detected Condition</p>
                  <p className="text-3xl font-bold">{analysis.disease_detected || 'No Issues'}</p>
                </motion.div>

                {/* Severity */}
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

            {/* Summary */}
            <div className="p-8">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                AI Summary
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {analysis.ai_summary}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* DETAILS GRID */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* CAUSES */}
          {analysis.causes && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Possible Causes
                </h3>
                <p className="text-gray-700">{analysis.causes}</p>
              </Card>
            </motion.div>
          )}

          {/* PRECAUTIONS */}
          {analysis.precautions && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full p-6 hover:shadow-lg transition-shadow bg-blue-50">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Precautions
                </h3>
                <p className="text-gray-700">{analysis.precautions}</p>
              </Card>
            </motion.div>
          )}

          {/* DIET */}
          {analysis.diet_suggestions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full p-6 hover:shadow-lg transition-shadow bg-green-50">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Apple className="h-5 w-5 text-green-600" />
                  Diet Suggestions
                </h3>
                <p className="text-gray-700">{analysis.diet_suggestions}</p>
              </Card>
            </motion.div>
          )}

          {/* EXERCISE */}
          {analysis.exercise_suggestions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full p-6 hover:shadow-lg transition-shadow bg-orange-50">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-orange-600" />
                  Exercise Tips
                </h3>
                <p className="text-gray-700">{analysis.exercise_suggestions}</p>
              </Card>
            </motion.div>
          )}

          {/* MEDICATIONS */}
          {analysis.medications_warning && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="h-full p-6 hover:shadow-lg transition-shadow bg-red-50 md:col-span-2">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  Medication Warnings
                </h3>
                <p className="text-gray-700">{analysis.medications_warning}</p>
              </Card>
            </motion.div>
          )}
        </div>

        {/* DOCTOR RECOMMENDATION */}
        {analysis.doctor_recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
              <div className="flex items-start gap-4">
                <Stethoscope className="h-8 w-8 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2 text-purple-900">
                    Doctor's Recommendation
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {analysis.doctor_recommendation}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ABNORMAL VALUES */}
        {analysis.abnormal_values && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-8 border-l-4 border-yellow-500 bg-yellow-50">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-yellow-600" />
                Abnormal Values Detected
              </h3>
              <p className="text-gray-700">{analysis.abnormal_values}</p>
            </Card>
          </motion.div>
        )}

        {/* FOOTER ACTIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center pt-8"
        >
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="h-12 px-8 rounded-xl"
          >
            Back to Dashboard
          </Button>

          <Button
            onClick={() => navigate('/upload')}
            className="h-12 px-8 rounded-xl flex items-center gap-2"
          >
            Upload Another Report
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* DISCLAIMER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center"
        >
          <p className="text-sm text-blue-900">
            ⚕️ <strong>Medical Disclaimer:</strong> This AI analysis is for informational purposes only.
            Please consult with a qualified healthcare professional before making any medical decisions.
          </p>
        </motion.div>
      </div>
    </div>
  );
}