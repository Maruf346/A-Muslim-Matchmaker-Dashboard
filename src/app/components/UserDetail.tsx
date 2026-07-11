import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Heart,
  Loader2,
  Save,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  deleteUser,
  getUserBasicInfo,
  getUserDetail,
  setUserVerification,
  updateUserBasicInfo,
  type AdminUserDetail,
  type UserBasicInfoResponse,
  type UserBasicInfoTarget,
  type WaliBasicInfoResponse,
} from "../api/adminUsers";
import { ApiError } from "../api/errors";
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

type FieldKind = "text" | "textarea" | "select" | "boolean" | "number" | "date" | "multivalue" | "multiselect";

type Option = { label: string; value: string };

type FieldDefinition = {
  key: string;
  label: string;
  kind: FieldKind;
  options?: Option[];
  placeholder?: string;
  helper?: string;
};

type FieldValueMap = Record<string, string>;

const SELECT_YES_NO: Option[] = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

const HOW_FOUND_OPTIONS: Option[] = [
  { label: "By Referral", value: "referral" },
  { label: "Instagram", value: "instagram" },
  { label: "FaiyadFit", value: "faiyad_fit" },
  { label: "Youtube", value: "youtube" },
  { label: "A Muslim Homemaker", value: "a_muslim_homemaker" },
  { label: "IronFitCoaching", value: "iron_fit_coaching" },
  { label: "A Muslim Guide", value: "a_muslim_guide" },
  { label: "Facebook", value: "facebook" },
  { label: "Other", value: "other" },
];

const SELECT_GENDER: Option[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const SELECT_SECT: Option[] = [
  { label: "Sunni", value: "sunni" },
  { label: "Salafi", value: "salafi" },
];

const SELECT_PRAY: Option[] = [
  { label: "Yes", value: "yes" },
  { label: "Mostly", value: "mostly" },
  { label: "No", value: "no" },
];

const SELECT_RELOCATION: Option[] = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "Maybe (open for discussion)", value: "maybe" },
  { label: "Not right now, but at a later time", value: "later" },
];

const SELECT_DRESS: Option[] = [
  { label: "No Hijab", value: "no_hijab" },
  { label: "Hijab and Pants", value: "hijab_pants" },
  { label: "Hijab and Abaya", value: "hijab_and_abaya" },
  { label: "Niqab", value: "niqab" },
];

const SELECT_MARITAL_STATUS: Option[] = [
  { label: "Never been married", value: "never_married" },
  { label: "Married (Polygyny)", value: "polygyny" },
  { label: "Annulment (Khula)", value: "khula" },
  { label: "Divorced", value: "divorced" },
  { label: "Widowed", value: "widowed" },
];

