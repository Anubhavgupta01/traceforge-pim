import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import type { EnrichedProductRecord, RawProductInput } from "@shared/pim";
import { UNIHACK_DELIVERY_HEADERS } from "@shared/unihackDelivery";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Database,
  FileCheck2,
  FileSpreadsheet,
  Filter,
  Gauge,
  Github,
  Grid2X2,
  Info,
  Link2,
  Loader2,
  MoreHorizontal,
  Network,
  PanelLeft,
  Play,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TableProperties,
  Upload,
  WandSparkles,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type AppView = "overview" | "intake" | "records" | "review" | "evaluation";

type CsvRow = RawProductInput;

const blankRow: CsvRow = {
  Mfg_Part_Num: "DCB518ASTS06G",
  Part_Desc: 'DCB518ASTS06G Diablo 1/2"x18" - Sanding Belt 6pc',
  E1_Brand: "",
  Unilog_Brand: "",
  DIB_Brand: "",
  Part_Manuf: "Freud Inc (2435)",
};

const INPUT_HEADERS = [
  "Mfg_Part_Num",
  "Part_Desc",
  "E1_Brand",
  "Unilog_Brand",
  "DIB_Brand",
  "Part_Manuf",
] as const;

const navItems: Array<{ id: AppView; label: string; icon: typeof Grid2X2 }> = [
  { id: "overview", label: "Command center", icon: Grid2X2 },
  { id: "intake", label: "Intake studio", icon: Upload },
  { id: "records", label: "Product records", icon: TableProperties },
  { id: "review", label: "Review queue", icon: ClipboardCheck },
  { id: "evaluation", label: "Evaluation", icon: BarChart3 },
];

const controlPlane: Array<{
  title: string;
  detail: string;
  icon: typeof Check;
}> = [
  {
    title: "Placeholder cleaner",
    detail: "Mapped to null before enrichment",
    icon: Check,
  },
  {
    title: "Description firewall",
    detail: "Validated attributes only",
    icon: ShieldCheck,
  },
  {
    title: "Evidence chain",
    detail: "Input / master / manufacturer",
    icon: Link2,
  },
];

const placeholderStrings = new Set([
  "-- unbranded --",
  "-- no unilog brand --",
  "-- no dib brand --",
  "-",
  "n/a",
  "na",
  "null",
  "none",
  "",
]);

function cleanDisplay(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  return placeholderStrings.has(trimmed.toLowerCase()) ? "—" : trimmed || "—";
}

function parseCsvLine(line: string) {
  const result: string[] = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      result.push(value);
      value = "";
    } else {
      value += char;
    }
  }
  result.push(value);
  return result;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter(line => line.trim());
  if (lines.length < 2)
    throw new Error(
      "The CSV must contain a header and at least one product row."
    );
  const headers = parseCsvLine(lines[0]).map(header => header.trim());
  if (!INPUT_HEADERS.every(header => headers.includes(header)))
    throw new Error(
      "This file does not match the six-column UniHack input format."
    );
  return lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    if (values.length !== headers.length) {
      throw new Error(
        `Row ${index + 2} has ${values.length} values but the header defines ${headers.length}. Correct the row before processing.`
      );
    }
    return Object.fromEntries(
      headers.map((header, index) => [header, values[index]?.trim() ?? ""])
    ) as CsvRow;
  });
}

