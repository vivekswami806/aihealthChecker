import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  ArrowRight, 
  FileText, 
  MoreVertical,
  Activity,
  Droplets,
  Heart,
  ChevronRight,
  Download,
  Eye,
  Trash2,
  Clock
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
} from "@/components/ui/dropdown-menu";
import { Link } from 'react-router-dom';

const reports = [
  { id: '1', name: "Full Blood Count", date: "May 24, 2024", type: "Lab", status: "Analyzed", color: "text-green-500", icon: Droplets },
  { id: '2', name: "Annual ECG Scan", date: "Feb 12, 2024", type: "Imaging", status: "Analyzed", color: "text-blue-500", icon: Heart },
  { id: '3', name: "MRI Brain Section", date: "Dec 05, 2023", type: "Neurology", status: "Pending", color: "text-orange-500", icon: Activity },
  { id: '4', name: "Liver Function Test", date: "Oct 20, 2023", type: "Lab", status: "Analyzed", color: "text-purple-500", icon: Droplets },
  { id: '5', name: "Cholesterol Panel", date: "Jul 15, 2023", type: "Lab", status: "Analyzed", color: "text-red-500", icon: Droplets },
  { id: '6', name: "Bone Density Scan", date: "Mar 30, 2023", type: "Radiology", status: "Analyzed", color: "text-indigo-500", icon: Activity },
];

export default function MedicalHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType ? r.type === filterType : true;
    return matchesSearch && matchesFilter;
  });

  const reportTypes = Array.from(new Set(reports.map(r => r.type)));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical History</h1>
          <p className="text-muted-foreground mt-1">Access and manage all your previously uploaded medical documents.</p>
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
            <DropdownMenuTrigger render={
              <Button variant={filterType ? "default" : "outline"} className="h-11 rounded-xl px-4 shrink-0 font-bold gap-2">
                <Filter className="h-4 w-4" /> {filterType || "Filter"}
              </Button>
            } />
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 mt-1">
               <DropdownMenuGroup>
                  <DropdownMenuItem 
                    className={`rounded-xl px-4 py-3 cursor-pointer ${!filterType ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => setFilterType(null)}
                  >
                    All Types
                  </DropdownMenuItem>
                  {reportTypes.map(type => (
                    <DropdownMenuItem 
                      key={type}
                      className={`rounded-xl px-4 py-3 cursor-pointer ${filterType === type ? 'bg-primary/10 text-primary' : ''}`}
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

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: "Total Reports", value: "24", icon: FileText, color: "text-blue-500" },
           { label: "AI Insights", value: "18", icon: Activity, color: "text-purple-500" },
           { label: "Last Upload", value: "3 days ago", icon: Clock, color: "text-green-500" },
           { label: "Security Status", value: "Protected", icon: ShieldCheck, color: "text-primary" },
         ].map((stat, i) => (
           <Card key={i} className="border-none shadow-sm rounded-2xl bg-background/50">
              <CardContent className="p-4 flex items-center gap-3">
                 <div className={`w-10 h-10 rounded-xl bg-background border flex items-center justify-center shrink-0`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                 </div>
                 <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{stat.label}</p>
                    <p className="font-bold text-sm truncate">{stat.value}</p>
                 </div>
              </CardContent>
           </Card>
         ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
         {filteredReports.map((report, i) => (
           <motion.div
             key={report.id}
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: i * 0.05 }}
           >
             <Card className="rounded-2xl border-none shadow-sm overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-4 md:p-6 flex items-center justify-between">
                   <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
                      <div className={`w-14 h-14 rounded-2xl bg-muted group-hover:bg-primary/5 transition-colors flex flex-col items-center justify-center shrink-0`}>
                         <report.icon className={`h-6 w-6 ${report.color} mb-0.5`} />
                         <span className="text-[8px] font-black uppercase opacity-60 tracking-tighter">{report.type}</span>
                      </div>
                      <div className="min-w-0 truncate">
                         <h3 className="font-bold text-lg leading-none group-hover:text-primary transition-colors truncate">{report.name}</h3>
                         <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-medium"><Calendar className="h-3 w-3" /> {report.date}</span>
                            <Badge className={`border-none rounded-full px-2 py-0 h-5 text-[10px] ${report.status === 'Analyzed' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                               {report.status}
                            </Badge>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-1 sm:gap-3 ml-4">
                      <Link to={`/dashboard/analysis/${report.id}`}>
                        <Button variant="ghost" size="sm" className="hidden sm:flex rounded-xl gap-2 hover:bg-primary/10 hover:text-primary transition-all">
                           <Eye className="h-4 w-4" /> View AI Analysis
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon" className="rounded-xl flex sm:hidden">
                        <Eye className="h-5 w-5" />
                      </Button>
                      
                      <DropdownMenu>
                         <DropdownMenuTrigger render={
                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
                               <MoreVertical className="h-5 w-5 text-muted-foreground" />
                            </Button>
                         } />
                         <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                            <DropdownMenuGroup>
                               <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                                  <Download className="h-4 w-4" /> Download Original
                               </DropdownMenuItem>
                               <DropdownMenuItem className="rounded-lg gap-2 cursor-pointer">
                                  <Eye className="h-4 w-4" /> View Analysis
                               </DropdownMenuItem>
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
                 <p className="text-muted-foreground">Try adjusting your search or filters.</p>
              </div>
              <Button onClick={() => setSearchTerm("")} variant="outline" className="rounded-xl">Clear search</Button>
           </div>
         )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center pt-8">
         <div className="flex bg-background border rounded-2xl p-1 gap-1">
            <Button variant="ghost" className="rounded-xl px-4">Prev</Button>
            <Button variant="secondary" className="rounded-xl h-10 w-10 p-0 font-bold">1</Button>
            <Button variant="ghost" className="rounded-xl h-10 w-10 p-0">2</Button>
            <Button variant="ghost" className="rounded-xl h-10 w-10 p-0">3</Button>
            <Button variant="ghost" className="rounded-xl px-4">Next</Button>
         </div>
      </div>
    </div>
  );
}

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);