const SELECT_CHILDREN_COUNT: Option[] = [
  { label: "None", value: "0" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
  { label: "5+", value: "5_plus" },
];

const SELECT_EDUCATION: Option[] = [
  { label: "High School Graduate", value: "high_school" },
  { label: "Associates Degree", value: "associates" },
  { label: "Technical Degree", value: "technical" },
  { label: "College", value: "college" },
  { label: "Bachelors Degree", value: "bachelors" },
  { label: "Masters Degree", value: "masters" },
  { label: "Graduate Degree", value: "graduate" },
  { label: "J.D./M.D./PhD", value: "jd_md_phd" },
  { label: "Other", value: "other" },
];

const SELECT_INCOME: Option[] = [
  { label: "£0 - £12k", value: "0_12k" },
  { label: "£12k - £20k", value: "12_20k" },
  { label: "£20k - £50k", value: "20_50k" },
  { label: "£50k - £100k", value: "50_100k" },
  { label: "£100k - £300k", value: "100_300k" },
  { label: "£300k - £500k", value: "300_500k" },
  { label: "£500k+", value: "500k_plus" },
  { label: "Would rather not share", value: "rather_not_say" },
  { label: "Unemployed", value: "unemployed" },
];

const SELECT_FRAME: Option[] = [
  { label: "Petite", value: "petite" },
  { label: "Slim", value: "slim" },
  { label: "Average", value: "average" },
  { label: "Fit/Athletic", value: "fit_athletic" },
  { label: "Muscular", value: "muscular" },
  { label: "Curvy", value: "curvy" },
  { label: "A few Extra Pounds", value: "few_extra" },
  { label: "Wider frame", value: "wider_frame" },
  { label: "Bulky", value: "bulky" },
];

const SELECT_WALI_RELATION: Option[] = [
  { label: "Father", value: "father" },
  { label: "Brother", value: "brother" },
  { label: "Uncle", value: "uncle" },
  { label: "Grandfather", value: "grandfather" },
  { label: "Other", value: "other" },
];

function toHeightOptions(startCm: number, endCm: number): Option[] {
  const options: Option[] = [];

  for (let cm = startCm; cm <= endCm; cm += 1) {
    const totalInches = Math.round(cm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    const value = `${cm}cm - ${feet}' ${inches}"`;
    options.push({ label: value, value });
  }

  return options;
}

function toWeightOptions(startKg: number, endKg: number): Option[] {
  const options: Option[] = [];

  for (let kg = startKg; kg <= endKg; kg += 1) {
    const lbs = Math.round(kg * 2.20462);
    const value = `${kg}kg - ${lbs}lbs`;
    options.push({ label: value, value });
  }

  return options;
}

const MALE_HEIGHT_OPTIONS = toHeightOptions(121, 215);
const FEMALE_HEIGHT_OPTIONS = toHeightOptions(91, 238);
const MALE_WEIGHT_OPTIONS = toWeightOptions(40, 149);
const FEMALE_WEIGHT_OPTIONS = toWeightOptions(20, 149);

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#415192] focus:ring-2 focus:ring-[#415192]/20";

function isWaliBasicInfo(value: UserBasicInfoResponse | null): value is WaliBasicInfoResponse {
  return Boolean(value && typeof value === "object" && "wali_profile" in value && "sister_info" in value);
}

function asText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map((item) => String(item)).join(", ");
  return String(value);
}

function normalizeFormRecord(record: Record<string, unknown> | undefined | null): FieldValueMap {
  const output: FieldValueMap = {};

  if (!record) return output;

  for (const [key, value] of Object.entries(record)) {
    output[key] = asText(value);
  }

  return output;
}

function normalizeDetail(detail: AdminUserDetail | null): FieldValueMap {
  if (!detail) return {};

  return {
    id: detail.id,
    codename: asText(detail.codename),
    first_name: detail.first_name ?? "",
    last_name: detail.last_name ?? "",
    email: detail.email ?? "",
    role: detail.role ?? "",
    gender: asText(detail.gender),
    subscription_plan: asText(detail.subscription_plan),
    is_verified: detail.is_verified ? "yes" : "no",
    age: asText(detail.age),
  };
}

function formatDisplayValue(value: string) {
  if (!value.trim()) return "Not set";
  return value;
}

function fieldValueToPayload(field: FieldDefinition, value: string) {
  if (field.kind === "boolean") {
    if (!value) return undefined;
    return value === "yes";
  }

  if (field.kind === "number") {
    if (!value.trim()) return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  if (field.kind === "multivalue" || field.kind === "multiselect") {
    if (!value.trim()) return [];
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (!value && field.kind !== "text" && field.kind !== "textarea" && field.kind !== "select" && field.kind !== "date") {
    return undefined;
  }

  return value;
}

function diffPayload(fields: FieldDefinition[], original: FieldValueMap, draft: FieldValueMap) {
  const payload: Record<string, unknown> = {};

  for (const field of fields) {
    const currentValue = draft[field.key] ?? "";
    const originalValue = original[field.key] ?? "";

    if (currentValue === originalValue) continue;

    const serialized = fieldValueToPayload(field, currentValue);
    if (serialized !== undefined) {
      payload[field.key] = serialized;
    }
  }

  return payload;
}

function SelectField({
  field,
  value,
  onChange,
}: {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      <span>{field.label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="">Not set</option>
        {(field.options ?? []).map((option) => (
          <option key={`${field.key}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {field.helper ? <p className="mt-1 text-xs text-gray-500">{field.helper}</p> : null}
    </label>
  );
}

function TextField({
  field,
  value,
  onChange,
  type = "text",
}: {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      <span>{field.label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={inputClass}
      />
      {field.helper ? <p className="mt-1 text-xs text-gray-500">{field.helper}</p> : null}
    </label>
  );
}

function TextareaField({
  field,
  value,
  onChange,
}: {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      <span>{field.label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={`${inputClass} min-h-28 resize-y`}
      />
      {field.helper ? <p className="mt-1 text-xs text-gray-500">{field.helper}</p> : null}
    </label>
  );
}

function BooleanField({
  field,
  value,
  onChange,
}: {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      <span>{field.label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="">Not set</option>
        {SELECT_YES_NO.map((option) => (
          <option key={`${field.key}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {field.helper ? <p className="mt-1 text-xs text-gray-500">{field.helper}</p> : null}
    </label>
  );
}

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  switch (field.kind) {
    case "select":
      return <SelectField field={field} value={value} onChange={onChange} />;
    case "multiselect":
      return <MultiSelectField field={field} value={value} onChange={onChange} />;
    case "textarea":
      return <TextareaField field={field} value={value} onChange={onChange} />;
    case "boolean":
      return <BooleanField field={field} value={value} onChange={onChange} />;
    case "number":
      return <TextField field={field} value={value} onChange={onChange} type="number" />;
    case "date":
      return <TextField field={field} value={value} onChange={onChange} type="date" />;
    case "multivalue":
      return (
        <TextField
          field={{
            ...field,
            helper: field.helper ?? "Separate multiple values with commas.",
          }}
          value={value}
          onChange={onChange}
        />
      );
    default:
      return <TextField field={field} value={value} onChange={onChange} />;
  }
}

function SectionCard({
  title,
  description,
  editing,
  saving,
  error,
  onEdit,
  onCancel,
  onSave,
  canEdit,
  fields,
  draft,
  onFieldChange,
  readOnlyContent,
}: {
  title: string;
  description: string;
  editing: boolean;
  saving: boolean;
  error: string | null;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  canEdit: boolean;
  fields: FieldDefinition[];
  draft: FieldValueMap;
  onFieldChange: (key: string, value: string) => void;
  readOnlyContent: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        {editing ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#415192] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#354177] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={onEdit}
            disabled={!canEdit}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>

      <div className="px-6 py-5">
        {editing ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {fields.map((field) => (
                <FieldEditor
                  key={field.key}
                  field={field}
                  value={draft[field.key] ?? ""}
                  onChange={(value) => onFieldChange(field.key, value)}
                />
              ))}
            </div>
            {error ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </>
        ) : (
          readOnlyContent
        )}
      </div>
    </section>
  );
}

function detailRows(detail: FieldValueMap) {
  return [
    { label: "Full name", value: `${detail.first_name ?? ""} ${detail.last_name ?? ""}`.trim() || "Not set" },
    { label: "Email", value: detail.email || "Not set" },
    { label: "Role", value: formatDisplayValue(detail.role) },
    { label: "Gender", value: formatDisplayValue(detail.gender) },
    { label: "Codename", value: formatDisplayValue(detail.codename) },
    { label: "Subscription plan", value: formatDisplayValue(detail.subscription_plan) },
    { label: "Age", value: formatDisplayValue(detail.age) },
  ];
}

function MultiSelectField({
  field,
  value,
  onChange,
}: {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
}) {
  const selected = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const toggle = (optionValue: string) => {
    const next = selected.includes(optionValue)
      ? selected.filter((item) => item !== optionValue)
      : [...selected, optionValue];

    onChange(next.join(", "));
  };

  return (
    <label className="block text-sm font-medium text-gray-700">
      <span>{field.label}</span>
      <div className="mt-1 grid max-h-56 gap-2 overflow-auto rounded-lg border border-gray-200 bg-white p-3">
        {(field.options ?? []).map((option) => {
          const checked = selected.includes(option.value);
          return (
            <label key={`${field.key}-${option.value}`} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(option.value)}
                className="h-4 w-4 rounded border-gray-300 text-[#415192] focus:ring-[#415192]"
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
      {field.helper ? <p className="mt-1 text-xs text-gray-500">{field.helper}</p> : null}
    </label>
  );
}

function renderReadOnlyGrid(fields: FieldDefinition[], values: FieldValueMap) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {fields.map((field) => {
        const value = values[field.key] ?? "";
        return (
          <div key={field.key}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{field.label}</p>
            <p className="mt-1 text-sm text-gray-900">{formatDisplayValue(value)}</p>
          </div>
        );
      })}
    </div>
  );
}

function buildSingleBasicInfoFields(role: string): FieldDefinition[] {
  const profileFields: FieldDefinition[] = [
    { key: "how_found", label: "How found", kind: "multiselect", options: HOW_FOUND_OPTIONS, helper: "Select all that apply." },
    { key: "phone", label: "Phone", kind: "text" },
    { key: "date_of_birth", label: "Date of birth", kind: "date" },
    { key: "city", label: "City", kind: "text" },
    { key: "country", label: "Country", kind: "text" },
    { key: "sect", label: "Sect", kind: "select", options: SELECT_SECT },
    { key: "marital_status", label: "Marital status", kind: "select", options: SELECT_MARITAL_STATUS },
    { key: "ethnicity", label: "Ethnicity", kind: "multivalue", helper: "Use commas for multiple values." },
    { key: "nationality", label: "Nationality", kind: "multivalue", helper: "Use commas for multiple values." },
    { key: "has_children", label: "Has children", kind: "boolean" },
    { key: "children_count", label: "Children count", kind: "select", options: SELECT_CHILDREN_COUNT },
    { key: "height", label: "Height", kind: "select", options: role === "male" ? MALE_HEIGHT_OPTIONS : FEMALE_HEIGHT_OPTIONS },
    { key: "weight", label: "Weight", kind: "select", options: role === "male" ? MALE_WEIGHT_OPTIONS : FEMALE_WEIGHT_OPTIONS },
    { key: "pray_5x", label: "Pray 5x", kind: "select", options: SELECT_PRAY },
    { key: "open_to_relocate", label: "Open to relocate", kind: "select", options: SELECT_RELOCATION },
    { key: "employment", label: "Employment", kind: "text" },
    { key: "education", label: "Education", kind: "select", options: SELECT_EDUCATION },
    { key: "income", label: "Income", kind: "select", options: SELECT_INCOME },
    { key: "frame", label: "Frame", kind: "select", options: SELECT_FRAME },
    { key: "languages_spoken", label: "Languages spoken", kind: "multivalue", helper: "Use commas for multiple values." },
    { key: "pref_age_min", label: "Preferred age min", kind: "number" },
    { key: "pref_age_max", label: "Preferred age max", kind: "number" },
    { key: "pref_marital_status", label: "Preferred marital status", kind: "multiselect", options: SELECT_MARITAL_STATUS, helper: "Select all that apply." },
    { key: "pref_ethnicity", label: "Preferred ethnicity", kind: "multivalue" },
    { key: "pref_country_of_residence", label: "Preferred country of residence", kind: "multivalue" },
    { key: "relationship_with_islam", label: "Relationship with Islam", kind: "textarea" },
    { key: "role_as_spouse", label: "Role as spouse", kind: "textarea" },
    { key: "about_yourself", label: "About yourself", kind: "textarea" },
    { key: "envision_spouse", label: "Envision spouse", kind: "textarea" },
    { key: "envision_marriage", label: "Envision marriage", kind: "textarea" },
    { key: "spouse_religious_status_pref", label: "Spouse religious status preference", kind: "textarea" },
    { key: "open_to_relocate_details", label: "Open to relocate details", kind: "textarea" },
    { key: "health_concerns", label: "Health concerns", kind: "textarea" },
    { key: "other_preferences", label: "Other preferences", kind: "textarea" },
  ];

  if (role === "female") {
    profileFields.splice(15, 0, { key: "dress", label: "Dress", kind: "select", options: SELECT_DRESS });
    profileFields.splice(16, 0, { key: "wali_name", label: "Wali name", kind: "text" });
    profileFields.splice(17, 0, { key: "wali_relation", label: "Wali relation", kind: "text" });
    profileFields.splice(18, 0, { key: "wali_number", label: "Wali number", kind: "text" });
  }

  if (role === "male") {
    profileFields.splice(15, 0, { key: "preferred_dress", label: "Preferred dress", kind: "select", options: SELECT_DRESS });
  }

  return profileFields;
}

function buildWaliProfileFields(): FieldDefinition[] {
  return [
    { key: "how_found", label: "How found", kind: "multiselect", options: HOW_FOUND_OPTIONS, helper: "Select all that apply." },
    { key: "gender", label: "Gender", kind: "select", options: SELECT_GENDER },
    { key: "relation_to_sister", label: "Relation to sister", kind: "select", options: SELECT_WALI_RELATION },
    { key: "phone", label: "Phone", kind: "text" },
  ];
}

function buildWaliSisterFields(): FieldDefinition[] {
  return [
    { key: "sister_first_name", label: "Sister first name", kind: "text" },
    { key: "sister_last_name", label: "Sister last name", kind: "text" },
    { key: "date_of_birth", label: "Date of birth", kind: "date" },
    { key: "city", label: "City", kind: "text" },
    { key: "country", label: "Country", kind: "text" },
    { key: "about", label: "About", kind: "textarea" },
    { key: "sect", label: "Sect", kind: "select", options: SELECT_SECT },
    { key: "marital_status", label: "Marital status", kind: "select", options: SELECT_MARITAL_STATUS },
    { key: "ethnicity", label: "Ethnicity", kind: "multivalue" },
    { key: "nationality", label: "Nationality", kind: "multivalue" },
    { key: "has_children", label: "Has children", kind: "boolean" },
    { key: "children_count", label: "Children count", kind: "select", options: SELECT_CHILDREN_COUNT },
    { key: "height", label: "Height", kind: "select", options: FEMALE_HEIGHT_OPTIONS },
    { key: "weight", label: "Weight", kind: "select", options: FEMALE_WEIGHT_OPTIONS },
    { key: "pray_5x", label: "Pray 5x", kind: "select", options: SELECT_PRAY },
    { key: "open_to_relocate", label: "Open to relocate", kind: "select", options: SELECT_RELOCATION },
    { key: "dress", label: "Dress", kind: "select", options: SELECT_DRESS },
    { key: "employment", label: "Employment", kind: "text" },
    { key: "education", label: "Education", kind: "select", options: SELECT_EDUCATION },
    { key: "income", label: "Income", kind: "select", options: SELECT_INCOME },
    { key: "frame", label: "Frame", kind: "select", options: SELECT_FRAME },
    { key: "languages_spoken", label: "Languages spoken", kind: "multivalue" },
    { key: "pref_age_min", label: "Preferred age min", kind: "number" },
    { key: "pref_age_max", label: "Preferred age max", kind: "number" },
    { key: "pref_marital_status", label: "Preferred marital status", kind: "multiselect", options: SELECT_MARITAL_STATUS, helper: "Select all that apply." },
    { key: "pref_ethnicity", label: "Preferred ethnicity", kind: "multivalue" },
    { key: "pref_country_of_residence", label: "Preferred country of residence", kind: "multivalue" },
    { key: "relationship_with_islam", label: "Relationship with Islam", kind: "textarea" },
    { key: "role_as_spouse", label: "Role as spouse", kind: "textarea" },
    { key: "about_yourself", label: "About yourself", kind: "textarea" },
    { key: "envision_spouse", label: "Envision spouse", kind: "textarea" },
    { key: "envision_marriage", label: "Envision marriage", kind: "textarea" },
    { key: "spouse_religious_status_pref", label: "Spouse religious status preference", kind: "textarea" },
    { key: "open_to_relocate_details", label: "Open to relocate details", kind: "textarea" },
    { key: "health_concerns", label: "Health concerns", kind: "textarea" },
    { key: "other_preferences", label: "Other preferences", kind: "textarea" },
  ];
}

export function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [basicInfo, setBasicInfo] = useState<UserBasicInfoResponse | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [basicInfoError, setBasicInfoError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadIndex, setReloadIndex] = useState(0);

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [verificationSaving, setVerificationSaving] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [singleDraft, setSingleDraft] = useState<FieldValueMap>({});
  const [singleOriginal, setSingleOriginal] = useState<FieldValueMap>({});
  const [waliProfileDraft, setWaliProfileDraft] = useState<FieldValueMap>({});
  const [waliProfileOriginal, setWaliProfileOriginal] = useState<FieldValueMap>({});
  const [waliSisterDraft, setWaliSisterDraft] = useState<FieldValueMap>({});
  const [waliSisterOriginal, setWaliSisterOriginal] = useState<FieldValueMap>({});

  const basicRole = detail?.role ?? "";
  const isWali = basicRole === "wali";
  const singleFields = useMemo(() => buildSingleBasicInfoFields(basicRole), [basicRole]);
  const waliProfileFields = useMemo(() => buildWaliProfileFields(), []);
  const waliSisterFields = useMemo(() => buildWaliSisterFields(), []);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setDetailError(null);
      setBasicInfoError(null);
      setSectionError(null);
      setActionError(null);

      const [detailResult, basicInfoResult] = await Promise.allSettled([
        getUserDetail(id),
        getUserBasicInfo(id),
      ]);

      if (cancelled) return;

      if (detailResult.status === "fulfilled") {
        setDetail(detailResult.value);
      } else {
        const message =
          detailResult.reason instanceof ApiError ? detailResult.reason.message : "Unable to load user details.";
        setDetailError(message);
        setDetail(null);
      }

      if (basicInfoResult.status === "fulfilled") {
        setBasicInfo(basicInfoResult.value);
      } else {
        const error = basicInfoResult.reason;
        const message = error instanceof ApiError ? error.message : "Unable to load basic info.";
        setBasicInfo(null);
        setBasicInfoError(message);
      }

      setLoading(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [id, reloadIndex]);

  useEffect(() => {
    if (!detail) return;

    if (isWali && isWaliBasicInfo(basicInfo)) {
      setWaliProfileOriginal(normalizeFormRecord(basicInfo.wali_profile as Record<string, unknown>));
      setWaliProfileDraft(normalizeFormRecord(basicInfo.wali_profile as Record<string, unknown>));
      setWaliSisterOriginal(normalizeFormRecord(basicInfo.sister_info as Record<string, unknown>));
      setWaliSisterDraft(normalizeFormRecord(basicInfo.sister_info as Record<string, unknown>));
      return;
    }

    const source = (basicInfo ?? {}) as Record<string, unknown>;
    setSingleOriginal(normalizeFormRecord(source));
    setSingleDraft(normalizeFormRecord(source));
  }, [basicInfo, detail, isWali]);

  const detailView = useMemo(() => normalizeDetail(detail), [detail]);

  const startEditing = (section: string) => {
    setSectionError(null);
    setEditingSection(section);
  };

  const cancelEditing = () => {
    setSectionError(null);
    setEditingSection(null);

    if (isWali && isWaliBasicInfo(basicInfo)) {
      setWaliProfileDraft(normalizeFormRecord(basicInfo.wali_profile as Record<string, unknown>));
      setWaliSisterDraft(normalizeFormRecord(basicInfo.sister_info as Record<string, unknown>));
      return;
    }

    const source = (basicInfo ?? {}) as Record<string, unknown>;
    setSingleDraft(normalizeFormRecord(source));
  };

  const reloadAll = () => setReloadIndex((current) => current + 1);

  const saveSection = async (section: string) => {
    if (!id || !detail) return;

    const target: UserBasicInfoTarget | undefined =
      section === "wali_profile" || section === "sister_info" ? section : undefined;
    const fields =
      section === "wali_profile"
        ? waliProfileFields
        : section === "sister_info"
          ? waliSisterFields
          : singleFields;

    const draft =
      section === "wali_profile"
        ? waliProfileDraft
        : section === "sister_info"
          ? waliSisterDraft
          : singleDraft;

    const original =
      section === "wali_profile"
        ? waliProfileOriginal
        : section === "sister_info"
          ? waliSisterOriginal
          : singleOriginal;

    const payload = diffPayload(fields, original, draft);

    if (Object.keys(payload).length === 0) {
      setEditingSection(null);
      return;
    }

    setSavingSection(section);
    setSectionError(null);

    try {
      await updateUserBasicInfo(id, payload, target);
      const refreshed = await getUserBasicInfo(id);
      setBasicInfo(refreshed);
      setEditingSection(null);
    } catch (error) {
      setSectionError(error instanceof ApiError ? error.message : "Unable to save changes.");
    } finally {
      setSavingSection(null);
    }
  };

  const updateDraft = (section: string, key: string, value: string) => {
    if (section === "wali_profile") {
      setWaliProfileDraft((current) => ({ ...current, [key]: value }));
      return;
    }

    if (section === "sister_info") {
      setWaliSisterDraft((current) => ({ ...current, [key]: value }));
      return;
    }

    setSingleDraft((current) => ({ ...current, [key]: value }));
  };

  const handleVerification = async () => {
    if (!id || !detail) return;

    setVerificationSaving(true);
    setActionError(null);
    try {
      await setUserVerification(id, !detail.is_verified);
      setDetail((current) => (current ? { ...current, is_verified: !current.is_verified } : current));
      setVerifyDialogOpen(false);
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : "Unable to update verification.");
    } finally {
      setVerificationSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    setDeleteSaving(true);
    setActionError(null);
    try {
      await deleteUser(id);
      setDeleteDialogOpen(false);
      navigate("/users");
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : "Unable to delete this user.");
    } finally {
      setDeleteSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-[#415192]" />
          <p className="text-sm text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!detail || detailError) {
    return (
      <div className="p-8">
        <Link to="/users" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#415192] hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
          <p className="font-semibold">Could not load user details</p>
          <p className="mt-1">{detailError ?? "Unknown error."}</p>
          <button
            onClick={reloadAll}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#415192] shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const displayDetailRows = detailRows(detailView);

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link to="/users" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#415192] hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to users
          </Link>
          <h1 className="text-3xl font-semibold text-gray-900">User Detail</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review the admin record and update the role-specific basic information.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full bg-[#415192]/10 px-4 py-2 text-sm font-medium text-[#415192]">
            <Users className="mr-2 inline h-4 w-4" />
            {detail.role || "Unknown role"}
          </div>
          <div
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              detail.is_verified ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}
          >
            <ShieldCheck className="mr-2 inline h-4 w-4" />
            {detail.is_verified ? "Verified" : "Not verified"}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.85fr)]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">User details</h2>
                <p className="mt-1 text-sm text-gray-500">Core account data from the admin user endpoint.</p>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {displayDetailRows.map((row) => (
                  <div key={row.label}>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{row.label}</p>
                    <p className="mt-1 text-sm text-gray-900">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {isWali ? (
            <>
              <SectionCard
                title="Wali Profile"
                description="Primary wali-specific profile information."
                editing={editingSection === "wali_profile"}
                saving={savingSection === "wali_profile"}
                error={editingSection === "wali_profile" ? sectionError : null}
                onEdit={() => startEditing("wali_profile")}
                onCancel={cancelEditing}
                onSave={() => void saveSection("wali_profile")}
                canEdit={!basicInfoError}
                fields={waliProfileFields}
                draft={waliProfileDraft}
                onFieldChange={(key, value) => updateDraft("wali_profile", key, value)}
                readOnlyContent={renderReadOnlyGrid(waliProfileFields, waliProfileOriginal)}
              />

              <SectionCard
                title="Sister Info"
                description="The profile record attached to this wali account."
                editing={editingSection === "sister_info"}
                saving={savingSection === "sister_info"}
                error={editingSection === "sister_info" ? sectionError : null}
                onEdit={() => startEditing("sister_info")}
                onCancel={cancelEditing}
                onSave={() => void saveSection("sister_info")}
                canEdit={!basicInfoError}
                fields={waliSisterFields}
                draft={waliSisterDraft}
                onFieldChange={(key, value) => updateDraft("sister_info", key, value)}
                readOnlyContent={renderReadOnlyGrid(waliSisterFields, waliSisterOriginal)}
              />
            </>
          ) : (
            <SectionCard
              title="Basic Information"
              description={`Role-specific basic info for this ${detail.role || "user"}.`}
              editing={editingSection === "basic"}
              saving={savingSection === "basic"}
              error={editingSection === "basic" ? sectionError : null}
              onEdit={() => startEditing("basic")}
              onCancel={cancelEditing}
              onSave={() => void saveSection("basic")}
              canEdit={!basicInfoError}
              fields={singleFields}
              draft={singleDraft}
              onFieldChange={(key, value) => updateDraft("basic", key, value)}
              readOnlyContent={renderReadOnlyGrid(singleFields, singleOriginal)}
            />
          )}

          {basicInfoError ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-amber-800">
              <p className="font-semibold">Basic info is unavailable</p>
              <p className="mt-1">{basicInfoError}</p>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="relative h-40 w-40 overflow-hidden rounded-3xl bg-gradient-to-br from-[#415192] to-[#6c78b7] shadow-lg ring-4 ring-white">
                {detail.profile_picture ? (
                  <img
                    src={detail.profile_picture}
                    alt={`${detail.first_name} ${detail.last_name}`.trim() || detail.email}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-5xl font-semibold text-white">
                    {`${detail.first_name?.[0] ?? ""}${detail.last_name?.[0] ?? ""}`.trim() || detail.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="mt-5 min-w-0">
                <p className="truncate text-xl font-semibold text-gray-900">
                  {`${detail.first_name} ${detail.last_name}`.trim() || detail.email}
                </p>
                <p className="mt-1 truncate text-sm text-gray-500">{detail.email}</p>
                <p className="mt-3 text-sm text-gray-500">
                  {detail.city || detail.country ? [detail.city, detail.country].filter(Boolean).join(", ") : "Location not set"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900">Actions</h3>
            <p className="mt-1 text-sm text-gray-500">Moderation and matching shortcuts for this profile.</p>

            <div className="mt-5 space-y-3">
              {actionError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {actionError}
                </div>
              ) : null}

              <button
                onClick={() => setVerifyDialogOpen(true)}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  detail.is_verified
                    ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                    : "bg-[#415192] text-white hover:bg-[#354177]"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {detail.is_verified ? "Unverify Profile" : "Verify Profile"}
              </button>

              <button
                onClick={() => navigate("/matchmaking")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Heart className="h-4 w-4" />
                Suggest Match
              </button>

              <button
                onClick={() => setDeleteDialogOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete Profile
              </button>
            </div>
          </section>
        </div>
      </div>

      <AlertDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{detail.is_verified ? "Unverify this user?" : "Verify this user?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {detail.is_verified
                ? "This will remove the verified badge from the profile."
                : "This will mark the profile as verified in the admin dashboard."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={verificationSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleVerification();
              }}
              disabled={verificationSaving}
              className={detail.is_verified ? "bg-amber-600 text-white hover:bg-amber-700" : undefined}
            >
              {verificationSaving ? "Saving..." : detail.is_verified ? "Unverify" : "Verify"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the account and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
              disabled={deleteSaving}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteSaving ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
