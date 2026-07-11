import { useEffect, useRef, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Alignment,
  BlockQuote,
  Bold,
  ClassicEditor,
  Code,
  Essentials,
  Font,
  Heading,
  HorizontalLine,
  Indent,
  Italic,
  Link,
  List,
  Paragraph,
  Strikethrough,
  Table,
  Underline,
  Undo,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import {
  AlertCircle,
  CheckCircle,
  Edit,
  HelpCircle,
  Loader2,
  Lock,
  Plus,
  Scale,
  Save,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { createFaq, deleteFaq, listFaqs, type FaqItem } from "../api/faq";
import { ApiError } from "../api/errors";
import {
  getPrivacy,
  getPrivacyHeader,
  getTerms,
  updatePrivacy,
  updatePrivacyHeader,
  updateTerms,
} from "../api/supports";

export function Settings() {
  const [termsContent, setTermsContent] = useState("");
  const [privacyContent, setPrivacyContent] = useState("");

  const [termsEditing, setTermsEditing] = useState(false);
  const [privacyEditing, setPrivacyEditing] = useState(false);
  const [termsSaving, setTermsSaving] = useState(false);
  const [privacySaving, setPrivacySaving] = useState(false);
  const [privacyHeaderSaving, setPrivacyHeaderSaving] = useState(false);

  const [termsSaved, setTermsSaved] = useState("");
  const [privacySaved, setPrivacySaved] = useState("");

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [faqError, setFaqError] = useState<string | null>(null);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqSaving, setFaqSaving] = useState(false);
  const [faqFormError, setFaqFormError] = useState("");
  const [faqToDelete, setFaqToDelete] = useState<FaqItem | null>(null);
  const [faqDeletingId, setFaqDeletingId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast(message);
    toastTimeout.current = setTimeout(() => setToast(null), 2800);
  };

  // Privacy Header states
  const [privacyHeaderEditing, setPrivacyHeaderEditing] = useState(false);
  const [privacyHeaderTitle, setPrivacyHeaderTitle] = useState("");
  const [privacyHeaderSubtitle, setPrivacyHeaderSubtitle] = useState("");
  const [privacyHeaderTitleSaved, setPrivacyHeaderTitleSaved] = useState<string | null>(null);
  const [privacyHeaderSubtitleSaved, setPrivacyHeaderSubtitleSaved] = useState<string | null>(null);

  const loadFaqs = async () => {
    setFaqLoading(true);
    setFaqError(null);

    try {
      const response = await listFaqs({ page_size: 100 });
      setFaqs(response.results ?? []);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to load FAQs right now.";
      setFaqError(message);
    } finally {
      setFaqLoading(false);
    }
  };

  useEffect(() => {
    void loadFaqs();
  }, []);

  useEffect(() => {
    const loadLegalContent = async () => {
      try {
        const [termsResult, privacyResult, privacyHeaderResult] = await Promise.allSettled([
          getTerms(),
          getPrivacy(),
          getPrivacyHeader(),
        ]);

        if (termsResult.status === "fulfilled") {
          setTermsContent(termsResult.value.content ?? "");
          setTermsSaved(termsResult.value.content ?? "");
        }

        if (privacyResult.status === "fulfilled") {
          setPrivacyContent(privacyResult.value.content ?? "");
          setPrivacySaved(privacyResult.value.content ?? "");
        }

        if (privacyHeaderResult.status === "fulfilled") {
          setPrivacyHeaderTitle(privacyHeaderResult.value.title ?? "");
          setPrivacyHeaderSubtitle(privacyHeaderResult.value.subtitle ?? "");
          setPrivacyHeaderTitleSaved(privacyHeaderResult.value.title ?? null);
          setPrivacyHeaderSubtitleSaved(privacyHeaderResult.value.subtitle ?? null);
        }
      } catch {
        showToast("Some settings could not be loaded.");
      }
    };

    void loadLegalContent();
  }, []);

  const openFaqDialog = () => {
    setFaqQuestion("");
    setFaqAnswer("");
    setFaqFormError("");
    setFaqDialogOpen(true);
  };

  const closeFaqDialog = () => {
    if (faqSaving) return;
    setFaqDialogOpen(false);
    setFaqFormError("");
  };

  const handleCreateFaq = async () => {
    const question = faqQuestion.trim();
    const answer = faqAnswer.trim();

    if (!question) {
      setFaqFormError("Question is required.");
      return;
    }

    if (!answer) {
      setFaqFormError("Answer is required.");
      return;
    }

    setFaqSaving(true);
    setFaqFormError("");

    try {
      const createdFaq = await createFaq({ question, answer });
      setFaqs((current) => [createdFaq, ...current]);
      setFaqDialogOpen(false);
      setFaqQuestion("");
      setFaqAnswer("");
      showToast("FAQ added successfully.");
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to create the FAQ.";
      setFaqFormError(message);
    } finally {
      setFaqSaving(false);
    }
  };

  const handleDeleteFaq = async (faq: FaqItem) => {
    setFaqDeletingId(faq.id);

    try {
      await deleteFaq(faq.id);
      setFaqs((current) => current.filter((item) => item.id !== faq.id));
      showToast("FAQ deleted successfully.");
      setFaqToDelete(null);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Unable to delete the FAQ.";
      showToast(message);
    } finally {
      setFaqDeletingId(null);
    }
  };

  const handleSaveTerms = async () => {
    setTermsSaving(true);
    try {
      const response = await updateTerms(termsContent);
      setTermsSaved(response.content ?? termsContent);
      setTermsContent(response.content ?? termsContent);
      setTermsEditing(false);
      showToast("Terms and Conditions saved successfully.");
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Unable to save Terms and Conditions.");
    } finally {
      setTermsSaving(false);
    }
  };

  const handleCancelTerms = () => {
    setTermsContent(termsSaved);
    setTermsEditing(false);
  };

  const handleSavePrivacy = async () => {
    setPrivacySaving(true);
    try {
      const response = await updatePrivacy(privacyContent);
      setPrivacySaved(response.content ?? privacyContent);
      setPrivacyContent(response.content ?? privacyContent);
      setPrivacyEditing(false);
      showToast("Privacy Policy saved successfully.");
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Unable to save Privacy Policy.");
    } finally {
      setPrivacySaving(false);
    }
  };

  const handleCancelPrivacy = () => {
    setPrivacyContent(privacySaved);
    setPrivacyEditing(false);
  };

  const handleSavePrivacyHeader = async () => {
    setPrivacyHeaderSaving(true);
    try {
      const response = await updatePrivacyHeader({
        title: privacyHeaderTitle.trim(),
        subtitle: privacyHeaderSubtitle.trim(),
      });

      setPrivacyHeaderTitleSaved(response.title ?? null);
      setPrivacyHeaderSubtitleSaved(response.subtitle ?? null);
      setPrivacyHeaderTitle(response.title ?? "");
      setPrivacyHeaderSubtitle(response.subtitle ?? "");
      setPrivacyHeaderEditing(false);
      showToast("Privacy Header saved successfully.");
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Unable to save Privacy Header.");
    } finally {
      setPrivacyHeaderSaving(false);
    }
  };

  const handleCancelPrivacyHeader = () => {
    setPrivacyHeaderTitle(privacyHeaderTitleSaved ?? "");
    setPrivacyHeaderSubtitle(privacyHeaderSubtitleSaved ?? "");
    setPrivacyHeaderEditing(false);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage content pages and legal documentation</p>
      </div>

      <div className="grid gap-6">
        {/* Content Management - FAQ */}
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-[#415192]" />
              <h2 className="text-lg font-semibold text-gray-900">FAQ Management</h2>
            </div>
            <button
              type="button"
              onClick={openFaqDialog}
              className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add FAQ
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Manage FAQs as question and answer pairs. Click a question to expand the answer.
            </p>

            {faqLoading ? (
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-5 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-[#415192]" />
                Loading FAQs...
              </div>
            ) : faqError ? (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">Could not load FAQs</p>
                  <p className="mt-1">{faqError}</p>
                  <button
                    onClick={loadFaqs}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#415192] shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : faqs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
                <HelpCircle className="mx-auto w-10 h-10 text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-900">No FAQs yet</p>
                <p className="mt-1 text-sm text-gray-500">
                  Add your first question and answer to start building the FAQ list.
                </p>
                <button
                  onClick={openFaqDialog}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#415192] px-4 py-2 text-sm font-semibold text-white hover:bg-[#354177]"
                >
                  <Plus className="w-4 h-4" />
                  Add FAQ
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="px-5">
                      <div className="flex items-center gap-3 py-5">
                        <AccordionTrigger className="flex-1 py-0 no-underline hover:no-underline">
                          <div className="min-w-0 text-left">
                            <p className="text-sm font-semibold text-gray-900">{faq.question}</p>
                            <p className="mt-1 text-xs text-gray-500">Click to view answer</p>
                          </div>
                        </AccordionTrigger>
                        <button
                          type="button"
                          onClick={() => setFaqToDelete(faq)}
                          disabled={faqDeletingId === faq.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {faqDeletingId === faq.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          Delete
                        </button>
                      </div>
                      <AccordionContent>
                        <div className="rounded-xl bg-gray-50 px-4 py-4 text-sm leading-6 text-gray-700">
                          <p className="whitespace-pre-wrap">{faq.answer}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        </div>

        {/* Content Management - Terms and Conditions */}
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Scale className="w-6 h-6 text-[#415192]" />
              <h2 className="text-lg font-semibold text-gray-900">Terms and Conditions</h2>
            </div>
            {!termsEditing && (
              <button
                onClick={() => {
                  setTermsContent(termsSaved);
                  setTermsEditing(true);
                }}
                className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Define the terms and conditions for using your platform</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms Content</label>
              {termsEditing ? (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                <CKEditor
                  editor={ClassicEditor}
                  data={termsContent}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setTermsContent(data);
                  }}
                  config={{
                    licenseKey: 'GPL',
                    plugins: [
                      Essentials,
                      Bold,
                      Italic,
                      Underline,
                      Strikethrough,
                      Paragraph,
                      Heading,
                      Link,
                      List,
                      BlockQuote,
                      Indent,
                      Alignment,
                      Table,
                      Code,
                      HorizontalLine,
                      Undo,
                      Font,
                    ],
                    toolbar: [
                      "undo",
                      "redo",
                      "|",
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "underline",
                      "strikethrough",
                      "|",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "alignment",
                      "indent",
                      "outdent",
                      "|",
                      "blockQuote",
                      "insertTable",
                      "horizontalLine",
                    ],
                    heading: {
                      options: [
                        { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
                        { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
                        { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
                        { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
                      ],
                    },
                  }}
                />
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4 bg-white min-h-[200px]">
                  {termsSaved ? (
                    <div dangerouslySetInnerHTML={{ __html: termsSaved }} className="prose max-w-none" />
                  ) : (
                    <p className="text-gray-400 italic">No content added yet. Click Edit to add Terms and Conditions.</p>
                  )}
                </div>
              )}
              {termsEditing && (
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={handleSaveTerms}
                    disabled={termsSaving}
                    className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2"
                  >
                    {termsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {termsSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancelTerms}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Important: Ensure your terms comply with local laws and regulations
              </p>
            </div>
          </div>
        </div>

        {/* Content Management - Privacy Policy */}
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-[#415192]" />
              <h2 className="text-lg font-semibold text-gray-900">Privacy Policy</h2>
            </div>
            {!privacyEditing && (
              <button
                onClick={() => {
                  setPrivacyContent(privacySaved);
                  setPrivacyEditing(true);
                }}
                className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Define how you collect, use, and protect user data</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Policy Content</label>
              {privacyEditing ? (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                <CKEditor
                  editor={ClassicEditor}
                  data={privacyContent}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setPrivacyContent(data);
                  }}
                  config={{
                    licenseKey: 'GPL',
                    plugins: [
                      Essentials,
                      Bold,
                      Italic,
                      Underline,
                      Strikethrough,
                      Paragraph,
                      Heading,
                      Link,
                      List,
                      BlockQuote,
                      Indent,
                      Alignment,
                      Table,
                      Code,
                      HorizontalLine,
                      Undo,
                      Font,
                    ],
                    toolbar: [
                      "undo",
                      "redo",
                      "|",
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "underline",
                      "strikethrough",
                      "|",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "alignment",
                      "indent",
                      "outdent",
                      "|",
                      "blockQuote",
                      "insertTable",
                      "horizontalLine",
                    ],
                    heading: {
                      options: [
                        { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
                        { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
                        { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
                        { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
                      ],
                    },
                  }}
                />
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4 bg-white min-h-[200px]">
                  {privacySaved ? (
                    <div dangerouslySetInnerHTML={{ __html: privacySaved }} className="prose max-w-none" />
                  ) : (
                    <p className="text-gray-400 italic">No content added yet. Click Edit to add Privacy Policy.</p>
                  )}
                </div>
              )}
              {privacyEditing && (
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={handleSavePrivacy}
                    disabled={privacySaving}
                    className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2"
                  >
                    {privacySaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {privacySaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancelPrivacy}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Important: Include GDPR compliance if you have users in Europe
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Header */}
        <div className="bg-[#F9FAFB] rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Type className="w-6 h-6 text-[#415192]" />
              <h2 className="text-lg font-semibold text-gray-900">Privacy Header</h2>
            </div>
            {!privacyHeaderEditing && (
              <button
                onClick={() => {
                  setPrivacyHeaderTitle(privacyHeaderTitleSaved ?? "");
                  setPrivacyHeaderSubtitle(privacyHeaderSubtitleSaved ?? "");
                  setPrivacyHeaderEditing(true);
                }}
                className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {privacyHeaderTitleSaved === null && privacyHeaderSubtitleSaved === null ? "Add" : "Edit"}
              </button>
            )}
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Set the title and subtitle displayed at the top of the Privacy section in the app</p>
            {privacyHeaderEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={privacyHeaderTitle}
                    onChange={(e) => setPrivacyHeaderTitle(e.target.value)}
                    placeholder="e.g. Privacy Policy"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                  <input
                    type="text"
                    value={privacyHeaderSubtitle}
                    onChange={(e) => setPrivacyHeaderSubtitle(e.target.value)}
                    placeholder="e.g. Your privacy matters to us"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#415192] focus:border-transparent bg-white text-gray-900"
                  />
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleSavePrivacyHeader}
                    disabled={privacyHeaderSaving}
                    className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2"
                  >
                    {privacyHeaderSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {privacyHeaderSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancelPrivacyHeader}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 bg-white min-h-[100px] flex flex-col justify-center">
                {privacyHeaderTitleSaved !== null || privacyHeaderSubtitleSaved !== null ? (
                  <div className="space-y-1">
                    {privacyHeaderTitleSaved !== null && (
                      <p className="text-xl font-semibold text-gray-900">{privacyHeaderTitleSaved}</p>
                    )}
                    {privacyHeaderSubtitleSaved !== null && (
                      <p className="text-sm text-gray-500">{privacyHeaderSubtitleSaved}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 italic">No header set yet. Click Add to set the Privacy page header.</p>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500">
              Tip: Keep the title concise and the subtitle as a short clarifying statement
            </p>
          </div>
        </div>

      </div>

      <Dialog open={faqDialogOpen} onOpenChange={(open) => !open && closeFaqDialog()}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader className="text-left">
            <DialogTitle className="text-xl">Add FAQ</DialogTitle>
            <DialogDescription>
              Create a new question and answer pair for the FAQ list.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Question</label>
              <input
                type="text"
                value={faqQuestion}
                onChange={(e) => {
                  setFaqQuestion(e.target.value);
                  setFaqFormError("");
                }}
                placeholder="e.g. How do I reset my password?"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-[#415192] focus:ring-2 focus:ring-[#415192]/20"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Answer</label>
              <textarea
                value={faqAnswer}
                onChange={(e) => {
                  setFaqAnswer(e.target.value);
                  setFaqFormError("");
                }}
                placeholder="Write the answer users should see..."
                rows={7}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-[#415192] focus:ring-2 focus:ring-[#415192]/20"
              />
            </div>

            {faqFormError && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" />
                <span>{faqFormError}</span>
              </div>
            )}
          </div>

          <DialogFooter className="gap-3 sm:gap-3">
            <button
              type="button"
              onClick={closeFaqDialog}
              disabled={faqSaving}
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateFaq}
              disabled={faqSaving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#415192] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#354177] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {faqSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!faqToDelete} onOpenChange={(open) => !open && setFaqToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{" "}
              <span className="font-medium text-gray-900">
                {faqToDelete?.question ?? "this FAQ"}
              </span>
              . You can add it again later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={faqDeletingId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                if (faqToDelete) {
                  void handleDeleteFaq(faqToDelete);
                }
              }}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={faqDeletingId !== null}
            >
              {faqDeletingId ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <style>{`
            @keyframes toastSlide {
              0%   { transform: translateX(110%); opacity: 0; }
              10%  { transform: translateX(0);    opacity: 1; }
              78%  { transform: translateX(0);    opacity: 1; }
              100% { transform: translateX(0);    opacity: 0; }
            }
          `}</style>
          <div
            style={{ animation: "toastSlide 2.8s ease forwards" }}
            className="flex items-center gap-3 bg-white border border-gray-200 shadow-xl rounded-xl px-5 py-4 min-w-[280px]"
          >
            <div className="flex items-center justify-center w-9 h-9 bg-green-100 rounded-full shrink-0">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Saved</p>
              <p className="text-xs text-gray-500 mt-0.5">{toast}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
