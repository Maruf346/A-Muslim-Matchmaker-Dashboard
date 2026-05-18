import { HelpCircle, Scale, Lock, Edit, Eye, Save, X, Type } from "lucide-react";
import { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Bold,
  Essentials,
  Italic,
  Mention,
  Paragraph,
  Undo,
  Heading,
  Link,
  List,
  BlockQuote,
  Indent,
  Alignment,
  Table,
  MediaEmbed,
  Font,
  Underline,
  Strikethrough,
  Code,
  HorizontalLine,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

export function Settings() {
  const [faqContent, setFaqContent] = useState("");
  const [termsContent, setTermsContent] = useState("");
  const [privacyContent, setPrivacyContent] = useState("");

  const [faqEditing, setFaqEditing] = useState(false);
  const [termsEditing, setTermsEditing] = useState(false);
  const [privacyEditing, setPrivacyEditing] = useState(false);

  const [faqSaved, setFaqSaved] = useState("");
  const [termsSaved, setTermsSaved] = useState("");
  const [privacySaved, setPrivacySaved] = useState("");

  // Privacy Header states
  const [privacyHeaderEditing, setPrivacyHeaderEditing] = useState(false);
  const [privacyHeaderTitle, setPrivacyHeaderTitle] = useState("");
  const [privacyHeaderSubtitle, setPrivacyHeaderSubtitle] = useState("");
  const [privacyHeaderTitleSaved, setPrivacyHeaderTitleSaved] = useState<string | null>(null);
  const [privacyHeaderSubtitleSaved, setPrivacyHeaderSubtitleSaved] = useState<string | null>(null);

  const handleSaveFaq = () => {
    setFaqSaved(faqContent);
    setFaqEditing(false);
    alert("FAQ saved successfully!");
  };

  const handleCancelFaq = () => {
    setFaqContent(faqSaved);
    setFaqEditing(false);
  };

  const handleSaveTerms = () => {
    setTermsSaved(termsContent);
    setTermsEditing(false);
    alert("Terms and Conditions saved successfully!");
  };

  const handleCancelTerms = () => {
    setTermsContent(termsSaved);
    setTermsEditing(false);
  };

  const handleSavePrivacy = () => {
    setPrivacySaved(privacyContent);
    setPrivacyEditing(false);
    alert("Privacy Policy saved successfully!");
  };

  const handleCancelPrivacy = () => {
    setPrivacyContent(privacySaved);
    setPrivacyEditing(false);
  };

  const handleSavePrivacyHeader = () => {
    setPrivacyHeaderTitleSaved(privacyHeaderTitle.trim() || null);
    setPrivacyHeaderSubtitleSaved(privacyHeaderSubtitle.trim() || null);
    setPrivacyHeaderEditing(false);
    alert("Privacy Header saved successfully!");
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-[#415192]" />
              <h2 className="text-lg font-semibold text-gray-900">FAQ Management</h2>
            </div>
            {!faqEditing && (
              <button
                onClick={() => setFaqEditing(true)}
                className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Add or edit frequently asked questions for users</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">FAQ Content</label>
              {faqEditing ? (
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                <CKEditor
                  editor={ClassicEditor}
                  data={faqContent}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setFaqContent(data);
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
                  {faqSaved ? (
                    <div dangerouslySetInnerHTML={{ __html: faqSaved }} className="prose max-w-none" />
                  ) : (
                    <p className="text-gray-400 italic">No content added yet. Click Edit to add FAQ content.</p>
                  )}
                </div>
              )}
              {faqEditing && (
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={handleSaveFaq}
                    className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelFaq}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Tip: Format each question with a heading and provide clear answers below
              </p>
            </div>
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
                onClick={() => setTermsEditing(true)}
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
                    className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
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
                onClick={() => setPrivacyEditing(true)}
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
                    className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
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
                    className="px-4 py-2 bg-[#415192] text-white rounded-lg hover:bg-[#354177] transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
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
    </div>
  );
}
