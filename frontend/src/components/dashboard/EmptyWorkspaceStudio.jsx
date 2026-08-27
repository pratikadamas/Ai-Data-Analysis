import React, { useState } from "react";
import { 
  Sparkles, 
  Database, 
  BarChart3, 
  Terminal, 
  FileSpreadsheet, 
  Layers, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  Cpu,
  TrendingUp,
  Globe2,
  Users
} from "lucide-react";
import { uploadDataset } from "../../services/api.js";
import { useDataset } from "../../context/DatasetContext.jsx";
import { toast } from "react-toastify";
import UploadArea from "../upload/UploadArea.jsx";

// Curated sample datasets for instant 1-click exploration
const SAMPLE_DATASETS = [
  {
    id: "global-sales",
    title: "Global SaaS Revenue & Growth",
    description: "Monthly recurring revenue, customer tiers, churn rates, and regional breakdown across 12 countries.",
    badge: "Enterprise Tech",
    icon: TrendingUp,
    color: "from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
    csv: `Month,Region,Tier,MRR_USD,Active_Users,New_Signups,Churn_Rate,NPS
2025-01,North America,Enterprise,124500,4200,340,0.012,74
2025-01,Europe,Growth,88400,3100,290,0.015,70
2025-01,Asia Pacific,Starter,46200,5800,620,0.024,68
2025-02,North America,Enterprise,131200,4450,380,0.011,76
2025-02,Europe,Growth,92800,3340,310,0.014,72
2025-02,Asia Pacific,Starter,51900,6400,710,0.022,69
2025-03,North America,Enterprise,142000,4800,430,0.009,79
2025-03,Europe,Growth,98500,3580,340,0.013,73
2025-03,Asia Pacific,Starter,58200,7100,820,0.019,71
2025-04,North America,Enterprise,154300,5200,490,0.008,82
2025-04,Europe,Growth,106200,3890,390,0.012,75
2025-04,Asia Pacific,Starter,64800,7950,910,0.018,73
2025-05,North America,Enterprise,168900,5700,560,0.007,84
2025-05,Europe,Growth,115400,4250,440,0.011,77
2025-05,Asia Pacific,Starter,73100,8800,1020,0.016,74
2025-06,North America,Enterprise,184500,6300,640,0.006,86
2025-06,Europe,Growth,126800,4700,510,0.010,78
2025-06,Asia Pacific,Starter,82400,9800,1180,0.015,76`,
    filename: "global_saas_metrics_2025.csv"
  },
  {
    id: "ecommerce-cohorts",
    title: "E-Commerce Customer Cohorts",
    description: "Multi-channel orders, average order value (AOV), retention, and marketing acquisition costs.",
    badge: "Consumer Retail",
    icon: Globe2,
    color: "from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
    csv: `OrderID,CustomerSegment,Channel,OrderValue_USD,ItemsCount,Discount_Applied,Delivery_Days,Rating
1001,Returning VIP,Organic Search,189.50,3,15.00,2,5
1002,New Customer,Instagram Ads,64.20,1,0.00,4,4
1003,Wholesale,Direct B2B,890.00,14,75.00,3,5
1004,New Customer,Google Search,42.00,1,5.00,3,3
1005,Returning VIP,Email Newsletter,215.80,4,20.00,2,5
1006,New Customer,TikTok Ads,38.90,1,0.00,5,4
1007,Returning VIP,Direct B2B,540.00,8,40.00,1,5
1008,New Customer,Instagram Ads,88.40,2,10.00,3,4
1009,Returning VIP,Organic Search,145.00,2,0.00,2,5
1010,New Customer,Google Search,96.30,2,10.00,4,4
1011,Returning VIP,Email Newsletter,312.00,5,30.00,1,5
1012,Wholesale,Direct B2B,1250.00,22,120.00,2,5
1013,New Customer,TikTok Ads,52.50,1,5.00,4,3
1014,Returning VIP,Organic Search,178.90,3,15.00,2,5
1015,New Customer,Instagram Ads,112.40,2,10.00,3,5`,
    filename: "ecommerce_customer_orders.csv"
  },
  {
    id: "ai-compute-logs",
    title: "AI Cluster GPU Telemetry",
    description: "Cluster utilization, memory pressure, temperature, energy consumption, and token throughput.",
    badge: "Hardware & AI",
    icon: Cpu,
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    csv: `Timestamp,Node_ID,GPU_Model,Utilization_Pct,VRAM_Used_GB,Temp_C,Power_Watts,Tokens_Per_Sec
2025-06-01 00:00,node-alpha-01,NVIDIA H100 80GB,94.2,74.8,68,640,4850
2025-06-01 00:00,node-alpha-02,NVIDIA H100 80GB,91.8,72.4,66,620,4680
2025-06-01 00:00,node-beta-01,NVIDIA A100 80GB,88.5,68.2,71,390,2940
2025-06-01 01:00,node-alpha-01,NVIDIA H100 80GB,96.5,76.2,70,660,5120
2025-06-01 01:00,node-alpha-02,NVIDIA H100 80GB,93.4,73.8,67,635,4790
2025-06-01 01:00,node-beta-01,NVIDIA A100 80GB,89.1,69.0,72,395,2980
2025-06-01 02:00,node-alpha-01,NVIDIA H100 80GB,98.1,78.5,72,680,5340
2025-06-01 02:00,node-alpha-02,NVIDIA H100 80GB,95.0,75.1,68,645,4920
2025-06-01 02:00,node-beta-01,NVIDIA A100 80GB,90.4,70.5,73,405,3050
2025-06-01 03:00,node-alpha-01,NVIDIA H100 80GB,92.0,71.9,67,625,4710
2025-06-01 03:00,node-alpha-02,NVIDIA H100 80GB,89.6,70.2,65,610,4530
2025-06-01 03:00,node-beta-01,NVIDIA A100 80GB,86.2,66.8,69,380,2860`,
    filename: "gpu_cluster_telemetry.csv"
  }
];

