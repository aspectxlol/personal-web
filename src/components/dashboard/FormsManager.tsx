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
    <div className="forms-workspace">
      <header className="dashboard-page-header forms-page-header">
        <div>
          <p className="dashboard-eyebrow">Workspace / Forms</p>
          <h1>Your forms</h1>
          <p className="dashboard-page-description">
            Build and manage forms in one place.
          </p>
        </div>
        <Button
          type="button"
          className="dashboard-primary-button"
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
        <div className="dashboard-alert" role="alert">
          <span>{initialError}</span>
          <Button
            type="button"
            variant="outline"
            className="dashboard-secondary-button"
            onClick={refreshForms}
          >
            Retry
          </Button>
        </div>
      )}

      <section className="forms-section" aria-label="Forms">
        <div className="forms-toolbar">
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              if (value === "active" || value === "drafts") setActiveTab(value);
            }}
          >
          <TabsList className="forms-tabs" variant="line" aria-label="Filter forms by status">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="forms-tab"
              >
                {tab.label}
                <span>{counts[tab.id]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          </Tabs>
          <span className="forms-count">
            {visibleForms.length} {visibleForms.length === 1 ? "form" : "forms"}
          </span>
        </div>

        {visibleForms.length > 0 ? (
          <div className="forms-grid">
            {visibleForms.map((form) => (
              <Card className="form-card ring-0" key={form.id}>
                <div className="form-card-top">
                  <Badge
                    variant={form.status === "published" ? "default" : "secondary"}
                    className={`form-status is-${form.status}`}
                  >
                    <span aria-hidden="true" />
                    {form.status}
                  </Badge>
                </div>
                <div className="form-card-copy">
                  <h2>{form.title}</h2>
                  <p>{form.description || "No description added yet."}</p>
                </div>
                <div className="form-card-footer">
                  <span>{form.fields.length} questions</span>
                  <Button asChild variant="link" className="form-card-link">
                    <Link href={`/form/${form.id}/edit`}>
                      Edit form <span aria-hidden="true">→</span>
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="forms-empty-state">
            <span className="forms-empty-icon" aria-hidden="true">
              ▤
            </span>
            <h2>
              {activeTab === "drafts" ? "No drafts yet" : "No active forms yet"}
            </h2>
            <p>
              {activeTab === "drafts"
                ? "New forms stay as drafts until you publish them."
                : "Publish a form to make it active in your workspace."}
            </p>
            {activeTab === "drafts" && (
              <Button
                type="button"
                className="dashboard-primary-button"
                onClick={() => setModalOpen(true)}
              >
                Create a form
              </Button>
            )}
          </div>
        )}
      </section>

      <DialogContent
        className="create-form-dialog"
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          nameInputRef.current?.focus();
        }}
      >
        <DialogHeader className="create-form-dialog-header">
          <div>
            <p className="dashboard-eyebrow">New workspace item</p>
            <DialogTitle id="create-form-title">Create a form</DialogTitle>
          </div>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="dialog-close-button"
              aria-label="Close dialog"
              disabled={creating}
            >
              ×
            </Button>
          </DialogClose>
        </DialogHeader>

        <form className="create-form-form" onSubmit={createForm}>
          <div className="form-dialog-field">
            <Label htmlFor="create-form-name">
              Form name <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="create-form-name"
              ref={nameInputRef}
              value={formName}
              onChange={(event) => setFormName(event.target.value)}
              maxLength={120}
              placeholder="e.g. Customer feedback"
              required
            />
          </div>
          <div className="form-dialog-field">
            <Label htmlFor="create-form-description">
              Description <span className="form-optional">Optional</span>
            </Label>
            <Textarea
              id="create-form-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="What is this form for?"
            />
          </div>
          <div className="draft-note">
            <span className="draft-note-dot" aria-hidden="true" />
            This form will be created as a draft. You can publish it from the editor.
          </div>

          {error && (
            <p className="dashboard-alert-message" role="alert">
              {error}
            </p>
          )}

          <div className="create-form-actions">
            <Button
              type="button"
              variant="outline"
              className="dashboard-secondary-button"
              onClick={closeModal}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="dashboard-primary-button"
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
