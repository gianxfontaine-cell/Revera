"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleHelp,
  FileCheck2,
  FileText,
  Fingerprint,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type UploadKey = "denialLetter" | "clinicalNotes";
type DenialDetails = {
  patientName: string;
  dateOfService: string;
  cptCode: string;
  payerName: string;
  denialReason: string;
};
type UploadFile = { file: File; name: string; size: string };

const slots: Array<{
  key: UploadKey;
  title: string;
  description: string;
  accent: string;
}> = [
  {
    key: "denialLetter",
    title: "Denial letter",
    description: "The payer’s decision and reason for denial",
    accent: "bg-amber-50 text-amber-700",
  },
  {
    key: "clinicalNotes",
    title: "Clinical notes",
    description: "Supporting documentation for the requested care",
    accent: "bg-teal-50 text-teal-700",
  },
];

function formatFileSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadCard({
  type,
  file,
  onFile,
  onRemove,
  onInvalid,
}: {
  type: (typeof slots)[number];
  file?: UploadFile;
  onFile: (file: File) => void;
  onRemove: () => void;
  onInvalid: (message: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function acceptFile(candidate?: File) {
    if (!candidate) return;
    if (candidate.type !== "application/pdf" && !candidate.name.toLowerCase().endsWith(".pdf")) {
      onInvalid(`${type.title} must be a PDF file.`);
      return;
    }
    if (candidate.size > 2 * 1024 * 1024) {
      onInvalid(`${type.title} must be 2 MB or smaller.`);
      return;
    }
    if (candidate.size === 0) {
      onInvalid(`${type.title} is empty.`);
      return;
    }
    onFile(candidate);
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    acceptFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files[0]);
  }

  return (
    <div>
      <div className="mb-3 flex items-start gap-3">
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", type.accent)}>
          <FileText size={19} strokeWidth={1.8} />
        </div>
        <div className="pt-0.5">
          <p className="text-sm font-semibold text-slate-800">{type.title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{type.description}</p>
        </div>
        <span className="ml-auto mt-1 rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          PDF
        </span>
      </div>
      {file ? (
        <div className="flex min-h-[112px] items-center gap-3 rounded-xl border border-teal-100 bg-teal-50/50 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700 shadow-sm">
            <FileCheck2 size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
            <p className="mt-1 text-xs text-slate-500">{file.size} · Ready to process</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${type.title}`}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700"
          >
            <X size={17} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "group flex min-h-[112px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-4 text-center transition",
            dragging
              ? "border-teal-500 bg-teal-50"
              : "border-slate-300 bg-slate-50/50 hover:border-teal-500 hover:bg-teal-50/60",
          )}
        >
          <div className="mb-2 flex size-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm transition group-hover:text-teal-700">
            <Upload size={16} />
          </div>
          <p className="text-xs font-medium text-slate-700">
            <span className="text-teal-700">Click to upload</span> or drag and drop
          </p>
          <p className="mt-1 text-[11px] text-slate-400">PDF up to 2 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleInput}
            className="sr-only"
            aria-label={`Upload ${type.title} PDF`}
          />
        </div>
      )}
    </div>
  );
}

function downloadDocx(letter: string) {
  const paragraphs = letter.split(/\n+/).map(
    (line) =>
      new Paragraph({
        spacing: { after: 180, line: 300 },
        children: [new TextRun({ text: line || " ", size: 22, font: "Arial" })],
      }),
  );
  const document = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

  void Packer.toBlob(document).then((blob) => {
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = "revera-appeal-letter.docx";
    link.click();
    URL.revokeObjectURL(url);
  });
}

export default function Home() {
  const [files, setFiles] = useState<Partial<Record<UploadKey, UploadFile>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [letter, setLetter] = useState("");
  const [denialDetails, setDenialDetails] = useState<DenialDetails | null>(null);

  function setUploadedFile(key: UploadKey, file: File) {
    setError("");
    setLetter("");
    setDenialDetails(null);
    setFiles((current) => ({
      ...current,
      [key]: { file, name: file.name, size: formatFileSize(file.size) },
    }));
  }

  async function generateAppeal() {
    if (!files.denialLetter || !files.clinicalNotes) return;
    setLoading(true);
    setError("");
    setLetter("");
    setDenialDetails(null);
    try {
      const formData = new FormData();
      formData.append("denialLetter", files.denialLetter.file);
      formData.append("clinicalNotes", files.clinicalNotes.file);
      const response = await fetch("/api/generate", { method: "POST", body: formData });
      const result = (await response.json()) as {
        error?: string;
        letter?: string;
        denialDetails?: DenialDetails;
      };
      if (!response.ok) {
        throw new Error(result.error || "We couldn’t generate your appeal. Please try again.");
      }
      if (!result.letter || !result.denialDetails) {
        throw new Error("The response was incomplete. Please try again.");
      }
      setDenialDetails(result.denialDetails);
      setLetter(result.letter);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <a href="#" className="flex items-center gap-2.5" aria-label="Revera home">
            <span className="flex size-9 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm">
              <Plus size={23} strokeWidth={2.6} />
            </span>
            <span className="font-display text-[21px] font-bold tracking-[-0.06em] text-slate-900">revera</span>
          </a>

          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 sm:flex">
            <span className="size-1.5 rounded-full bg-teal-500" />
            <span className="text-xs font-medium text-slate-600">Appeals workspace</span>
            <ChevronDown size={13} className="ml-1 text-slate-400" />
          </div>

          <button
            type="button"
            className="flex items-center gap-2.5 rounded-full p-1 pr-2.5 transition hover:bg-slate-50"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-[#e9efed] text-xs font-bold text-teal-900">AM</span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-semibold text-slate-800">Alex Morgan</span>
              <span className="block text-[10px] text-slate-500">Billing team</span>
            </span>
            <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 pb-16 pt-10 sm:px-8 sm:pt-12 lg:px-12">
        <div className="mx-auto max-w-[1080px]">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Workspace</span>
              <span>/</span>
              <span className="font-medium text-slate-600">New appeal</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-[11px] font-semibold text-teal-800">
              <ShieldCheck size={14} />
              Secure document processing
            </div>
          </div>

          <section className="relative mb-8 overflow-hidden rounded-[26px] bg-[#123f3b] px-7 py-8 text-white shadow-[0_14px_44px_rgba(18,63,59,0.13)] sm:px-10 sm:py-9">
            <div className="subtle-grid pointer-events-none absolute inset-y-0 right-0 w-[42%] opacity-[0.14] [mask-image:linear-gradient(to_left,black,transparent)]" />
            <div className="absolute -right-10 -top-36 size-80 rounded-full border border-white/[0.07]" />
            <div className="absolute -right-1 -top-28 size-64 rounded-full border border-white/[0.07]" />
            <div className="relative z-10 max-w-[660px]">
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-teal-100">
                <Sparkles size={12} />
                AI-assisted workflow
              </div>
              <h1 className="font-display text-[30px] font-semibold leading-tight tracking-[-0.045em] sm:text-[36px]">
                Make every appeal <span className="text-[#98d6c8]">count.</span>
              </h1>
              <p className="mt-3 max-w-[520px] text-sm leading-6 text-teal-50/75">
                Bring the denial and the clinical story together. Revera helps your team prepare a clear, evidence-led appeal for review.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium text-teal-50/70">
                <span className="inline-flex items-center gap-1.5"><Check size={13} className="text-[#98d6c8]" /> Source-grounded drafts</span>
                <span className="inline-flex items-center gap-1.5"><Check size={13} className="text-[#98d6c8]" /> Clinician review required</span>
              </div>
            </div>
            <div className="absolute bottom-0 right-[8%] hidden h-[82%] w-[170px] items-end justify-center md:flex">
              <div className="mb-[-18px] flex h-[190px] w-[140px] rotate-[7deg] flex-col rounded-t-[18px] border border-white/20 bg-white/[0.08] p-4 shadow-2xl backdrop-blur-sm">
                <span className="flex size-7 items-center justify-center rounded-lg bg-[#98d6c8]/20 text-[#b7e9de]"><FileText size={15} /></span>
                <span className="mt-4 h-1.5 w-16 rounded-full bg-white/60" />
                <span className="mt-2 h-1 w-full rounded-full bg-white/20" />
                <span className="mt-1.5 h-1 w-[86%] rounded-full bg-white/20" />
                <span className="mt-1.5 h-1 w-[92%] rounded-full bg-white/20" />
                <span className="mt-4 h-1 w-full rounded-full bg-white/20" />
                <span className="mt-1.5 h-1 w-[72%] rounded-full bg-white/20" />
                <span className="mt-5 h-6 w-20 rounded-md border border-white/20 bg-white/[0.07]" />
              </div>
            </div>
          </section>

          <div className="grid items-start gap-6 lg:grid-cols-[1.12fr_0.88fr]">
            <Card className="overflow-hidden">
              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 sm:px-7">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-teal-50 text-[11px] font-bold text-teal-800">1</span>
                    <h2 className="font-display text-[17px] font-bold tracking-[-0.03em] text-slate-900">Add your documents</h2>
                  </div>
                  <p className="mt-1.5 pl-8 text-xs text-slate-500">Upload both PDFs to build your appeal draft.</p>
                </div>
                <button
                  type="button"
                  title="Documents are processed to create your appeal and are not displayed publicly."
                  className="mt-0.5 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Document privacy details"
                >
                  <CircleHelp size={17} />
                </button>
              </div>

              <div className="space-y-6 px-6 py-6 sm:px-7">
                {slots.map((slot) => (
                  <UploadCard
                    key={slot.key}
                    type={slot}
                    file={files[slot.key]}
                    onFile={(file) => setUploadedFile(slot.key, file)}
                    onInvalid={setError}
                    onRemove={() => {
                      setFiles((current) => {
                        const next = { ...current };
                        delete next[slot.key];
                        return next;
                      });
                      setLetter("");
                      setDenialDetails(null);
                    }}
                  />
                ))}

                {error && (
                  <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-800">
                    {error}
                  </div>
                )}

                <Button
                  onClick={generateAppeal}
                  disabled={!files.denialLetter || !files.clinicalNotes || loading}
                  className="h-12 w-full rounded-xl"
                >
                  {loading ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                      Reviewing documents…
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate appeal
                      <ArrowRight size={16} className="ml-1" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <LockKeyhole size={12} />
                  Your documents are encrypted in transit
                </div>
              </div>
            </Card>

            <Card className="min-h-[365px] overflow-hidden">
              <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 sm:px-7">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">2</span>
                    <h2 className="font-display text-[17px] font-bold tracking-[-0.03em] text-slate-900">Appeal draft</h2>
                  </div>
                  <p className="mt-1.5 pl-8 text-xs text-slate-500">Your generated letter will appear here.</p>
                </div>
                {letter && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-lg"
                    onClick={() => downloadDocx(letter)}
                    aria-label="Download appeal as DOCX"
                    title="Download as .docx"
                  >
                    <ArrowDownToLine size={17} />
                  </Button>
                )}
              </div>

              <div className="px-6 py-6 sm:px-7">
                {loading ? (
                  <div className="flex min-h-[255px] flex-col items-center justify-center text-center">
                    <div className="relative flex size-14 items-center justify-center">
                      <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-teal-100 border-t-teal-700" />
                      <Sparkles size={19} className="text-teal-700" />
                    </div>
                    <p className="mt-5 text-sm font-semibold text-slate-800">Building your appeal</p>
                    <p className="mt-1.5 max-w-[240px] text-xs leading-5 text-slate-500">
                      Cross-referencing the denial reason with the clinical notes…
                    </p>
                    <div className="mt-5 flex items-center gap-1.5">
                      <span className="size-1.5 animate-pulse rounded-full bg-teal-600" />
                      <span className="size-1.5 animate-pulse rounded-full bg-teal-600 [animation-delay:150ms]" />
                      <span className="size-1.5 animate-pulse rounded-full bg-teal-600 [animation-delay:300ms]" />
                    </div>
                  </div>
                ) : letter ? (
                  <div>
                    {denialDetails && (
                      <div className="mb-4 rounded-xl border border-teal-100 bg-teal-50/60 p-3.5">
                        <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-teal-800">
                          <BadgeCheck size={13} /> Extracted denial details
                        </div>
                        <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
                          <div><dt className="text-slate-500">Patient</dt><dd className="mt-0.5 truncate font-semibold text-slate-800">{denialDetails.patientName}</dd></div>
                          <div><dt className="text-slate-500">Payer</dt><dd className="mt-0.5 truncate font-semibold text-slate-800">{denialDetails.payerName}</dd></div>
                          <div><dt className="text-slate-500">Date of service</dt><dd className="mt-0.5 truncate font-semibold text-slate-800">{denialDetails.dateOfService}</dd></div>
                          <div><dt className="text-slate-500">CPT code</dt><dd className="mt-0.5 truncate font-semibold text-slate-800">{denialDetails.cptCode}</dd></div>
                        </dl>
                        <div className="mt-2 border-t border-teal-100 pt-2">
                          <dt className="text-[10px] text-slate-500">Denial reason</dt>
                          <dd className="mt-0.5 text-[11px] leading-4 text-slate-700">{denialDetails.denialReason}</dd>
                        </div>
                      </div>
                    )}
                    <div className="max-h-[420px] overflow-y-auto rounded-xl border border-slate-200 bg-[#fcfdfc] p-4 sm:p-5">
                      <pre className="whitespace-pre-wrap font-sans text-[12px] leading-[1.75] text-slate-700">{letter}</pre>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="flex items-center gap-1.5 text-[11px] text-amber-700">
                        <Fingerprint size={13} />
                        Review clinical accuracy before sending
                      </p>
                      <Button onClick={() => downloadDocx(letter)} className="h-9 rounded-lg px-3.5 text-xs">
                        <ArrowDownToLine size={14} />
                        Download .docx
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[255px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 text-center">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                      <FileText size={20} strokeWidth={1.6} />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-700">Your letter starts here</p>
                    <p className="mt-1.5 max-w-[230px] text-xs leading-5 text-slate-500">
                      Upload the denial and supporting notes, then generate your first draft.
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                      <Check size={12} /> Structured denial details
                      <span className="mx-1 text-slate-300">·</span>
                      <Check size={12} /> Evidence-led narrative
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-3 px-1 text-[11px] text-slate-400 sm:flex-row">
            <p>Revera supports your workflow. Every appeal should be reviewed by a qualified professional.</p>
            <div className="flex items-center gap-1.5"><ShieldCheck size={13} /> Built for thoughtful care advocacy</div>
          </div>
        </div>
      </main>
      <div className="sr-only" aria-live="polite">{loading ? "Generating appeal letter" : letter ? "Appeal letter ready" : ""}</div>
    </div>
  );
}