export default function EmptyWorkspaceStudio({ onSelectTab }) {
  const { dataset, setDataset, setUploadEntries, setIsUploading } = useDataset();
  const [loadingSample, setLoadingSample] = useState(null);

  const handleLoadSample = async (sample) => {
    try {
      setLoadingSample(sample.id);
      const blob = new Blob([sample.csv], { type: "text/csv" });
      const file = new File([blob], sample.filename, { type: "text/csv" });
      
      setUploadEntries([{ file, status: "uploading", error: null }]);
      setIsUploading(true);

      const { data } = await uploadDataset([file]);
      setDataset(data);
      setUploadEntries([{ file, status: "done", error: null }]);
      setIsUploading(false);
      toast.success(`Loaded sample dataset: "${sample.title}"!`);
      if (onSelectTab) onSelectTab("preview");
    } catch (err) {
      toast.error("Failed to load sample dataset. Please try uploading a file.");
      setIsUploading(false);
    } finally {
      setLoadingSample(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fade-in">
      
      {/* ── macOS Studio Hero Control Center ── */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-b from-white/90 via-white/70 to-white/40 dark:from-[#1c1c1e]/90 dark:via-[#161617]/70 dark:to-[#121214]/40 border border-black/[0.08] dark:border-white/[0.1] shadow-[0_16px_48px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden">
        
        {/* Apple Gloss Aura Mesh */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#0071e3]/10 text-[#0071e3] dark:bg-[#0071e3]/20 dark:text-blue-400 border border-[#0071e3]/20">
              <Sparkles size={13} className="animate-pulse" />
              <span>Apple Silicon & DuckDB Acceleration Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
              Welcome to AI Data Analysis Studio
            </h1>
            <p className="text-sm sm:text-base text-[#6e6e73] dark:text-[#a1a1a6]">
              Drop your datasets below, inspect deep distributions, query in natural language, or test instantly with a curated sample.
            </p>
          </div>

          {/* Engine Status HUD */}
          <div className="shrink-0 flex items-center gap-4 px-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] backdrop-blur-md">
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e6e73] dark:text-[#a1a1a6]">Engine Status</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                DuckDB WASM 120Hz
              </span>
            </div>
            <div className="w-[1px] h-7 bg-black/[0.08] dark:bg-white/[0.1]" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6e6e73] dark:text-[#a1a1a6]">Latency</span>
              <span className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">~0.4 ms</span>
            </div>
          </div>
        </div>

        {/* Studio Capability Highlights */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex items-center gap-3 hover:border-[#0071e3]/40 transition-colors">
            <div className="p-2 rounded-xl bg-blue-500/10 text-[#0071e3] dark:text-blue-400">
              <Database size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Multi-File Schema</div>
              <div className="text-[11px] text-[#6e6e73] dark:text-[#a1a1a6]">Auto SQL joins & views</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex items-center gap-3 hover:border-purple-500/40 transition-colors">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <BarChart3 size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Auto-Visualizer</div>
              <div className="text-[11px] text-[#6e6e73] dark:text-[#a1a1a6]">Plotly & Chart.js GPU</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex items-center gap-3 hover:border-emerald-500/40 transition-colors">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Terminal size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">SQL Workspace</div>
              <div className="text-[11px] text-[#6e6e73] dark:text-[#a1a1a6]">Execute DuckDB queries</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.06] flex items-center gap-3 hover:border-amber-500/40 transition-colors">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Sandboxed Privacy</div>
              <div className="text-[11px] text-[#6e6e73] dark:text-[#a1a1a6]">Zero data retention</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 1-Click Instant Sample Datasets ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
              Or Test Instantly with Sample Datasets
            </h2>
          </div>
          <span className="text-xs text-[#6e6e73] dark:text-[#a1a1a6]">No download required</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_DATASETS.map((sample) => {
            const Icon = sample.icon;
            const isLoading = loadingSample === sample.id;
            return (
              <div
                key={sample.id}
                className="group relative rounded-2xl p-5 bg-white/80 dark:bg-[#1c1c1e]/80 border border-black/[0.06] dark:border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] backdrop-blur-xl hover:shadow-[0_8px_30px_rgba(0,113,227,0.12)] hover:border-[#0071e3]/40 dark:hover:border-[#0071e3]/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${sample.color}`}>
                      <Icon size={18} />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[#6e6e73] dark:text-[#a1a1a6]">
                      {sample.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-sm text-[#1d1d1f] dark:text-[#f5f5f7] group-hover:text-[#0071e3] transition-colors">
                      {sample.title}
                    </h3>
                    <p className="text-xs text-[#6e6e73] dark:text-[#a1a1a6] mt-1 leading-relaxed line-clamp-2">
                      {sample.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#6e6e73] dark:text-[#a1a1a6]">
                    {sample.filename}
                  </span>
                  <button
                    onClick={() => handleLoadSample(sample)}
                    disabled={Boolean(loadingSample)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#0071e3] text-white hover:bg-[#0077ed] active:scale-95 transition-all shadow-[0_2px_8px_rgba(0,113,227,0.3)] cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span>Loading...</span>
                    ) : (
                      <>
                        <span>Load Sample</span>
                        <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main Dataset Upload Area ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <FileSpreadsheet size={16} className="text-[#0071e3]" />
          <h2 className="text-base font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            Upload Your Files
          </h2>
        </div>
        <UploadArea />
      </div>

    </div>
  );
}
