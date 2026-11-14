"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import type { FormRecord } from "@/lib/forms/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type FormTab = "active" | "drafts";

const tabs: { id: FormTab; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "drafts", label: "Drafts" },
];

export function FormsManager({
  initialForms,
  initialError = "",
}: {
  initialForms: FormRecord[];
  initialError?: string;
}) {
  const router = useRouter();
  const [forms, setForms] = useState(initialForms);
  const [activeTab, setActiveTab] = useState<FormTab>("active");
  const [modalOpen, setModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForms(initialForms);
  }, [initialForms]);

  const visibleForms = forms.filter((form) => {
    if (activeTab === "drafts") return form.status === "draft";
    return form.status === "published";
  });
  const counts = {
    active: forms.filter((form) => form.status === "published").length,
    drafts: forms.filter((form) => form.status === "draft").length,
  };

  const closeModal = () => {
    if (creating) return;
    setModalOpen(false);
    setError("");
    setFormName("");
    setDescription("");
  };

  const handleModalChange = (open: boolean) => {
    if (open) {
      setError("");
      setModalOpen(true);
    } else {
      closeModal();
    }
  };

  const createForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    setError("");

    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formName,
          description,
        }),
      });
      const result: { form?: { id?: unknown }; error?: string } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok || typeof result.form?.id !== "string") {
        setError(result.error ?? "Could not create the form. Please try again.");
        setCreating(false);
        return;
      }

      router.push(`/form/${result.form.id}/edit`);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setCreating(false);
    }
  };

  const refreshForms = () => router.refresh();

  return (
    <Dialog open={modalOpen} onOpenChange={handleModalChange}>
    <div className="mx-auto w-full max-w-330">
      <header className="mb-8 flex items-center justify-between gap-7 max-[560px]:items-stretch max-[560px]:flex-col max-[560px]:gap-4.5">
        <div>
          <p className="mb-0 font-mono text-[.65rem] font-semibold tracking-[.11em] text-ink-soft uppercase">Workspace / Forms</p>
          <h1 className="my-2.5 mb-2.5 text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[.95] tracking-[-.075em] max-[560px]:text-[2.45rem]">Your forms</h1>
          <p className="m-0 max-w-[58ch] text-[.92rem] leading-[1.55] text-ink-soft">
            Build and manage forms in one place.
          </p>
        </div>
        <Button
          type="button"
          className="inline-flex min-h-10.5 items-center justify-center gap-2.25 rounded-[3px] border border-(--ink) bg-(--ink) px-3.75 py-2.5 font-sans text-[.8rem] font-semibold text-paper transition-[transform,color,background-color,border-color] duration-150 hover:-translate-y-px hover:border-(--accent) hover:bg-(--accent) disabled:cursor-not-allowed disabled:opacity-55"
          onClick={() => {
            setError("");
            setModalOpen(true);
          }}
        >
          <span aria-hidden="true">+</span>
          Create form
        </Button>
      </header>

      {initialError && (
        <div className="mb-5 flex items-center justify-between gap-4 border border-[color-mix(in_srgb,var(--accent)_40%,var(--line))] bg-[color-mix(in_srgb,var(--accent)_8%,var(--paper))] px-3.75 py-3.25 text-[.84rem] leading-[1.5] text-accent-dark" role="alert">
          <span>{initialError}</span>
          <Button
            type="button"
            variant="outline"
            className="inline-flex min-h-10.5 items-center justify-center gap-2.25 rounded-[3px] border border-(--ink) bg-transparent px-3.75 py-2.5 font-sans text-[.8rem] font-semibold text-ink transition-colors duration-150 hover:bg-(--paper-deep) disabled:cursor-not-allowed disabled:opacity-55"
            onClick={refreshForms}
          >
            Retry
          </Button>
        </div>
      )}

      <section className="border-t border-(--line)" aria-label="Forms">
        <div className="flex min-h-15.5 items-center justify-between gap-5 border-b border-(--line)">
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              if (value === "active" || value === "drafts") setActiveTab(value);
            }}
          >
          <TabsList className="h-15.5 gap-5.5 rounded-none bg-transparent p-0 max-[560px]:gap-3" variant="line" aria-label="Filter forms by status">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="relative inline-flex h-full flex-[0_0_auto] items-center justify-center gap-2 rounded-none border-0 bg-transparent px-0.5 py-0 text-[.82rem] font-semibold text-ink-soft data-[state=active]:text-ink after:absolute after:right-0 after:bottom-[-1px] after:left-0 after:h-0.5 after:bg-transparent after:content-[''] data-[state=active]:after:bg-(--accent) max-[560px]:gap-1.25 max-[560px]:text-[.74rem]"
              >
                {tab.label}
                <span className="min-w-5 rounded-[10px] bg-(--paper-deep) px-1.5 py-0.5 text-center font-mono text-[.64rem] text-ink-soft">{counts[tab.id]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          </Tabs>
          <span className="font-mono text-[.66rem] text-ink-soft uppercase">
            {visibleForms.length} {visibleForms.length === 1 ? "form" : "forms"}
          </span>
        </div>

        {visibleForms.length > 0 ? (
          <div className="grid grid-cols-3 gap-3.5 pt-5 max-[1100px]:grid-cols-2 max-[560px]:grid-cols-1">
            {visibleForms.map((form) => (
              <Card className="flex min-h-58 min-w-0 flex-col rounded-none border border-(--line) bg-[color-mix(in_srgb,var(--paper-deep)_50%,var(--paper))] px-4.5 pt-4.25 pb-0 ring-0 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent)_65%,var(--line))]" key={form.id}>
                <div className="flex items-center justify-between gap-3">
                  <Badge
                    variant={form.status === "published" ? "default" : "secondary"}
                    className={`inline-flex h-auto items-center gap-1.75 border-0 rounded-none bg-transparent px-1.5 py-0.75 font-mono text-[.62rem] tracking-[.06em] text-ink-soft uppercase ${form.status === "published" ? "text-[#26734d]" : ""}`}
                  >
                    <span className={`size-1.75 rounded-full ${form.status === "published" ? "bg-[#26734d]" : form.status === "draft" ? "bg-[#bd7b22]" : "bg-(--ink-soft)"}`} aria-hidden="true" />
                    {form.status}
                  </Badge>
                </div>
                <div className="flex-1 py-6.25 pb-5">
                  <h2 className="mb-2 overflow-hidden text-ellipsis whitespace-nowrap text-[1.08rem] font-semibold tracking-[-.04em]">{form.title}</h2>
                  <p className="m-0 line-clamp-2 text-[.78rem] leading-[1.5] text-ink-soft">{form.description || "No description added yet."}</p>
                </div>
                <div className="flex min-h-11.75 items-center justify-between gap-3 border-t border-(--line) font-mono text-[.62rem] text-ink-soft uppercase">
                  <span>{form.fields.length} questions</span>
                  <Button asChild variant="link" className="h-auto gap-2 p-0 font-sans text-[.72rem] font-semibold text-ink no-underline hover:bg-transparent hover:text-accent-dark hover:no-underline">
                    <Link href={`/form/${form.id}/edit`}>
                      Edit form <span aria-hidden="true">→</span>
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex min-h-70 flex-col items-center justify-center px-5 py-9.5 text-center">
            <span className="mb-3.75 grid size-11 place-items-center border border-(--line) bg-(--paper-deep) text-[1.3rem] text-accent" aria-hidden="true">
              ▤
            </span>
            <h2 className="mb-2 text-[1.1rem] tracking-[-.04em]">
              {activeTab === "drafts" ? "No drafts yet" : "No active forms yet"}
            </h2>
            <p className="mb-4.5 text-[.83rem] text-ink-soft">
              {activeTab === "drafts"
                ? "New forms stay as drafts until you publish them."
                : "Publish a form to make it active in your workspace."}
            </p>
            {activeTab === "drafts" && (
              <Button
                type="button"
                className="inline-flex min-h-10.5 items-center justify-center gap-2.25 rounded-[3px] border border-(--ink) bg-(--ink) px-3.75 py-2.5 font-sans text-[.8rem] font-semibold text-paper transition-[transform,color,background-color,border-color] duration-150 hover:-translate-y-px hover:border-(--accent) hover:bg-(--accent) disabled:cursor-not-allowed disabled:opacity-55"
                onClick={() => setModalOpen(true)}
              >
                Create a form
              </Button>
            )}
          </div>
        )}
      </section>

      <DialogContent
        className="m-0 max-h-[min(90dvh,760px)] w-[min(calc(100vw-32px),520px)] max-w-none overflow-y-auto rounded-none border border-(--line) bg-(--paper) p-6.5 text-ink max-[560px]:p-5.25"
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          nameInputRef.current?.focus();
        }}
      >
        <DialogHeader className="mb-5.75 flex items-start justify-between gap-5">
          <div>
            <p className="mb-0 font-mono text-[.65rem] font-semibold tracking-[.11em] text-ink-soft uppercase">New workspace item</p>
            <DialogTitle className="mt-2 text-[1.7rem] tracking-[-.06em]" id="create-form-title">Create a form</DialogTitle>
          </div>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-8.5 border border-(--line) bg-transparent text-[1.2rem] text-ink-soft hover:bg-(--paper-deep) hover:text-ink"
              aria-label="Close dialog"
              disabled={creating}
            >
              ×
            </Button>
          </DialogClose>
        </DialogHeader>

        <form className="grid gap-4.25" onSubmit={createForm}>
          <div className="grid gap-1.75 text-ink-soft">
            <Label className="font-mono text-[.68rem] font-semibold tracking-[.05em] text-ink-soft uppercase" htmlFor="create-form-name">
              Form name <span aria-hidden="true">*</span>
            </Label>
            <Input
              className="h-auto min-h-10.5 w-full rounded-[2px] border border-(--line) bg-(--paper) px-3 py-2.5 font-sans text-[.88rem] text-ink tracking-normal"
              id="create-form-name"
              ref={nameInputRef}
              value={formName}
              onChange={(event) => setFormName(event.target.value)}
              maxLength={120}
              placeholder="e.g. Customer feedback"
              required
            />
          </div>
          <div className="grid gap-1.75 text-ink-soft">
            <Label className="font-mono text-[.68rem] font-semibold tracking-[.05em] text-ink-soft uppercase" htmlFor="create-form-description">
              Description <span className="ml-1.5 font-mono text-[.6rem] tracking-[.04em] text-ink-soft uppercase">Optional</span>
            </Label>
            <Textarea
              className="min-h-22 w-full resize-y rounded-[2px] border border-(--line) bg-(--paper) px-3 py-2.5 font-sans text-[.88rem] text-ink tracking-normal"
              id="create-form-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="What is this form for?"
            />
          </div>
          <div className="flex items-start gap-2.25 bg-[color-mix(in_srgb,var(--accent)_8%,var(--paper))] px-3 py-2.75 text-[.74rem] leading-[1.45] text-ink-soft">
            <span className="mt-1 size-1.75 shrink-0 rounded-full bg-[#bd7b22]" aria-hidden="true" />
            This form will be created as a draft. You can publish it from the editor.
          </div>

          {error && (
            <p className="m-0 text-[.82rem] text-accent-dark" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2.25 pt-1.25">
            <Button
              type="button"
              variant="outline"
              className="inline-flex min-h-10.5 items-center justify-center gap-2.25 rounded-[3px] border border-(--ink) bg-transparent px-3.75 py-2.5 font-sans text-[.8rem] font-semibold text-ink transition-colors duration-150 hover:bg-(--paper-deep) disabled:cursor-not-allowed disabled:opacity-55"
              onClick={closeModal}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="inline-flex min-h-10.5 items-center justify-center gap-2.25 rounded-[3px] border border-(--ink) bg-(--ink) px-3.75 py-2.5 font-sans text-[.8rem] font-semibold text-paper transition-[transform,color,background-color,border-color] duration-150 hover:-translate-y-px hover:border-(--accent) hover:bg-(--accent) disabled:cursor-not-allowed disabled:opacity-55"
              disabled={creating || !formName.trim()}
            >
              {creating ? "Creating…" : "Create draft"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </div>
    </Dialog>
  );
}
