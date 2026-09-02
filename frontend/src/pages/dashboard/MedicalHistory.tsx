import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Calendar,
  FileText,
  MoreVertical,
  Activity,
  Eye,
  Trash2,
  Clock,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

interface DiseaseItem {
  id: string;
  diseaseName: string;
  firstDetected: string;
  lastDetected: string;
  recurrenceCount: number;
  currentStatus: string;
  progressionLevel?: string | null;
}

interface ReportItem {
  id: string;
  reportName: string;
  reportType: string;
  reportStatus: string;
  uploadDate: string;
  fileUrl?: string;
}

export default function MedicalHistory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [diseases, setDiseases] = useState<DiseaseItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const headers = { Authorization: `Bearer ${token}` };

        const [diseaseRes, reportsRes] = await Promise.all([
          axios.get(`${API_URL}/health/diseases`, { headers }),
          axios.get(`${API_URL}/reports/`, { headers, params: { limit: 50 } }),
        ]);

        setDiseases(
          Array.isArray(diseaseRes.data?.data) ? diseaseRes.data.data : []
        );
        const reportPayload = reportsRes.data?.data;
        setReports(Array.isArray(reportPayload) ? reportPayload : []);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load medical history');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchesSearch = r.reportName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter = filterType ? r.reportType === filterType : true;
      return matchesSearch && matchesFilter;
    });
  }, [reports, searchTerm, filterType]);

  const reportTypes = Array.from(new Set(reports.map((r) => r.reportType).filter(Boolean)));

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const lastUpload =
    reports.length > 0
      ? formatDate(
          [...reports].sort(
            (a, b) =>
              new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
          )[0].uploadDate
        )
      : '—';

  const analyzedCount = reports.filter((r) => r.reportStatus === 'COMPLETED').length;

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical History</h1>
          <p className="text-muted-foreground mt-1">
            Disease history and previously uploaded medical documents.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-xl bg-background shadow-sm focus:ring-2 ring-primary/20 transition-all border-none"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant={filterType ? 'default' : 'outline'}
                  className="h-11 rounded-xl px-4 shrink-0 font-bold gap-2"
                >
                  <Filter className="h-4 w-4" /> {filterType || 'Filter'}
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 mt-1">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className={`rounded-xl px-4 py-3 cursor-pointer ${
                    !filterType ? 'bg-primary/10 text-primary' : ''
                  }`}
                  onClick={() => setFilterType(null)}
                >
                  All Types
                </DropdownMenuItem>
                {reportTypes.map((type) => (
                  <DropdownMenuItem
                    key={type}
                    className={`rounded-xl px-4 py-3 cursor-pointer ${
                      filterType === type ? 'bg-primary/10 text-primary' : ''
                    }`}
                    onClick={() => setFilterType(type)}
                  >
                    {type}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: String(reports.length), icon: FileText, color: 'text-blue-500' },
          { label: 'AI Insights', value: String(analyzedCount), icon: Activity, color: 'text-purple-500' },
          { label: 'Last Upload', value: lastUpload, icon: Clock, color: 'text-green-500' },
          { label: 'Diseases Tracked', value: String(diseases.length), icon: ShieldCheck, color: 'text-primary' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-2xl bg-background/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-background border flex items-center justify-center shrink-0">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                  {stat.label}
                </p>
                <p className="font-bold text-sm truncate">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {diseases.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold px-1">Disease History</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {diseases.map((d) => (
              <Card key={d.id} className="rounded-2xl border-none shadow-sm">
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-lg">{d.diseaseName}</h3>
                    <Badge variant="outline" className="rounded-full shrink-0">
                      {d.currentStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    First detected {formatDate(d.firstDetected)} · Last{' '}
                    {formatDate(d.lastDetected)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Recurrences: {d.recurrenceCount}
                    {d.progressionLevel ? ` · ${d.progressionLevel}` : ''}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold px-1">Past Reports</h2>
        {filteredReports.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className="rounded-2xl border-none shadow-sm overflow-hidden group hover:shadow-md transition-all">
              <CardContent className="p-4 md:p-6 flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-muted group-hover:bg-primary/5 transition-colors flex flex-col items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 text-primary mb-0.5" />
                    <span className="text-[8px] font-black uppercase opacity-60 tracking-tighter">
                      {report.reportType || 'Report'}
                    </span>
                  </div>
                  <div className="min-w-0 truncate">
                    <h3 className="font-bold text-lg leading-none group-hover:text-primary transition-colors truncate">
                      {report.reportName}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="h-3 w-3" /> {formatDate(report.uploadDate)}
                      </span>
                      <Badge
                        className={`border-none rounded-full px-2 py-0 h-5 text-[10px] ${
                          report.reportStatus === 'COMPLETED'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-orange-500/10 text-orange-500'
                        }`}
                      >
                        {report.reportStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-3 ml-4">
                  <Link to={`/dashboard/analysis/${report.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden sm:flex rounded-xl gap-2 hover:bg-primary/10 hover:text-primary transition-all"
                    >
                      <Eye className="h-4 w-4" /> View AI Analysis
                    </Button>
                  </Link>
                  <Link to={`/dashboard/analysis/${report.id}`} className="sm:hidden">
                    <Button variant="ghost" size="icon" className="rounded-xl">
                      <Eye className="h-5 w-5" />
                    </Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
                          <MoreVertical className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      }
                    />
                    <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          className="rounded-lg gap-2 cursor-pointer"
                          onClick={() => navigate(`/dashboard/analysis/${report.id}`)}
                        >
                          <Eye className="h-4 w-4" /> View Analysis
                        </DropdownMenuItem>
                        {report.fileUrl && (
                          <DropdownMenuItem
                            className="rounded-lg gap-2 cursor-pointer"
                            onClick={() => window.open(report.fileUrl, '_blank')}
                          >
                            <FileText className="h-4 w-4" /> Open Original
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                          <Trash2 className="h-4 w-4" /> Delete Permanently
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredReports.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold">No reports found</h3>
              <p className="text-muted-foreground">
                {reports.length === 0
                  ? 'Upload a report to begin tracking your medical history.'
                  : 'Try adjusting your search or filters.'}
              </p>
            </div>
            {searchTerm && (
              <Button
                onClick={() => setSearchTerm('')}
                variant="outline"
                className="rounded-xl"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