function csvEscape(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "slate",
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Gauge;
  tone?: "slate" | "teal" | "amber" | "violet";
}) {
  const colors = {
    slate: "bg-slate-100 text-slate-700",
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <Card className="tf-card group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              {value}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
          </div>
          <div
            className={`grid h-10 w-10 place-items-center rounded-xl ${colors[tone]}`}
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.replaceAll("_", " ");
  const tone =
    status === "approved" || status === "processed" || status === "pass"
      ? "tf-pill-success"
      : status === "needs_review" ||
          status === "warning" ||
          status === "pending"
        ? "tf-pill-warning"
        : status === "flagged" || status === "failed" || status === "fail"
          ? "tf-pill-danger"
          : "tf-pill-neutral";
  return <span className={`tf-pill ${tone}`}>{normalized}</span>;
}

export default function Home() {
  const [activeView, setActiveView] = useState<AppView>("overview");
  const [inputRow, setInputRow] = useState<CsvRow>(blankRow);
  const [parsedRows, setParsedRows] = useState<CsvRow[]>([]);
  const [sourceName, setSourceName] = useState(
    "UniHack_SampleDataset-Input.csv"
  );
  const [preview, setPreview] = useState<EnrichedProductRecord | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState<number | null>(
    null
  );
  const [processingMessage, setProcessingMessage] = useState("");
  const [recordFilter, setRecordFilter] = useState("");
  const [rawRowPaste, setRawRowPaste] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();
  const dashboardQuery = trpc.pim.dashboard.useQuery(undefined, {
    refetchInterval: processingProgress !== null ? 1500 : false,
  });
  const previewMutation = trpc.pim.enrichPreview.useMutation({
    onSuccess: data => {
      setPreview(data);
      toast.success("Preview enriched with deterministic rules.");
    },
    onError: error => toast.error(error.message),
  });
  const processMutation = trpc.pim.processBatch.useMutation();
  const detailQuery = trpc.pim.record.useQuery(
    { recordId: selectedRecordId ?? "not-selected" },
    { enabled: Boolean(selectedRecordId) }
  );
  const reviewMutation = trpc.pim.reviewField.useMutation({
    onSuccess: () => {
      void detailQuery.refetch();
      void utils.pim.dashboard.invalidate();
      toast.success("Reviewer decision saved with a complete audit event.");
    },
    onError: error => toast.error(error.message),
  });
  const activeBatch = dashboardQuery.data?.batches?.[0];
  const exportQuery = trpc.pim.exportBatch.useQuery(
    { batchId: activeBatch?.id ?? "not-ready" },
    { enabled: false }
  );
  const unihackDeliveryQuery = trpc.pim.exportUnihackDelivery.useQuery(
    { batchId: activeBatch?.id ?? "not-ready" },
    { enabled: false }
  );

  const currentMetrics = dashboardQuery.data?.metrics;
  const records = dashboardQuery.data?.records ?? [];
  const errors = dashboardQuery.data?.errors ?? [];
  const filteredRecords = useMemo(
    () =>
      records.filter(record => {
        const haystack =
          `${record.mfgPartNum ?? ""} ${record.rawDescription} ${record.brand ?? ""} ${record.reviewStatus}`.toLowerCase();
        return haystack.includes(recordFilter.toLowerCase());
      }),
    [records, recordFilter]
  );
  const reviewRecords = records.filter(
    record =>
      record.reviewStatus === "needs_review" ||
      record.reviewStatus === "flagged"
  );

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const rows = parseCsv(await file.text());
      if (rows.length > 1000)
        throw new Error(
          "This prototype accepts up to 1,000 rows in a single batch."
        );
      setParsedRows(rows);
      setSourceName(file.name);
      toast.success(
        `${rows.length.toLocaleString()} source rows are ready for constraint-first processing.`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "The file could not be read."
      );
      setParsedRows([]);
    }
  };

  const applyRawRowPaste = () => {
    const source = rawRowPaste.trim();
    if (!source) {
      setPasteError(
        "Paste one complete UniHack source row before applying it."
      );
      return;
    }
    const cells = source.includes("\t")
      ? source.split("\t").map(value => value.trim())
      : parseCsvLine(source).map(value => value.trim());
    if (cells.length !== INPUT_HEADERS.length) {
      setPasteError(
        `Expected ${INPUT_HEADERS.length} values in UniHack order; received ${cells.length}. Use a comma-separated or tab-separated row.`
      );
      return;
    }
    setInputRow(
      Object.fromEntries(
        INPUT_HEADERS.map((header, index) => [header, cells[index] ?? ""])
      ) as CsvRow
    );
    setPasteError(null);
    toast.success(
      "Raw row applied. Supplier placeholders will be nulled during preview processing."
    );
  };

  const processRows = async (rows: CsvRow[], name: string) => {
    if (!rows.length) return;
    setProcessingProgress(0);
    setProcessingMessage("Creating batch and cleaning source placeholders…");
    let batchId: string | undefined;
    const chunkSize = 100;
    try {
      for (let start = 0; start < rows.length; start += chunkSize) {
        const chunk = rows.slice(start, start + chunkSize);
        setProcessingMessage(
          `Parsing, normalizing, and validating rows ${start + 1}–${Math.min(start + chunk.length, rows.length)} of ${rows.length}…`
        );
        const response = await processMutation.mutateAsync({
          sourceName: name,
          rows: chunk,
          batchId,
          sourceOffset: start,
          totalRows: rows.length,
          finalize: start + chunk.length >= rows.length,
        });
        batchId = response.batchId;
        setProcessingProgress(
          Math.round(((start + chunk.length) / rows.length) * 100)
        );
      }
      setProcessingMessage("Batch complete. Refreshing validation metrics…");
      await utils.pim.dashboard.invalidate();
      setActiveView("records");
      toast.success(
        `${rows.length.toLocaleString()} records processed. Low-confidence records are in Needs Review.`
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Batch processing stopped unexpectedly."
      );
    } finally {
      setProcessingProgress(null);
      setProcessingMessage("");
    }
  };

  const openRecord = (recordId: string) => {
    setSelectedRecordId(recordId);
    setActiveView("review");
  };

  const exportBatch = async (format: "csv" | "json") => {
    if (!activeBatch)
      return toast.error("Process a batch before exporting records.");
    const result = await exportQuery.refetch();
    const data = result.data ?? [];
    if (format === "json") {
      download(
        "traceforge-enriched-records.json",
        JSON.stringify(data, null, 2),
        "application/json"
      );
    } else {
      const headers = [
        "MPN",
        "Manufacturer",
        "Brand",
        "Classpath",
        "Confidence",
        "Review status",
        "Attributes",
        "Validation issues",
      ];
      const rows = data.map(record => [
        record.mfgPartNum,
        record.manufacturer,
        record.brand,
        record.classpath,
        record.recordConfidence,
        record.reviewStatus,
        record.attributes
          .map(attribute => `${attribute.field}: ${attribute.value ?? ""}`)
          .join(" | "),
        record.validation
          .map(issue => `${issue.severity}: ${issue.code}`)
          .join(" | "),
      ]);
      download(
        "traceforge-enriched-records.csv",
        [headers, ...rows].map(row => row.map(csvEscape).join(",")).join("\n"),
        "text/csv"
      );
    }
  };

  const exportUnihackDelivery = async () => {
    if (!activeBatch)
      return toast.error(
        "Process a batch before exporting the UniHack delivery file."
      );
    const result = await unihackDeliveryQuery.refetch();
    const rows = result.data ?? [];
    download(
      "Unihack_ExpectedOutput-DeliveryFormat.csv",
      [
        UNIHACK_DELIVERY_HEADERS,
        ...rows.map(row =>
          UNIHACK_DELIVERY_HEADERS.map(header => row[header] ?? "")
        ),
      ]
        .map(row => row.map(csvEscape).join(","))
        .join("\n"),
      "text/csv"
    );
    toast.success(
      `Created a ${UNIHACK_DELIVERY_HEADERS.length}-column UniHack delivery file for ${rows.length.toLocaleString()} records.`
    );
  };

  const detail = detailQuery.data;

  return (
    <div className="min-h-screen bg-[#f6f7f5] text-slate-900 selection:bg-teal-100 selection:text-teal-950">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[252px] border-r border-slate-200/80 bg-[#fbfcfa] lg:block">
        <div className="flex h-full flex-col px-4 py-5">
          <button
            onClick={() => setActiveView("overview")}
            className="flex items-center gap-3 px-2 text-left"
          >
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white shadow-sm">
              <Network className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.03em]">
                TraceForge
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                Product intelligence
              </p>
            </div>
          </button>
          <div className="mt-9 px-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
              Workspace
            </p>
          </div>
          <nav className="mt-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`tf-nav-item ${active ? "tf-nav-item-active" : ""}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.id === "review" && reviewRecords.length > 0 ? (
                    <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-amber-100 px-1 text-[10px] font-bold text-amber-800">
                      {reviewRecords.length}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_8px_25px_-17px_rgba(15,23,42,0.35)]">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal-50 text-teal-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Constraint-first</p>
                <p className="text-[10px] text-slate-500">No unverified copy</p>
              </div>
            </div>
            <Separator className="my-3" />
            <p className="text-[11px] leading-4 text-slate-500">
              Every output field is linked to raw input, a controlled rule, or a
              manufacturer document.
            </p>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:pl-[252px]">
        <header className="sticky top-0 z-20 flex h-[70px] items-center justify-between border-b border-slate-200/80 bg-[#f6f7f5]/90 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-white lg:hidden">
              <Network className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[-0.02em]">
                {navItems.find(item => item.id === activeView)?.label}
              </p>
              <p className="text-[11px] text-slate-500">
                Industrial abrasives catalogue workspace
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700 sm:block">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
              Rules engine online
            </span>
            <Button
              size="sm"
              className="h-9 bg-slate-950 px-3.5 text-xs hover:bg-slate-800"
              onClick={() => setActiveView("intake")}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New intake
            </Button>
          </div>
        </header>

        <div className="mx-auto max-w-[1580px] px-5 py-7 sm:px-8 lg:px-10">
          {activeView === "overview" && (
            <section className="space-y-7">
              <div className="tf-hero overflow-hidden rounded-[26px] p-7 sm:p-9">
                <div className="relative z-10 max-w-2xl">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-teal-100">
                    <Sparkles className="h-3 w-3" />
                    Evidence-first enrichment
                  </div>
                  <h1 className="max-w-xl text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
                    Industrial product data, ready to defend.
                  </h1>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
                    TraceForge transforms abbreviated catalogue rows into
                    validated product intelligence—with a provenance trail that
                    tells your team exactly why every value is there.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Button
                      onClick={() => setActiveView("intake")}
                      className="bg-white text-slate-950 hover:bg-slate-100"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Start an intake
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveView("review")}
                      className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                    >
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Review confidence
                    </Button>
                  </div>
                </div>
                <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl" />
                <div className="absolute bottom-0 right-8 hidden w-[360px] rounded-t-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur sm:block">
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                    <span>Integrity snapshot</span>
                    <BadgeCheck className="h-4 w-4 text-teal-300" />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xl font-semibold text-white">
                        {currentMetrics?.validationRate ?? 0}%
                      </p>
                      <p className="text-[10px] text-slate-400">Validation</p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-white">
                        {currentMetrics?.lovComplianceRate ?? 0}%
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Rule compliant
                      </p>
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-white">
                        {currentMetrics?.reviewQueueCount ?? 0}
                      </p>
                      <p className="text-[10px] text-slate-400">Needs review</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Validated records"
                  value={`${currentMetrics?.validationRate ?? 0}%`}
                  detail={
                    activeBatch
                      ? `${activeBatch.processedRows.toLocaleString()} processed in latest batch`
                      : "Run an intake to establish baseline"
                  }
                  icon={BadgeCheck}
                  tone="teal"
                />
                <MetricCard
                  label="Review queue"
                  value={`${currentMetrics?.reviewQueueCount ?? 0}`}
                  detail="Low confidence or conflicting records"
                  icon={ClipboardCheck}
                  tone="amber"
                />
                <MetricCard
                  label="LOV compliance"
                  value={`${currentMetrics?.lovComplianceRate ?? 0}%`}
                  detail="Configured attribute rules satisfied"
                  icon={BookOpenCheck}
                  tone="violet"
                />
                <MetricCard
                  label="Throughput"
                  value={`${currentMetrics?.throughput ?? 0}`}
                  detail="Records per second; deterministic pipeline"
                  icon={Gauge}
                  tone="slate"
                />
              </div>
              <div className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
                <Card className="tf-card">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-base">
                        Latest processing activity
                      </CardTitle>
                      <CardDescription className="mt-1.5">
                        Batch-level status and exception visibility.
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => setActiveView("records")}
                    >
                      Open records <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {activeBatch ? (
                      <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {activeBatch.sourceName}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {activeBatch.totalRows.toLocaleString()} source
                              rows ·{" "}
                              {activeBatch.processedRows.toLocaleString()}{" "}
                              processed · {activeBatch.failedRows} errors
                            </p>
                          </div>
                          <StatusPill status={activeBatch.status} />
                        </div>
                        <Progress
                          value={
                            activeBatch.totalRows
                              ? (activeBatch.processedRows /
                                  activeBatch.totalRows) *
                                100
                              : 0
                          }
                          className="mt-4 h-1.5"
                        />
                      </div>
                    ) : (
                      <div className="tf-empty-state">
                        <Database className="h-5 w-5" />
                        <p>No batch processed yet.</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveView("intake")}
                        >
                          Bring in product data
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="tf-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Control plane</CardTitle>
                    <CardDescription className="mt-1.5">
                      Configured safeguards before content is exported.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {controlPlane.map(({ title, detail, icon: Icon }) => (
                      <div key={title} className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-700">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold">{title}</p>
                          <p className="text-[11px] text-slate-500">{detail}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {activeView === "intake" && (
            <section className="space-y-6">
              <div className="max-w-3xl">
                <p className="tf-eyebrow">Intake studio</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">
                  Bring raw supplier data under control.
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Use the UniHack six-column CSV format for batch processing, or
                  test a single row before it enters the reviewer workflow.
                  Placeholder values are converted to null at the boundary and
                  never appear downstream.
                </p>
              </div>
              <Tabs defaultValue="batch" className="w-full">
                <TabsList className="h-10 rounded-xl bg-slate-200/70 p-1">
                  <TabsTrigger
                    value="batch"
                    className="rounded-lg px-4 text-xs"
                  >
                    Batch CSV
                  </TabsTrigger>
                  <TabsTrigger
                    value="single"
                    className="rounded-lg px-4 text-xs"
                  >
                    Single record
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="batch" className="mt-5">
                  <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="tf-card">
                      <CardHeader>
                        <CardTitle className="text-base">CSV intake</CardTitle>
                        <CardDescription className="mt-1.5">
                          Expected columns: Mfg_Part_Num, Part_Desc, E1_Brand,
                          Unilog_Brand, DIB_Brand, Part_Manuf.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <input
                          ref={fileRef}
                          type="file"
                          accept=".csv,text/csv"
                          className="hidden"
                          onChange={event =>
                            void handleFile(event.target.files?.[0])
                          }
                        />
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="tf-dropzone"
                        >
                          <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
                            <FileSpreadsheet className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">
                              Drop a catalogue CSV here
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              or choose a file from your computer · maximum
                              1,000 rows
                            </p>
                          </div>
                          <ArrowUpRight className="ml-auto h-4 w-4 text-slate-400" />
                        </button>
                        {parsedRows.length > 0 && (
                          <div className="mt-5 rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                            <div className="flex items-center gap-3">
                              <BadgeCheck className="h-5 w-5 text-teal-600" />
                              <div>
                                <p className="text-sm font-semibold text-teal-950">
                                  {parsedRows.length.toLocaleString()} rows
                                  ready
                                </p>
                                <p className="text-xs text-teal-800/70">
                                  Placeholder brands will be nulled, then rules
                                  will parse attributes and route uncertainty.
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                className="bg-slate-950 text-xs hover:bg-slate-800"
                                disabled={processingProgress !== null}
                                onClick={() =>
                                  void processRows(parsedRows, sourceName)
                                }
                              >
                                {processingProgress !== null ? (
                                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Play className="mr-1.5 h-3.5 w-3.5" />
                                )}
                                {processingProgress !== null
                                  ? "Processing"
                                  : "Process batch"}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs"
                                onClick={() => setParsedRows([])}
                              >
                                Clear selection
                              </Button>
                            </div>
                          </div>
                        )}
                        {processingProgress !== null && (
                          <div className="mt-5">
                            <div className="mb-2 flex justify-between text-xs text-slate-500">
                              <span>{processingMessage}</span>
                              <span>{processingProgress}%</span>
                            </div>
                            <Progress
                              value={processingProgress}
                              className="h-2"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="tf-card">
                      <CardHeader>
                        <CardTitle className="text-base">
                          Boundary checks
                        </CardTitle>
                        <CardDescription className="mt-1.5">
                          A transparent preflight runs before persistence.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {[
                          [
                            "1",
                            "Schema match",
                            "Rejects malformed headers and empty files.",
                          ],
                          [
                            "2",
                            "Null normalization",
                            "Supplier placeholders are converted to blank values.",
                          ],
                          [
                            "3",
                            "Row diagnostics",
                            "A missing Part_Desc becomes a row-level error, not silent data loss.",
                          ],
                          [
                            "4",
                            "Traceable processing",
                            "Every accepted field retains a rule and evidence path.",
                          ],
                        ].map(([step, title, detail]) => (
                          <div className="flex gap-3" key={title}>
                            <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                              {step}
                            </div>
                            <div>
                              <p className="text-xs font-semibold">{title}</p>
                              <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                                {detail}
                              </p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="single" className="mt-5">
                  <Card className="tf-card mb-5 border-dashed bg-slate-50/60">
                    <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_auto] lg:items-end">
                      <div>
                        <Label className="tf-label">
                          Paste one raw source row
                        </Label>
                        <Textarea
                          rows={2}
                          value={rawRowPaste}
                          onChange={event => setRawRowPaste(event.target.value)}
                          placeholder="Comma-separated or tab-separated values in UniHack input order…"
                          className="tf-input mt-1.5 resize-none"
                        />
                        <p
                          className={`mt-1.5 text-[11px] ${pasteError ? "text-rose-600" : "text-slate-500"}`}
                        >
                          {pasteError ??
                            "Order: MPN, description, E1 brand, Unilog brand, DIB brand, supplier manufacturer."}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="h-9 text-xs"
                        onClick={applyRawRowPaste}
                      >
                        <Send className="mr-1.5 h-3.5 w-3.5" />
                        Apply row
                      </Button>
                    </CardContent>
                  </Card>
                  <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                    <Card className="tf-card">
                      <CardHeader>
                        <CardTitle className="text-base">
                          Single-record sandbox
                        </CardTitle>
                        <CardDescription className="mt-1.5">
                          A safe preview does not persist until you run a batch.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label className="tf-label">
                            Manufacturer part number
                          </Label>
                          <Input
                            value={inputRow.Mfg_Part_Num ?? ""}
                            onChange={event =>
                              setInputRow(current => ({
                                ...current,
                                Mfg_Part_Num: event.target.value,
                              }))
                            }
                            className="tf-input mt-1.5"
                          />
                        </div>
                        <div>
                          <Label className="tf-label">
                            Supplier manufacturer
                          </Label>
                          <Input
                            value={inputRow.Part_Manuf ?? ""}
                            onChange={event =>
                              setInputRow(current => ({
                                ...current,
                                Part_Manuf: event.target.value,
                              }))
                            }
                            className="tf-input mt-1.5"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="tf-label">
                            Raw part description
                          </Label>
                          <Textarea
                            rows={4}
                            value={inputRow.Part_Desc ?? ""}
                            onChange={event =>
                              setInputRow(current => ({
                                ...current,
                                Part_Desc: event.target.value,
                              }))
                            }
                            className="tf-input mt-1.5 resize-none"
                          />
                        </div>
                        <div>
                          <Label className="tf-label">
                            E1 brand (optional)
                          </Label>
                          <Input
                            value={inputRow.E1_Brand ?? ""}
                            onChange={event =>
                              setInputRow(current => ({
                                ...current,
                                E1_Brand: event.target.value,
                              }))
                            }
                            className="tf-input mt-1.5"
                          />
                        </div>
                        <div>
                          <Label className="tf-label">
                            Unilog brand (optional)
                          </Label>
                          <Input
                            value={inputRow.Unilog_Brand ?? ""}
                            onChange={event =>
                              setInputRow(current => ({
                                ...current,
                                Unilog_Brand: event.target.value,
                              }))
                            }
                            className="tf-input mt-1.5"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Button
                            onClick={() => previewMutation.mutate(inputRow)}
                            disabled={previewMutation.isPending}
                            className="mt-2 bg-slate-950 hover:bg-slate-800"
                          >
                            {previewMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <WandSparkles className="mr-2 h-4 w-4" />
                            )}
                            Generate validated preview
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="tf-card">
                      <CardHeader>
                        <CardTitle className="text-base">
                          Preview result
                        </CardTitle>
                        <CardDescription className="mt-1.5">
                          Only validated, deterministic content is rendered
                          below.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {preview ? (
                          <div className="space-y-4">
                            <div>
                              <p className="tf-label">Product title</p>
                              <p className="mt-1.5 text-sm font-semibold leading-6 text-slate-900">
                                {(preview as any).descriptions.productTitle}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="tf-label">Confidence</p>
                                <p className="mt-1 text-xl font-semibold">
                                  {(preview as any).confidence.score}%
                                </p>
                              </div>
                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="tf-label">Review state</p>
                                <div className="mt-2">
                                  <StatusPill
                                    status={(preview as any).reviewStatus}
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {(preview as any).attributes
                                .slice(0, 5)
                                .map((attribute: any) => (
                                  <div
                                    key={attribute.fieldKey}
                                    className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs"
                                  >
                                    <span className="text-slate-500">
                                      {attribute.label}
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                      {attribute.normalizedValue ?? "—"}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ) : (
                          <div className="tf-empty-state min-h-[250px]">
                            <WandSparkles className="h-5 w-5" />
                            <p>
                              Run the sample row to inspect parser output,
                              rationale, and description rules.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </section>
          )}

          {activeView === "records" && (
            <section className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="tf-eyebrow">Batch explorer</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">
                    Product records
                  </h1>
                  <p className="mt-3 text-sm text-slate-500">
                    Filter the latest batch, inspect validation states, and open
                    a traceable record review.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => void exportBatch("csv")}
                  >
                    <ArrowDownToLine className="mr-1.5 h-3.5 w-3.5" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => void exportBatch("json")}
                  >
                    <ArrowDownToLine className="mr-1.5 h-3.5 w-3.5" />
                    JSON
                  </Button>
                  <Button
                    size="sm"
                    className="h-9 bg-slate-950 text-xs hover:bg-slate-800"
                    onClick={() => void exportUnihackDelivery()}
                  >
                    <FileCheck2 className="mr-1.5 h-3.5 w-3.5" />
                    UniHack Delivery CSV
                  </Button>
                </div>
              </div>
              <Card className="tf-card overflow-hidden">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={recordFilter}
                      onChange={event => setRecordFilter(event.target.value)}
                      placeholder="Filter by MPN, brand, status…"
                      className="h-9 border-slate-200 bg-slate-50 pl-9 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Filter className="h-3.5 w-3.5" />
                    {filteredRecords.length} of {records.length} records
                  </div>
                </div>
                <ScrollArea className="w-full">
                  <table className="min-w-[1050px] w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60 text-left">
                        <th className="tf-th">Product</th>
                        <th className="tf-th">Identity resolution</th>
                        <th className="tf-th">Classification</th>
                        <th className="tf-th">Confidence</th>
                        <th className="tf-th">Review</th>
                        <th className="tf-th"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map(record => (
                        <tr
                          key={record.id}
                          className="group border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                        >
                          <td className="tf-td">
                            <p className="font-semibold text-slate-800">
                              {record.mfgPartNum ?? "No MPN"}
                            </p>
                            <p className="mt-1 max-w-[310px] truncate text-xs text-slate-500">
                              {record.rawDescription}
                            </p>
                          </td>
                          <td className="tf-td">
                            <p className="text-xs font-semibold">
                              {record.brand ?? "Unresolved"}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-500">
                              {record.matchMethod} · {record.matchScore}%
                            </p>
                          </td>
                          <td className="tf-td">
                            <p className="max-w-[210px] text-xs leading-5 text-slate-600">
                              {record.classpath ?? "Needs category review"}
                            </p>
                          </td>
                          <td className="tf-td">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className="h-full rounded-full bg-teal-500"
                                  style={{
                                    width: `${record.recordConfidence}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs font-semibold">
                                {record.recordConfidence}%
                              </span>
                            </div>
                          </td>
                          <td className="tf-td">
                            <StatusPill status={record.reviewStatus} />
                          </td>
                          <td className="tf-td text-right">
                            <Button
                              onClick={() => openRecord(record.id)}
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs text-slate-600 hover:text-slate-950"
                            >
                              Inspect{" "}
                              <ChevronRight className="ml-1 h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {!filteredRecords.length && (
                        <tr>
                          <td colSpan={6}>
                            <div className="tf-empty-state py-14">
                              <FileCheck2 className="h-5 w-5" />
                              <p>
                                No matching records. Process a batch or change
                                the filter.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </ScrollArea>
              </Card>
              {errors.length > 0 && (
                <Card className="border-amber-100 bg-amber-50/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm text-amber-950">
                      <CircleAlert className="h-4 w-4 text-amber-600" />
                      Row-level errors ({errors.length})
                    </CardTitle>
                    <CardDescription>
                      Each failed input row is preserved with its reason; no
                      failures are silently dropped.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {errors.slice(0, 5).map(error => (
                      <div
                        className="flex justify-between gap-4 rounded-lg bg-white/70 px-3 py-2 text-xs"
                        key={error.id}
                      >
                        <span>
                          Row {error.sourceRow} · {error.mfgPartNum ?? "No MPN"}
                        </span>
                        <span className="text-slate-500">{error.reason}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </section>
          )}

          {activeView === "review" && (
            <section className="space-y-6">
              <div>
                <p className="tf-eyebrow">Human-in-the-loop assurance</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">
                  Review workspace
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                  Approve, edit, or flag individual fields while preserving
                  original, proposed, and approved values in the audit trail.
                </p>
              </div>
              {!selectedRecordId && (
                <div className="grid gap-4 lg:grid-cols-2">
                  {reviewRecords.length ? (
                    reviewRecords.slice(0, 8).map(record => (
                      <button
                        onClick={() => setSelectedRecordId(record.id)}
                        key={record.id}
                        className="tf-review-select text-left"
                      >
                        <div>
                          <p className="text-sm font-semibold">
                            {record.mfgPartNum ?? "No MPN"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {record.rawDescription}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusPill status={record.reviewStatus} />
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <Card className="tf-card lg:col-span-2">
                      <CardContent className="tf-empty-state py-16">
                        <ClipboardCheck className="h-6 w-6" />
                        <p>
                          No unresolved records in the latest batch. Process a
                          batch or inspect a product record.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveView("intake")}
                        >
                          Open intake
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
              {selectedRecordId && (
                <div className="space-y-5">
                  <button
                    className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900"
                    onClick={() => setSelectedRecordId(null)}
                  >
                    <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                    Back to queue
                  </button>
                  {detailQuery.isLoading ? (
                    <Card className="tf-card">
                      <CardContent className="tf-empty-state py-20">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <p>Loading provenance graph…</p>
                      </CardContent>
                    </Card>
                  ) : detail ? (
                    <div className="grid gap-5 2xl:grid-cols-[1.32fr_0.88fr]">
                      <div className="space-y-5">
                        <Card className="tf-card">
                          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                            <div>
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">
                                  {detail.record.mfgPartNum ??
                                    "Unidentified part"}
                                </CardTitle>
                                <StatusPill
                                  status={detail.record.reviewStatus}
                                />
                              </div>
                              <CardDescription className="mt-2 max-w-2xl leading-5">
                                {detail.record.rawDescription}
                              </CardDescription>
                            </div>
                            <div className="rounded-xl bg-slate-950 px-3 py-2 text-center text-white">
                              <p className="text-lg font-semibold leading-none">
                                {detail.record.recordConfidence}%
                              </p>
                              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                                Confidence
                              </p>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-3 sm:grid-cols-3">
                              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                                <p className="tf-label">Canonical brand</p>
                                <p className="mt-1.5 text-sm font-semibold">
                                  {detail.record.brand ?? "Unresolved"}
                                </p>
                                <p className="mt-1 text-[11px] text-slate-500">
                                  {detail.record.matchMethod} match ·{" "}
                                  {detail.record.matchScore}%
                                </p>
                              </div>
                              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                                <p className="tf-label">Category</p>
                                <p className="mt-1.5 text-xs font-semibold leading-5">
                                  {detail.record.classpath ?? "Unresolved"}
                                </p>
                              </div>
                              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                                <p className="tf-label">Input manufacturer</p>
                                <p className="mt-1.5 text-xs font-semibold leading-5">
                                  {cleanDisplay(detail.record.rawManufacturer)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="tf-card">
                          <CardHeader>
                            <CardTitle className="text-base">
                              Validated attributes
                            </CardTitle>
                            <CardDescription className="mt-1.5">
                              Actions persist an immutable audit event and
                              retain all three field states.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {detail.attributes.map(attribute => (
                              <div
                                key={attribute.id}
                                className="rounded-xl border border-slate-100 p-4"
                              >
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-semibold">
                                        {attribute.label}
                                      </p>
                                      <StatusPill
                                        status={attribute.fieldState}
                                      />
                                    </div>
                                    <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                                      <div>
                                        <p className="tf-label">Original</p>
                                        <p className="mt-1 text-slate-600">
                                          {cleanDisplay(attribute.rawValue)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="tf-label">Proposed</p>
                                        <p className="mt-1 font-semibold text-slate-900">
                                          {cleanDisplay(
                                            attribute.normalizedValue
                                          )}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="tf-label">Approved</p>
                                        <p className="mt-1 text-slate-600">
                                          {cleanDisplay(
                                            detail.approvals.find(
                                              approval =>
                                                approval.fieldKey ===
                                                  attribute.fieldKey &&
                                                approval.approvedValue
                                            )?.approvedValue
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex shrink-0 gap-1.5">
                                    <Button
                                      disabled={reviewMutation.isPending}
                                      size="sm"
                                      className="h-8 bg-slate-950 px-2.5 text-[11px] hover:bg-slate-800"
                                      onClick={() =>
                                        reviewMutation.mutate({
                                          recordId: detail.record.id,
                                          fieldKey: attribute.fieldKey,
                                          action: "approve",
                                        })
                                      }
                                    >
                                      <Check className="mr-1 h-3 w-3" />
                                      Approve
                                    </Button>
                                    <Button
                                      disabled={reviewMutation.isPending}
                                      size="sm"
                                      variant="outline"
                                      className="h-8 px-2.5 text-[11px]"
                                      onClick={() => {
                                        const value = window.prompt(
                                          `Edit ${attribute.label}`,
                                          attribute.normalizedValue ?? ""
                                        );
                                        if (value !== null)
                                          reviewMutation.mutate({
                                            recordId: detail.record.id,
                                            fieldKey: attribute.fieldKey,
                                            action: "edit",
                                            approvedValue: value,
                                            note: "Edited in reviewer workspace",
                                          });
                                      }}
                                    >
                                      <MoreHorizontal className="mr-1 h-3 w-3" />
                                      Edit
                                    </Button>
                                    <Button
                                      disabled={reviewMutation.isPending}
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 px-2 text-[11px] text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                                      onClick={() =>
                                        reviewMutation.mutate({
                                          recordId: detail.record.id,
                                          fieldKey: attribute.fieldKey,
                                          action: "flag",
                                          note: "Flagged for verification",
                                        })
                                      }
                                    >
                                      <CircleAlert className="mr-1 h-3 w-3" />
                                      Flag
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                        <Card className="tf-card">
                          <CardHeader>
                            <CardTitle className="text-base">
                              Deterministic description outputs
                            </CardTitle>
                            <CardDescription className="mt-1.5">
                              These fields are built from the currently
                              validated attribute values only.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="grid gap-3 sm:grid-cols-2">
                            {Object.entries(detail.descriptions).map(
                              ([field, value]) => (
                                <div
                                  key={field}
                                  className="rounded-xl bg-slate-50 p-3"
                                >
                                  <p className="tf-label">
                                    {field.replace(/([A-Z])/g, " $1")}
                                  </p>
                                  <p className="mt-1.5 text-xs leading-5 text-slate-700">
                                    {value || "—"}
                                  </p>
                                </div>
                              )
                            )}
                          </CardContent>
                        </Card>
                      </div>
                      <div className="space-y-5">
                        <Card className="tf-card">
                          <CardHeader>
                            <CardTitle className="text-base">
                              Why this score?
                            </CardTitle>
                            <CardDescription className="mt-1.5">
                              Confidence is explicit, not a black box.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {detail.confidenceExplanation.map(
                              (reason, index) => (
                                <div className="flex gap-3" key={reason}>
                                  <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal-50 text-[10px] font-bold text-teal-700">
                                    {index + 1}
                                  </div>
                                  <p className="text-xs leading-5 text-slate-600">
                                    {reason}
                                  </p>
                                </div>
                              )
                            )}
                          </CardContent>
                        </Card>
                        <Card className="tf-card">
                          <CardHeader>
                            <CardTitle className="text-base">
                              Field evidence
                            </CardTitle>
                            <CardDescription className="mt-1.5">
                              Every populated value carries a source chain.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {detail.attributes.map(attribute => (
                              <div
                                className="rounded-xl border border-slate-100 p-3"
                                key={attribute.id}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-semibold">
                                    {attribute.label}
                                  </p>
                                  <Badge
                                    variant="secondary"
                                    className="bg-slate-100 text-[10px] font-medium text-slate-600"
                                  >
                                    {attribute.evidenceSourceType.replaceAll(
                                      "_",
                                      " "
                                    )}
                                  </Badge>
                                </div>
                                <p className="mt-2 text-[11px] leading-4 text-slate-500">
                                  “{attribute.excerpt}”
                                </p>
                                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                                  <span>{attribute.extractionMethod}</span>
                                  {attribute.sourceUrl ? (
                                    <a
                                      href={attribute.sourceUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800"
                                    >
                                      Source{" "}
                                      <ArrowUpRight className="h-3 w-3" />
                                    </a>
                                  ) : (
                                    <span>Input record</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                        <Card className="tf-card">
                          <CardHeader>
                            <CardTitle className="text-base">
                              Validation and audit log
                            </CardTitle>
                            <CardDescription className="mt-1.5">
                              Exceptions remain visible; reviewer changes are
                              append-only.
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {detail.issues.map(issue => (
                              <div
                                className="flex gap-2 text-xs"
                                key={issue.id}
                              >
                                <StatusPill status={issue.severity} />
                                <p className="leading-5 text-slate-600">
                                  {issue.message}
                                </p>
                              </div>
                            ))}
                            <Separator className="my-3" />
                            {detail.audit.map(event => (
                              <div key={event.id} className="flex gap-3">
                                <Clock3 className="mt-0.5 h-3.5 w-3.5 text-slate-400" />
                                <div>
                                  <p className="text-xs font-semibold capitalize">
                                    {event.action}{" "}
                                    <span className="font-normal text-slate-400">
                                      by {event.actor}
                                    </span>
                                  </p>
                                  <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                                    {event.note ??
                                      [
                                        event.originalValue,
                                        event.proposedValue,
                                        event.approvedValue,
                                      ]
                                        .filter(Boolean)
                                        .join(" → ")}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ) : (
                    <Card className="tf-card">
                      <CardContent className="tf-empty-state py-20">
                        <AlertCircle className="h-5 w-5" />
                        <p>The requested record is unavailable.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </section>
          )}

          {activeView === "evaluation" && (
            <section className="space-y-6">
              <div>
                <p className="tf-eyebrow">Measurement, not magic</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em]">
                  Evaluation report
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                  This view separates measured processing-quality metrics from
                  model accuracy. The supplied labelled 200-row
                  input-versus-output workbook is not present in the current
                  workspace, so accuracy metrics remain intentionally unreported
                  rather than inferred.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Labelled records"
                  value="Awaiting"
                  detail="Upload the 200-row ground truth workbook to calculate accuracy."
                  icon={FileSpreadsheet}
                  tone="amber"
                />
                <MetricCard
                  label="Batch validation"
                  value={`${currentMetrics?.validationRate ?? 0}%`}
                  detail="Latest processed batch; deterministic constraint gate."
                  icon={BadgeCheck}
                  tone="teal"
                />
                <MetricCard
                  label="Attribute compliance"
                  value={`${currentMetrics?.lovComplianceRate ?? 0}%`}
                  detail="Configured parser/normalizer validation coverage."
                  icon={BookOpenCheck}
                  tone="violet"
                />
                <MetricCard
                  label="Known exceptions"
                  value={`${currentMetrics?.reviewQueueCount ?? 0}`}
                  detail="Records still requiring human confirmation."
                  icon={CircleAlert}
                  tone="amber"
                />
              </div>
              <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <Card className="tf-card">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Per-field evaluation framework
                    </CardTitle>
                    <CardDescription className="mt-1.5">
                      Accuracy will be reported with denominators once the
                      labelled delivery-format workbook is supplied.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="tf-th">Field group</th>
                          <th className="tf-th">Metric</th>
                          <th className="tf-th">Current state</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          [
                            "Canonical identity",
                            "Exact normalized match",
                            "Awaiting labels",
                          ],
                          [
                            "Abrasives attributes",
                            "Per-attribute exact / normalized match",
                            "Awaiting labels",
                          ],
                          [
                            "Description compliance",
                            "Character, casing, validated-value gate",
                            "Live rule checks",
                          ],
                          [
                            "Provenance",
                            "Populated fields with evidence",
                            "Live field evidence",
                          ],
                        ].map(([field, metric, state]) => (
                          <tr
                            key={field}
                            className="border-b border-slate-100 last:border-0"
                          >
                            <td className="tf-td font-semibold">{field}</td>
                            <td className="tf-td text-slate-500">{metric}</td>
                            <td className="tf-td">
                              <Badge
                                variant="secondary"
                                className={
                                  state === "Awaiting labels"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-teal-50 text-teal-700"
                                }
                              >
                                {state}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
                <Card className="tf-card">
                  <CardHeader>
                    <CardTitle className="text-base">
                      Documented limitations
                    </CardTitle>
                    <CardDescription className="mt-1.5">
                      Transparent scope is a quality feature.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      [
                        "Ground truth unavailable",
                        "The 200-row labelled workbook and 252-column output definition were described in guidance but not attached to this workspace.",
                      ],
                      [
                        "Demo master subset",
                        "Manufacturer/brand resolution currently uses a transparent representative fallback set until the 27,000-row approved list is ingested.",
                      ],
                      [
                        "Source hierarchy",
                        "Manufacturer documentation is connected for representative items; unmatched records retain input evidence and route to review rather than being enriched from third-party listings.",
                      ],
                    ].map(([title, text]) => (
                      <div
                        className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                        key={title}
                      >
                        <div className="flex gap-2">
                          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />
                          <div>
                            <p className="text-xs font-semibold">{title}</p>
                            <p className="mt-1 text-[11px] leading-4 text-slate-500">
                              {text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
