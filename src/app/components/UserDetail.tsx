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
  dependsOn?: string;
  dependsValue?: string;
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

const ETHNICITY_OPTIONS: Option[] = [
  { label: "Afghan", value: "afghan" },
  { label: "African-American", value: "african_american" },
  { label: "Albanian", value: "albanian" },
  { label: "Algerian", value: "algerian" },
  { label: "American", value: "american" },
  { label: "Andorran", value: "andorran" },
  { label: "Ango", value: "angolan" },
  { label: "Anguillan", value: "anguillan" },
  { label: "Antigua", value: "antiguan" },
  { label: "Argentine", value: "argentine" },
  { label: "Armenian", value: "armenian" },
  { label: "Australian", value: "australian" },
  { label: "Austrian", value: "austrian" },
  { label: "Azerbaijani", value: "azerbaijani" },
  { label: "Bahamian", value: "bahamian" },
  { label: "Bahraini", value: "bahraini" },
  { label: "Bangladeshi", value: "bangladeshi" },
  { label: "Barbadian", value: "barbadian" },
  { label: "Belarusian", value: "belarusian" },
  { label: "Belgian", value: "belgian" },
  { label: "Belizean", value: "belizean" },
  { label: "Beninese", value: "beninese" },
  { label: "Bermudian", value: "bermudian" },
  { label: "Bhutanese", value: "bhutanese" },
  { label: "Black", value: "black" },
  { label: "Bolivian", value: "bolivian" },
  { label: "Bosnian", value: "bosnian" },
  { label: "Botswanan", value: "botswanan" },
  { label: "Brazilian", value: "brazilian" },
  { label: "British", value: "british" },
  { label: "British Virgin Islander", value: "british_vi" },
  { label: "Bruneian", value: "bruneian" },
  { label: "Bulgarian", value: "bulgarian" },
  { label: "Burkinan", value: "burkinan" },
  { label: "Burmese", value: "burmese" },
  { label: "Burundian", value: "burundian" },
  { label: "Cambodian", value: "cambodian" },
  { label: "Cameroonian", value: "cameroonian" },
  { label: "Canadian", value: "canadian" },
  { label: "Cape Verdean", value: "cape_verdean" },
  { label: "Cayman Islander", value: "cayman_islander" },
  { label: "Central African", value: "central_african" },
  { label: "Chadian", value: "chadian" },
  { label: "Chilean", value: "chilean" },
  { label: "Chinese", value: "chinese" },
  { label: "Colombian", value: "colombian" },
  { label: "Comoran", value: "comoran" },
  { label: "Congolese (Congo)", value: "congolese_rep" },
  { label: "Congolese (DRC)", value: "congolese_drc" },
  { label: "Cook Islander", value: "cook_islander" },
  { label: "Costa Rican", value: "costa_rican" },
  { label: "Croatian", value: "croatian" },
  { label: "Cuban", value: "cuban" },
  { label: "Cymraes", value: "cymraes" },
  { label: "Cymro", value: "cymro" },
  { label: "Cypriot", value: "cypriot" },
  { label: "Czech", value: "czech" },
  { label: "Danish", value: "danish" },
  { label: "Djiboutian", value: "djiboutian" },
  { label: "Dominican", value: "dominican" },
  { label: "Citizen of the Dominican Republic", value: "dominican_rep" },
  { label: "Dutch", value: "dutch" },
  { label: "East Timorese", value: "east_timorese" },
  { label: "Ecuadorean", value: "ecuadorean" },
  { label: "Egyptian", value: "egyptian" },
  { label: "Emirati", value: "emirati" },
  { label: "Equatorial Guinean", value: "equatorial_guinean" },
  { label: "Eritrean", value: "eritrean" },
  { label: "Estonian", value: "estonian" },
  { label: "Ethiopian", value: "ethiopian" },
  { label: "Faroese", value: "faroese" },
  { label: "Fijian", value: "fijian" },
  { label: "Filipino", value: "filipino" },
  { label: "Finnish", value: "finnish" },
  { label: "French", value: "french" },
  { label: "Gabonese", value: "gabonese" },
  { label: "Gambian", value: "gambian" },
  { label: "Georgian", value: "georgian" },
  { label: "German", value: "german" },
  { label: "Ghanaian", value: "ghanaian" },
  { label: "Gibraltarian", value: "gibraltarian" },
  { label: "Greek", value: "greek" },
  { label: "Greenlandic", value: "greenlandic" },
  { label: "Grenadian", value: "grenadian" },
  { label: "Guamanian", value: "guamanian" },
  { label: "Guatemalan", value: "guatemalan" },
  { label: "Citizen of Guinea-Bissau", value: "guinea_bissau" },
  { label: "Guinean", value: "guinean" },
  { label: "Guyanese", value: "guyanese" },
  { label: "Haitian", value: "haitian" },
  { label: "Honduran", value: "honduran" },
  { label: "Hong Konger", value: "hong_konger" },
  { label: "Hungarian", value: "hungarian" },
  { label: "Icelandic", value: "icelandic" },
  { label: "Indian", value: "indian" },
  { label: "Indonesian", value: "indonesian" },
  { label: "Iranian", value: "iranian" },
  { label: "Iraqi", value: "iraqi" },
  { label: "Irish", value: "irish" },
  { label: "Italian", value: "italian" },
  { label: "Ivorian", value: "ivorian" },
  { label: "Jamaican", value: "jamaican" },
  { label: "Japanese", value: "japanese" },
  { label: "Jordanian", value: "jordanian" },
  { label: "Kashmiri", value: "kashmiri" },
  { label: "Kazakh", value: "kazakh" },
  { label: "Kenyan", value: "kenyan" },
  { label: "Kittitian", value: "kittitian" },
  { label: "Citizen of Kiribati", value: "kiribati" },
  { label: "Kosovan", value: "kosovan" },
  { label: "Kurdish", value: "kurdish" },
  { label: "Kuwaiti", value: "kuwaiti" },
  { label: "Kyrgyz", value: "kyrgyz" },
  { label: "Lao", value: "lao" },
  { label: "Latvian", value: "latvian" },
  { label: "Lebanese", value: "lebanese" },
  { label: "Liberian", value: "liberian" },
  { label: "Libyan", value: "libyan" },
  { label: "Liechtenstein citizen", value: "liechtenstein" },
  { label: "Lithuanian", value: "lithuanian" },
  { label: "Luxembourger", value: "luxembourger" },
  { label: "Macanese", value: "macanese" },
  { label: "Macedonian", value: "macedonian" },
  { label: "Malagasy", value: "malagasy" },
  { label: "Malawian", value: "malawian" },
  { label: "Malaysian", value: "malaysian" },
  { label: "Maldivian", value: "maldivian" },
  { label: "Malian", value: "malian" },
  { label: "Maltese", value: "maltese" },
  { label: "Marshallese", value: "marshallese" },
  { label: "Martiniquais", value: "martiniquais" },
  { label: "Mauritanian", value: "mauritanian" },
  { label: "Mauritian", value: "mauritian" },
  { label: "Mexican", value: "mexican" },
  { label: "Micronesian", value: "micronesian" },
  { label: "Mixed Race", value: "mixed_race" },
  { label: "Moldovan", value: "moldovan" },
  { label: "Monegasque", value: "monegasque" },
  { label: "Mongolian", value: "mongolian" },
  { label: "Montenegrin", value: "montenegrin" },
  { label: "Montserratian", value: "montserratian" },
  { label: "Moroccan", value: "moroccan" },
  { label: "Mosotho", value: "mosotho" },
  { label: "Mozambican", value: "mozambican" },
  { label: "Namibian", value: "namibian" },
  { label: "Nauruan", value: "nauruan" },
  { label: "Nepalese", value: "nepalese" },
  { label: "New Zealander", value: "new_zealander" },
  { label: "Nicaraguan", value: "nicaraguan" },
  { label: "Nigerian", value: "nigerian" },
  { label: "Nigerien", value: "nigerien" },
  { label: "Niuean", value: "niuean" },
  { label: "North Korean", value: "north_korean" },
  { label: "Northern Irish", value: "northern_irish" },
  { label: "Norwegian", value: "norwegian" },
  { label: "Omani", value: "omani" },
  { label: "Pakistani", value: "pakistani" },
  { label: "Palauan", value: "palauan" },
  { label: "Palestinian", value: "palestinian" },
  { label: "Panamanian", value: "panamanian" },
  { label: "Papua New Guinean", value: "papua_new_guinean" },
  { label: "Paraguayan", value: "paraguayan" },
  { label: "Peruvian", value: "peruvian" },
  { label: "Pitcairn Islander", value: "pitcairn_islander" },
  { label: "Polish", value: "polish" },
  { label: "Portuguese", value: "portuguese" },
  { label: "Prydeinig", value: "prydeinig" },
  { label: "Puerto Rican", value: "puerto_rican" },
  { label: "Qatari", value: "qatari" },
  { label: "Romanian", value: "romanian" },
  { label: "Russian", value: "russian" },
  { label: "Rwandan", value: "rwandan" },
  { label: "Salvadorean", value: "salvadorean" },
  { label: "Sammarinese", value: "sammarinese" },
  { label: "Samoan", value: "samoan" },
  { label: "Sao Tomean", value: "sao_tomean" },
  { label: "Saudi Arabian", value: "saudi_arabian" },
  { label: "Scottish", value: "scottish" },
  { label: "Senegalese", value: "senegalese" },
  { label: "Serbian", value: "serbian" },
  { label: "Seychelles", value: "seychellois" },
  { label: "Sierra Leonean", value: "sierra_leonean" },
  { label: "Singaporean", value: "singaporean" },
  { label: "Slovak", value: "slovak" },
  { label: "Slovenian", value: "slovenian" },
  { label: "Solomon Islander", value: "solomon_islander" },
  { label: "Somali", value: "somali" },
  { label: "South African", value: "south_african" },
  { label: "South Korean", value: "south_korean" },
  { label: "South Sudanese", value: "south_sudanese" },
  { label: "Spanish", value: "spanish" },
  { label: "Sri Lankan", value: "sri_lankan" },
  { label: "St Helenian", value: "st_helenian" },
  { label: "St Lucian", value: "st_lucian" },
  { label: "Sudanese", value: "sudanese" },
  { label: "Surinamese", value: "surinamese" },
  { label: "Swazi", value: "swazi" },
  { label: "Swedish", value: "swedish" },
  { label: "Swiss", value: "swiss" },
  { label: "Syrian", value: "syrian" },
  { label: "Taiwanese", value: "taiwanese" },
  { label: "Tajik", value: "tajik" },
  { label: "Tanzanian", value: "tanzanian" },
  { label: "Thai", value: "thai" },
  { label: "Togolese", value: "togolese" },
  { label: "Tongan", value: "tongan" },
  { label: "Trinidadian", value: "trinidadian" },
  { label: "Tristanian", value: "tristanian" },
  { label: "Tunisian", value: "tunisian" },
  { label: "Turkish", value: "turkish" },
  { label: "Turkmen", value: "turkmen" },
  { label: "Turks and Caicos Islander", value: "turks_caicos" },
  { label: "Tuvaluan", value: "tuvaluan" },
  { label: "Ugandan", value: "ugandan" },
  { label: "Ukrainian", value: "ukrainian" },
  { label: "Uruguayan", value: "uruguayan" },
  { label: "Uzbek", value: "uzbek" },
  { label: "Vatican citizen", value: "vatican" },
  { label: "Citizen of Vanuatu", value: "vanuatu" },
  { label: "Venezuelan", value: "venezuelan" },
  { label: "Vietnamese", value: "vietnamese" },
  { label: "Vincentian", value: "vincentian" },
  { label: "Wallisian", value: "wallisian" },
  { label: "Welsh", value: "welsh" },
  { label: "White", value: "white" },
  { label: "Yemeni", value: "yemeni" },
  { label: "Zambian", value: "zambian" },
  { label: "Zimbabwean", value: "zimbabwean" },
  { label: "Other", value: "other" },
  { label: "Open to other Ethnicities", value: "open_other" },
];

const NATIONALITY_OPTIONS: Option[] = [
  { label: "Afghan", value: "afghan" },
  { label: "Albanian", value: "albanian" },
  { label: "Algerian", value: "algerian" },
  { label: "American", value: "american" },
  { label: "Andorran", value: "andorran" },
  { label: "Ango", value: "angolan" },
  { label: "Anguillan", value: "anguillan" },
  { label: "Antigua", value: "antiguan" },
  { label: "Argentine", value: "argentine" },
  { label: "Armenian", value: "armenian" },
  { label: "Australian", value: "australian" },
  { label: "Austrian", value: "austrian" },
  { label: "Azerbaijani", value: "azerbaijani" },
  { label: "Bahamian", value: "bahamian" },
  { label: "Bahraini", value: "bahraini" },
  { label: "Bangladeshi", value: "bangladeshi" },
  { label: "Barbadian", value: "barbadian" },
  { label: "Belarusian", value: "belarusian" },
  { label: "Belgian", value: "belgian" },
  { label: "Belizean", value: "belizean" },
  { label: "Beninese", value: "beninese" },
  { label: "Bermudian", value: "bermudian" },
  { label: "Bhutanese", value: "bhutanese" },
  { label: "Bolivian", value: "bolivian" },
  { label: "Bosnian", value: "bosnian" },
  { label: "Botswanan", value: "botswanan" },
  { label: "Brazilian", value: "brazilian" },
  { label: "British", value: "british" },
  { label: "British Virgin Islander", value: "british_vi" },
  { label: "Bruneian", value: "bruneian" },
  { label: "Bulgarian", value: "bulgarian" },
  { label: "Burkinan", value: "burkinan" },
  { label: "Burmese", value: "burmese" },
  { label: "Burundian", value: "burundian" },
  { label: "Cambodian", value: "cambodian" },
  { label: "Cameroonian", value: "cameroonian" },
  { label: "Canadian", value: "canadian" },
  { label: "Cape Verdean", value: "cape_verdean" },
  { label: "Cayman Islander", value: "cayman_islander" },
  { label: "Central African", value: "central_african" },
  { label: "Chadian", value: "chadian" },
  { label: "Chilean", value: "chilean" },
  { label: "Chinese", value: "chinese" },
  { label: "Colombian", value: "colombian" },
  { label: "Comoran", value: "comoran" },
  { label: "Congolese (Congo)", value: "congolese_rep" },
  { label: "Congolese (DRC)", value: "congolese_drc" },
  { label: "Cook Islander", value: "cook_islander" },
  { label: "Costa Rican", value: "costa_rican" },
  { label: "Croatian", value: "croatian" },
  { label: "Cuban", value: "cuban" },
  { label: "Cymraes", value: "cymraes" },
  { label: "Cymro", value: "cymro" },
  { label: "Cypriot", value: "cypriot" },
  { label: "Czech", value: "czech" },
  { label: "Danish", value: "danish" },
  { label: "Djiboutian", value: "djiboutian" },
  { label: "Dominican", value: "dominican" },
  { label: "Citizen of the Dominican Republic", value: "dominican_rep" },
  { label: "Dutch", value: "dutch" },
  { label: "East Timorese", value: "east_timorese" },
  { label: "Ecuadorean", value: "ecuadorean" },
  { label: "Egyptian", value: "egyptian" },
  { label: "Emirati", value: "emirati" },
  { label: "Equatorial Guinean", value: "equatorial_guinean" },
  { label: "Eritrean", value: "eritrean" },
  { label: "Estonian", value: "estonian" },
  { label: "Ethiopian", value: "ethiopian" },
  { label: "Faroese", value: "faroese" },
  { label: "Fijian", value: "fijian" },
  { label: "Filipino", value: "filipino" },
  { label: "Finnish", value: "finnish" },
  { label: "French", value: "french" },
  { label: "Gabonese", value: "gabonese" },
  { label: "Gambian", value: "gambian" },
  { label: "Georgian", value: "georgian" },
  { label: "German", value: "german" },
  { label: "Ghanaian", value: "ghanaian" },
  { label: "Gibraltarian", value: "gibraltarian" },
  { label: "Greek", value: "greek" },
  { label: "Greenlandic", value: "greenlandic" },
  { label: "Grenadian", value: "grenadian" },
  { label: "Guamanian", value: "guamanian" },
  { label: "Guatemalan", value: "guatemalan" },
  { label: "Citizen of Guinea-Bissau", value: "guinea_bissau" },
  { label: "Guinean", value: "guinean" },
  { label: "Guyanese", value: "guyanese" },
  { label: "Haitian", value: "haitian" },
  { label: "Honduran", value: "honduran" },
  { label: "Hong Konger", value: "hong_konger" },
  { label: "Hungarian", value: "hungarian" },
  { label: "Icelandic", value: "icelandic" },
  { label: "Indian", value: "indian" },
  { label: "Indonesian", value: "indonesian" },
  { label: "Iranian", value: "iranian" },
  { label: "Iraqi", value: "iraqi" },
  { label: "Irish", value: "irish" },
  { label: "Italian", value: "italian" },
  { label: "Ivorian", value: "ivorian" },
  { label: "Jamaican", value: "jamaican" },
  { label: "Japanese", value: "japanese" },
  { label: "Jordanian", value: "jordanian" },
  { label: "Kazakh", value: "kazakh" },
  { label: "Kenyan", value: "kenyan" },
  { label: "Kittitian", value: "kittitian" },
  { label: "Citizen of Kiribati", value: "kiribati" },
  { label: "Kosovan", value: "kosovan" },
  { label: "Kurdish", value: "kurdish" },
  { label: "Kuwaiti", value: "kuwaiti" },
  { label: "Kyrgyz", value: "kyrgyz" },
  { label: "Lao", value: "lao" },
  { label: "Latvian", value: "latvian" },
  { label: "Lebanese", value: "lebanese" },
  { label: "Liberian", value: "liberian" },
  { label: "Libyan", value: "libyan" },
  { label: "Liechtenstein citizen", value: "liechtenstein" },
  { label: "Lithuanian", value: "lithuanian" },
  { label: "Luxembourger", value: "luxembourger" },
  { label: "Macanese", value: "macanese" },
  { label: "Macedonian", value: "macedonian" },
  { label: "Malagasy", value: "malagasy" },
  { label: "Malawian", value: "malawian" },
  { label: "Malaysian", value: "malaysian" },
  { label: "Maldivian", value: "maldivian" },
  { label: "Malian", value: "malian" },
  { label: "Maltese", value: "maltese" },
  { label: "Marshallese", value: "marshallese" },
  { label: "Martiniquais", value: "martiniquais" },
  { label: "Mauritanian", value: "mauritanian" },
  { label: "Mauritian", value: "mauritian" },
  { label: "Mexican", value: "mexican" },
  { label: "Micronesian", value: "micronesian" },
  { label: "Moldovan", value: "moldovan" },
  { label: "Monegasque", value: "monegasque" },
  { label: "Mongolian", value: "mongolian" },
  { label: "Montenegrin", value: "montenegrin" },
  { label: "Montserratian", value: "montserratian" },
  { label: "Moroccan", value: "moroccan" },
  { label: "Mosotho", value: "mosotho" },
  { label: "Mozambican", value: "mozambican" },
  { label: "Namibian", value: "namibian" },
  { label: "Nauruan", value: "nauruan" },
  { label: "Nepalese", value: "nepalese" },
  { label: "New Zealander", value: "new_zealander" },
  { label: "Nicaraguan", value: "nicaraguan" },
  { label: "Nigerian", value: "nigerian" },
  { label: "Nigerien", value: "nigerien" },
  { label: "Niuean", value: "niuean" },
  { label: "North Korean", value: "north_korean" },
  { label: "Northern Irish", value: "northern_irish" },
  { label: "Norwegian", value: "norwegian" },
  { label: "Omani", value: "omani" },
  { label: "Pakistani", value: "pakistani" },
  { label: "Palauan", value: "palauan" },
  { label: "Palestinian", value: "palestinian" },
  { label: "Panamanian", value: "panamanian" },
  { label: "Papua New Guinean", value: "papua_new_guinean" },
  { label: "Paraguayan", value: "paraguayan" },
  { label: "Peruvian", value: "peruvian" },
  { label: "Pitcairn Islander", value: "pitcairn_islander" },
  { label: "Polish", value: "polish" },
  { label: "Portuguese", value: "portuguese" },
  { label: "Prydeinig", value: "prydeinig" },
  { label: "Puerto Rican", value: "puerto_rican" },
  { label: "Qatari", value: "qatari" },
  { label: "Romanian", value: "romanian" },
  { label: "Russian", value: "russian" },
  { label: "Rwandan", value: "rwandan" },
  { label: "Salvadorean", value: "salvadorean" },
  { label: "Sammarinese", value: "sammarinese" },
  { label: "Samoan", value: "samoan" },
  { label: "Sao Tomean", value: "sao_tomean" },
  { label: "Saudi Arabian", value: "saudi_arabian" },
  { label: "Scottish", value: "scottish" },
  { label: "Senegalese", value: "senegalese" },
  { label: "Serbian", value: "serbian" },
  { label: "Seychelles", value: "seychellois" },
  { label: "Sierra Leonean", value: "sierra_leonean" },
  { label: "Singaporean", value: "singaporean" },
  { label: "Slovak", value: "slovak" },
  { label: "Slovenian", value: "slovenian" },
  { label: "Solomon Islander", value: "solomon_islander" },
  { label: "Somali", value: "somali" },
  { label: "South African", value: "south_african" },
  { label: "South Korean", value: "south_korean" },
  { label: "South Sudanese", value: "south_sudanese" },
  { label: "Spanish", value: "spanish" },
  { label: "Sri Lankan", value: "sri_lankan" },
  { label: "St Helenian", value: "st_helenian" },
  { label: "St Lucian", value: "st_lucian" },
  { label: "Sudanese", value: "sudanese" },
  { label: "Surinamese", value: "surinamese" },
  { label: "Swazi", value: "swazi" },
  { label: "Swedish", value: "swedish" },
  { label: "Swiss", value: "swiss" },
  { label: "Syrian", value: "syrian" },
  { label: "Taiwanese", value: "taiwanese" },
  { label: "Tajik", value: "tajik" },
  { label: "Tanzanian", value: "tanzanian" },
  { label: "Thai", value: "thai" },
  { label: "Togolese", value: "togolese" },
  { label: "Tongan", value: "tongan" },
  { label: "Trinidadian", value: "trinidadian" },
  { label: "Tristanian", value: "tristanian" },
  { label: "Tunisian", value: "tunisian" },
  { label: "Turkish", value: "turkish" },
  { label: "Turkmen", value: "turkmen" },
  { label: "Turks and Caicos Islander", value: "turks_caicos" },
  { label: "Tuvaluan", value: "tuvaluan" },
  { label: "Ugandan", value: "ugandan" },
  { label: "Ukrainian", value: "ukrainian" },
  { label: "Uruguayan", value: "uruguayan" },
  { label: "Uzbek", value: "uzbek" },
  { label: "Vatican citizen", value: "vatican" },
  { label: "Citizen of Vanuatu", value: "vanuatu" },
  { label: "Venezuelan", value: "venezuelan" },
  { label: "Vietnamese", value: "vietnamese" },
  { label: "Vincentian", value: "vincentian" },
  { label: "Wallisian", value: "wallisian" },
  { label: "Welsh", value: "welsh" },
  { label: "Yemeni", value: "yemeni" },
  { label: "Zambian", value: "zambian" },
  { label: "Zimbabwean", value: "zimbabwean" },
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
  "mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-[#415192] focus:ring-2 focus:ring-[#415192]/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

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

function pickFieldValues(source: FieldValueMap, fields: FieldDefinition[]): FieldValueMap {
  const output: FieldValueMap = {};

  for (const field of fields) {
    output[field.key] = source[field.key] ?? "";
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

function normalizePercentage(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(parsed)) return 0;
  return Math.min(100, Math.max(0, parsed));
}

function formatPercentage(value: number) {
  return `${Math.round(value)}%`;
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
  disabled,
}: {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      <span>{field.label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} disabled={disabled}>
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
  disabled,
}: {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
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
        disabled={disabled}
      />
      {field.helper ? <p className="mt-1 text-xs text-gray-500">{field.helper}</p> : null}
    </label>
  );
}

function TextareaField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      <span>{field.label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={`${inputClass} min-h-28 resize-y`}
        disabled={disabled}
      />
      {field.helper ? <p className="mt-1 text-xs text-gray-500">{field.helper}</p> : null}
    </label>
  );
}

function BooleanField({
  field,
  value,
  onChange,
  disabled,
}: {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      <span>{field.label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} disabled={disabled}>
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
  disabled,
}: {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  switch (field.kind) {
    case "select":
      return <SelectField field={field} value={value} onChange={onChange} disabled={disabled} />;
    case "multiselect":
      return <MultiSelectField field={field} value={value} onChange={onChange} />;
    case "textarea":
      return <TextareaField field={field} value={value} onChange={onChange} disabled={disabled} />;
    case "boolean":
      return <BooleanField field={field} value={value} onChange={onChange} disabled={disabled} />;
    case "number":
      return <TextField field={field} value={value} onChange={onChange} type="number" disabled={disabled} />;
    case "date":
      return <TextField field={field} value={value} onChange={onChange} type="date" disabled={disabled} />;
    case "multivalue":
      return (
        <TextField
          field={{
            ...field,
            helper: field.helper ?? "Separate multiple values with commas.",
          }}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    default:
      return <TextField field={field} value={value} onChange={onChange} disabled={disabled} />;
  }
}

function isFieldDisabled(field: FieldDefinition, draft: FieldValueMap) {
  if (!field.dependsOn) return false;
  return (draft[field.dependsOn] ?? "") !== (field.dependsValue ?? "");
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
    <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
      {fields.map((field) => {
        const value = values[field.key] ?? "";
        const displayValue = field.options ? formatOptionDisplayValue(field.options, value) : formatDisplayValue(value);
        return (
          <div key={field.key} className="space-y-1">
            <p className="text-xs font-medium text-slate-500">{field.label}</p>
            <p className="text-sm font-medium text-slate-900">{displayValue}</p>
          </div>
        );
      })}
    </div>
  );
}

function formatOptionDisplayValue(options: Option[], value: string) {
  if (!value.trim()) return "Not set";

  const optionMap = new Map(options.map((option) => [option.value, option.label]));
  const values = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (values.length === 0) return "Not set";

  return values.map((item) => optionMap.get(item) ?? item).join(", ");
}

function ProfileCompletion({
  value,
}: {
  value: number;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  const isComplete = clamped === 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">Profile completion</p>
        <p className={`text-xs font-semibold ${isComplete ? "text-emerald-600" : "text-slate-500"}`}>
          {formatPercentage(clamped)}
        </p>
      </div>

      <div className="mt-2 h-1.5 rounded-full bg-slate-200">
        <div
          className={`h-1.5 rounded-full transition-all duration-300 ${isComplete ? "bg-emerald-500" : "bg-[#415192]"}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

function getMaleFemaleLabels(role: string, key: string) {
  const isFemale = role === "female";

  const labelMap: Record<string, string> = {
    how_found: "How did you find us?",
    has_children: isFemale ? "Do you have children?" : "Do you have children?",
    children_count: isFemale ? "How many children do you have?" : "How many children do you have?",
    pray_5x: "Pray 5x a day?",
    open_to_relocate: isFemale ? "Are you open to relocating?" : "Are you open to relocating?",
    dress: isFemale ? "How do you dress?" : "How do you dress?",
    preferred_dress: "How do they dress?",
    preferred_country_of_residence: "Preference to Country of Residence (or Region)",
    relationship_with_islam: "Describe your relationship with Islam?",
    role_as_spouse: "How do you envision your role as a spouse, what do you believe your role is?",
    about_yourself: "Tell me a bit about yourself (hobbies, interests, etc)",
    envision_spouse: "How do you envision your spouse to be, what do you believe their role is?",
    envision_marriage: "How do you envision your marriage to be?",
    spouse_religious_status_pref: "Preference on spouse's religious status?",
    open_to_relocate_details: "Are you open to relocating?",
    health_concerns: "Any additional information or health concerns?",
    other_preferences: "Any other preferences?",
    education: "Education Level",
  };

  return labelMap[key];
}

function getWaliLabel(key: string) {
  const labelMap: Record<string, string> = {
    how_found: "How did you find us?",
    has_children: "Does he/she have children?",
    children_count: "How many children do she have?",
    pray_5x: "Pray 5x a day?",
    open_to_relocate: "Is she open to relocating?",
    dress: "How does she dress?",
    preferred_country_of_residence: "Preference to Country of Residence (or Region)",
    relationship_with_islam: "Describe your relationship with Islam?",
    role_as_spouse: "How do you envision your role as a spouse, what do you believe your role is?",
    about_yourself: "Tell me a bit about yourself (hobbies, interests, etc)",
    envision_spouse: "How do you envision your spouse to be, what do you believe their role is?",
    envision_marriage: "How do you envision your marriage to be?",
    spouse_religious_status_pref: "Preference on spouse's religious status?",
    open_to_relocate_details: "Are you open to relocating?",
    health_concerns: "Any additional information or health concerns?",
    other_preferences: "Any other preferences?",
    education: "Education Level",
  };

  return labelMap[key];
}

function buildSingleProfileFields(role: string): FieldDefinition[] {
  const fields: FieldDefinition[] = [
    { key: "how_found", label: getMaleFemaleLabels(role, "how_found") ?? "How found", kind: "multiselect", options: HOW_FOUND_OPTIONS, helper: "Select all that apply." },
    { key: "phone", label: "Phone", kind: "text" },
    { key: "date_of_birth", label: "Date of birth", kind: "date" },
    { key: "city", label: "City", kind: "text" },
    { key: "country", label: "Country", kind: "text" },
    { key: "sect", label: "Sect", kind: "select", options: SELECT_SECT },
    { key: "marital_status", label: "Marital status", kind: "select", options: SELECT_MARITAL_STATUS },
    { key: "ethnicity", label: "Ethnicity", kind: "multiselect", options: ETHNICITY_OPTIONS, helper: "Select all that apply." },
    { key: "nationality", label: "Nationality", kind: "multiselect", options: NATIONALITY_OPTIONS, helper: "Select all that apply." },
    { key: "has_children", label: getMaleFemaleLabels(role, "has_children") ?? "Has children", kind: "boolean" },
    {
      key: "children_count",
      label: getMaleFemaleLabels(role, "children_count") ?? "Children count",
      kind: "select",
      options: SELECT_CHILDREN_COUNT,
      dependsOn: "has_children",
      dependsValue: "yes",
    },
    { key: "height", label: "Height", kind: "select", options: role === "male" ? MALE_HEIGHT_OPTIONS : FEMALE_HEIGHT_OPTIONS },
    { key: "weight", label: "Weight", kind: "select", options: role === "male" ? MALE_WEIGHT_OPTIONS : FEMALE_WEIGHT_OPTIONS },
    { key: "pray_5x", label: getMaleFemaleLabels(role, "pray_5x") ?? "Pray 5x", kind: "select", options: SELECT_PRAY },
    { key: "open_to_relocate", label: getMaleFemaleLabels(role, "open_to_relocate") ?? "Open to relocate", kind: "select", options: SELECT_RELOCATION },
    ...(role === "female"
      ? [{ key: "dress", label: getMaleFemaleLabels(role, "dress") ?? "Dress", kind: "select", options: SELECT_DRESS } as FieldDefinition]
      : [{ key: "preferred_dress", label: getMaleFemaleLabels(role, "preferred_dress") ?? "Preferred dress", kind: "select", options: SELECT_DRESS } as FieldDefinition]),
    { key: "employment", label: "Employment", kind: "text" },
    { key: "education", label: getMaleFemaleLabels(role, "education") ?? "Education", kind: "select", options: SELECT_EDUCATION },
    { key: "income", label: "Income", kind: "select", options: SELECT_INCOME },
    { key: "frame", label: "Frame", kind: "select", options: SELECT_FRAME },
    { key: "languages_spoken", label: "Languages spoken", kind: "multivalue", helper: "Use commas for multiple values." },
    ...(role === "female"
      ? [
          { key: "wali_name", label: "Wali name", kind: "text" } as FieldDefinition,
          { key: "wali_relation", label: "Wali relation", kind: "text" } as FieldDefinition,
          { key: "wali_number", label: "Wali number", kind: "text" } as FieldDefinition,
        ]
      : []),
  ];

  return fields;
}

function buildSinglePreferenceFields(): FieldDefinition[] {
  return [
    { key: "pref_age_min", label: "Preferred age min", kind: "number" },
    { key: "pref_age_max", label: "Preferred age max", kind: "number" },
    { key: "pref_marital_status", label: "Preferred marital status", kind: "multiselect", options: SELECT_MARITAL_STATUS, helper: "Select all that apply." },
    { key: "pref_ethnicity", label: "Preferred ethnicity", kind: "multiselect", options: ETHNICITY_OPTIONS, helper: "Select all that apply." },
    { key: "pref_country_of_residence", label: "Preference to Country of Residence (or Region)", kind: "multivalue" },
  ];
}

function buildSingleMarriageFields(): FieldDefinition[] {
  return [
    { key: "relationship_with_islam", label: "Describe your relationship with Islam?", kind: "textarea" },
    { key: "role_as_spouse", label: "How do you envision your role as a spouse, what do you believe your role is?", kind: "textarea" },
    { key: "about_yourself", label: "Tell me a bit about yourself (hobbies, interests, etc)", kind: "textarea" },
    { key: "envision_spouse", label: "How do you envision your spouse to be, what do you believe their role is?", kind: "textarea" },
    { key: "envision_marriage", label: "How do you envision your marriage to be?", kind: "textarea" },
    { key: "spouse_religious_status_pref", label: "Preference on spouse's religious status?", kind: "textarea" },
    { key: "open_to_relocate_details", label: "Are you open to relocating?", kind: "textarea" },
    { key: "health_concerns", label: "Any additional information or health concerns?", kind: "textarea" },
    { key: "other_preferences", label: "Any other preferences?", kind: "textarea" },
  ];
}

function buildWaliProfileFields(): FieldDefinition[] {
  return [
    { key: "how_found", label: getWaliLabel("how_found") ?? "How found", kind: "multiselect", options: HOW_FOUND_OPTIONS, helper: "Select all that apply." },
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
    { key: "ethnicity", label: "Ethnicity", kind: "multiselect", options: ETHNICITY_OPTIONS, helper: "Select all that apply." },
    { key: "nationality", label: "Nationality", kind: "multiselect", options: NATIONALITY_OPTIONS, helper: "Select all that apply." },
    { key: "has_children", label: getWaliLabel("has_children") ?? "Has children", kind: "boolean" },
    {
      key: "children_count",
      label: getWaliLabel("children_count") ?? "Children count",
      kind: "select",
      options: SELECT_CHILDREN_COUNT,
      dependsOn: "has_children",
      dependsValue: "yes",
    },
    { key: "height", label: "Height", kind: "select", options: FEMALE_HEIGHT_OPTIONS },
    { key: "weight", label: "Weight", kind: "select", options: FEMALE_WEIGHT_OPTIONS },
    { key: "pray_5x", label: getWaliLabel("pray_5x") ?? "Pray 5x", kind: "select", options: SELECT_PRAY },
    { key: "open_to_relocate", label: getWaliLabel("open_to_relocate") ?? "Open to relocate", kind: "select", options: SELECT_RELOCATION },
    { key: "dress", label: getWaliLabel("dress") ?? "Dress", kind: "select", options: SELECT_DRESS },
    { key: "employment", label: "Employment", kind: "text" },
    { key: "education", label: getWaliLabel("education") ?? "Education", kind: "select", options: SELECT_EDUCATION },
    { key: "income", label: "Income", kind: "select", options: SELECT_INCOME },
    { key: "frame", label: "Frame", kind: "select", options: SELECT_FRAME },
    { key: "languages_spoken", label: "Languages spoken", kind: "multivalue" },
  ];
}

function buildWaliPreferenceFields(): FieldDefinition[] {
  return [
    { key: "pref_age_min", label: "Preferred age min", kind: "number" },
    { key: "pref_age_max", label: "Preferred age max", kind: "number" },
    { key: "pref_marital_status", label: "Preferred marital status", kind: "multiselect", options: SELECT_MARITAL_STATUS, helper: "Select all that apply." },
    { key: "pref_ethnicity", label: "Preferred ethnicity", kind: "multiselect", options: ETHNICITY_OPTIONS, helper: "Select all that apply." },
    { key: "pref_country_of_residence", label: "Preference to Country of Residence (or Region)", kind: "multivalue" },
  ];
}

function buildWaliMarriageFields(): FieldDefinition[] {
  return [
    { key: "relationship_with_islam", label: "Describe your relationship with Islam?", kind: "textarea" },
    { key: "role_as_spouse", label: "How do you envision your role as a spouse, what do you believe your role is?", kind: "textarea" },
    { key: "about_yourself", label: "Tell me a bit about yourself (hobbies, interests, etc)", kind: "textarea" },
    { key: "envision_spouse", label: "How do you envision your spouse to be, what do you believe their role is?", kind: "textarea" },
    { key: "envision_marriage", label: "How do you envision your marriage to be?", kind: "textarea" },
    { key: "spouse_religious_status_pref", label: "Preference on spouse's religious status?", kind: "textarea" },
    { key: "open_to_relocate_details", label: "Are you open to relocating?", kind: "textarea" },
    { key: "health_concerns", label: "Any additional information or health concerns?", kind: "textarea" },
    { key: "other_preferences", label: "Any other preferences?", kind: "textarea" },
  ];
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
    <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div>
          <h2 className="text-[17px] font-semibold tracking-tight text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        {editing ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
          >
            <Edit3 className="h-4 w-4" />
            Edit
          </button>
        )}
      </div>

      <div className="px-6 py-6">
        {editing ? (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              {fields.map((field) => (
                <FieldEditor
                  key={field.key}
                  field={field}
                  value={draft[field.key] ?? ""}
                  onChange={(value) => onFieldChange(field.key, value)}
                  disabled={isFieldDisabled(field, draft)}
                />
              ))}
            </div>
            {error ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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

  const [singleProfileDraft, setSingleProfileDraft] = useState<FieldValueMap>({});
  const [singleProfileOriginal, setSingleProfileOriginal] = useState<FieldValueMap>({});
  const [singlePreferenceDraft, setSinglePreferenceDraft] = useState<FieldValueMap>({});
  const [singlePreferenceOriginal, setSinglePreferenceOriginal] = useState<FieldValueMap>({});
  const [singleMarriageDraft, setSingleMarriageDraft] = useState<FieldValueMap>({});
  const [singleMarriageOriginal, setSingleMarriageOriginal] = useState<FieldValueMap>({});
  const [waliProfileDraft, setWaliProfileDraft] = useState<FieldValueMap>({});
  const [waliProfileOriginal, setWaliProfileOriginal] = useState<FieldValueMap>({});
  const [waliSisterDraft, setWaliSisterDraft] = useState<FieldValueMap>({});
  const [waliSisterOriginal, setWaliSisterOriginal] = useState<FieldValueMap>({});
  const [waliPreferenceDraft, setWaliPreferenceDraft] = useState<FieldValueMap>({});
  const [waliPreferenceOriginal, setWaliPreferenceOriginal] = useState<FieldValueMap>({});
  const [waliMarriageDraft, setWaliMarriageDraft] = useState<FieldValueMap>({});
  const [waliMarriageOriginal, setWaliMarriageOriginal] = useState<FieldValueMap>({});

  const basicRole = detail?.role ?? "";
  const isWali = basicRole === "wali";
  const singleProfileFields = useMemo(() => buildSingleProfileFields(basicRole), [basicRole]);
  const singlePreferenceFields = useMemo(() => buildSinglePreferenceFields(), []);
  const singleMarriageFields = useMemo(() => buildSingleMarriageFields(), []);
  const waliProfileFields = useMemo(() => buildWaliProfileFields(), []);
  const waliSisterFields = useMemo(() => buildWaliSisterFields(), []);
  const waliPreferenceFields = useMemo(() => buildWaliPreferenceFields(), []);
  const waliMarriageFields = useMemo(() => buildWaliMarriageFields(), []);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setDetailError("Missing user id.");
      return;
    }

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
      const waliProfileSource = normalizeFormRecord(basicInfo.wali_profile as Record<string, unknown>);
      const sisterSource = normalizeFormRecord(basicInfo.sister_info as Record<string, unknown>);

      setWaliProfileOriginal(pickFieldValues(waliProfileSource, waliProfileFields));
      setWaliProfileDraft(pickFieldValues(waliProfileSource, waliProfileFields));

      setWaliSisterOriginal(pickFieldValues(sisterSource, waliSisterFields));
      setWaliSisterDraft(pickFieldValues(sisterSource, waliSisterFields));

      setWaliPreferenceOriginal(pickFieldValues(sisterSource, waliPreferenceFields));
      setWaliPreferenceDraft(pickFieldValues(sisterSource, waliPreferenceFields));

      setWaliMarriageOriginal(pickFieldValues(sisterSource, waliMarriageFields));
      setWaliMarriageDraft(pickFieldValues(sisterSource, waliMarriageFields));
      return;
    }

    const source = (basicInfo ?? {}) as Record<string, unknown>;
    const normalized = normalizeFormRecord(source);
    setSingleProfileOriginal(pickFieldValues(normalized, singleProfileFields));
    setSingleProfileDraft(pickFieldValues(normalized, singleProfileFields));
    setSinglePreferenceOriginal(pickFieldValues(normalized, singlePreferenceFields));
    setSinglePreferenceDraft(pickFieldValues(normalized, singlePreferenceFields));
    setSingleMarriageOriginal(pickFieldValues(normalized, singleMarriageFields));
    setSingleMarriageDraft(pickFieldValues(normalized, singleMarriageFields));
  }, [
    basicInfo,
    detail,
    isWali,
    singleMarriageFields,
    singlePreferenceFields,
    singleProfileFields,
    waliMarriageFields,
    waliPreferenceFields,
    waliProfileFields,
    waliSisterFields,
  ]);

  const detailView = useMemo(() => normalizeDetail(detail), [detail]);

  function updateDraft(section: string, key: string, value: string) {
    if (section === "wali_profile") {
      setWaliProfileDraft((current) => ({ ...current, [key]: value }));
      return;
    }

    if (section === "wali_sister") {
      setWaliSisterDraft((current) => {
        const next = { ...current, [key]: value };

        if (key === "has_children" && value !== "yes") {
          next.children_count = "";
        }

        return next;
      });
      return;
    }

    if (section === "wali_preferences") {
      setWaliPreferenceDraft((current) => ({ ...current, [key]: value }));
      return;
    }

    if (section === "wali_marriage") {
      setWaliMarriageDraft((current) => ({ ...current, [key]: value }));
      return;
    }

    if (section === "single_profile") {
      setSingleProfileDraft((current) => {
        const next = { ...current, [key]: value };

        if (key === "has_children" && value !== "yes") {
          next.children_count = "";
        }

        return next;
      });
      return;
    }

    if (section === "single_preferences") {
      setSinglePreferenceDraft((current) => ({ ...current, [key]: value }));
      return;
    }

    if (section === "single_marriage") {
      setSingleMarriageDraft((current) => ({ ...current, [key]: value }));
    }
  }

  const reloadAll = () => setReloadIndex((current) => current + 1);

  const resetSectionDraft = (sectionKey: string) => {
    if (sectionKey === "wali_profile") {
      setWaliProfileDraft({ ...waliProfileOriginal });
      return;
    }

    if (sectionKey === "wali_sister") {
      setWaliSisterDraft({ ...waliSisterOriginal });
      return;
    }

    if (sectionKey === "wali_preferences") {
      setWaliPreferenceDraft({ ...waliPreferenceOriginal });
      return;
    }

    if (sectionKey === "wali_marriage") {
      setWaliMarriageDraft({ ...waliMarriageOriginal });
      return;
    }

    if (sectionKey === "single_profile") {
      setSingleProfileDraft({ ...singleProfileOriginal });
      return;
    }

    if (sectionKey === "single_preferences") {
      setSinglePreferenceDraft({ ...singlePreferenceOriginal });
      return;
    }

    if (sectionKey === "single_marriage") {
      setSingleMarriageDraft({ ...singleMarriageOriginal });
    }
  };

  const getSectionConfig = (sectionKey: string) => {
    switch (sectionKey) {
      case "wali_profile":
        return { fields: waliProfileFields, draft: waliProfileDraft, original: waliProfileOriginal, target: "wali_profile" as const };
      case "wali_sister":
        return { fields: waliSisterFields, draft: waliSisterDraft, original: waliSisterOriginal, target: "sister_info" as const };
      case "wali_preferences":
        return { fields: waliPreferenceFields, draft: waliPreferenceDraft, original: waliPreferenceOriginal, target: "sister_info" as const };
      case "wali_marriage":
        return { fields: waliMarriageFields, draft: waliMarriageDraft, original: waliMarriageOriginal, target: "sister_info" as const };
      case "single_profile":
        return { fields: singleProfileFields, draft: singleProfileDraft, original: singleProfileOriginal, target: undefined };
      case "single_preferences":
        return { fields: singlePreferenceFields, draft: singlePreferenceDraft, original: singlePreferenceOriginal, target: undefined };
      case "single_marriage":
        return { fields: singleMarriageFields, draft: singleMarriageDraft, original: singleMarriageOriginal, target: undefined };
      default:
        return null;
    }
  };

  const startEditing = (sectionKey: string) => {
    setSectionError(null);
    setEditingSection(sectionKey);
  };

  const cancelEditing = (sectionKey: string) => {
    setSectionError(null);
    setEditingSection((current) => (current === sectionKey ? null : current));
    resetSectionDraft(sectionKey);
  };

  const saveSection = async (sectionKey: string) => {
    if (!id || !detail) return;

    const config = getSectionConfig(sectionKey);
    if (!config) return;

    const payload = diffPayload(config.fields, config.original, config.draft);
    if (Object.keys(payload).length === 0) {
      setEditingSection(null);
      return;
    }

    setSavingSection(sectionKey);
    setSectionError(null);

    try {
      await updateUserBasicInfo(id, payload, config.target);
      const [refreshedDetail, refreshedBasicInfo] = await Promise.all([getUserDetail(id), getUserBasicInfo(id)]);
      setDetail(refreshedDetail);
      setBasicInfo(refreshedBasicInfo);
      setEditingSection(null);
    } catch (error) {
      setSectionError(error instanceof ApiError ? error.message : "Unable to save changes.");
    } finally {
      setSavingSection(null);
    }
  };

  const handleVerification = async () => {
    if (!id || !detail) return;

    setVerificationSaving(true);
    setActionError(null);
    try {
      await setUserVerification(id, !detail.is_verified);
      const refreshedDetail = await getUserDetail(id);
      setDetail(refreshedDetail);
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
      <div className="min-h-screen bg-white p-6 lg:p-8">
        <div className="flex items-center gap-3 rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
          <Loader2 className="h-5 w-5 animate-spin text-[#415192]" />
          <p className="text-sm text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!detail || detailError) {
    return (
      <div className="min-h-screen bg-white p-6 lg:p-8">
        <Link to="/users" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#415192] hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </Link>
        <div className="rounded-[28px] border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700 shadow-sm">
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
  const profileCompletion = normalizePercentage(detail.profile_completion_percentage);
  const sectionCards = isWali
    ? [
        {
          key: "wali_profile",
          title: "Wali Profile",
          description: "Primary wali-specific profile information.",
          fields: waliProfileFields,
          draft: waliProfileDraft,
          original: waliProfileOriginal,
          target: "wali_profile" as const,
        },
        {
          key: "wali_sister",
          title: "Sister Info",
          description: "Core sister profile details.",
          fields: waliSisterFields,
          draft: waliSisterDraft,
          original: waliSisterOriginal,
          target: "sister_info" as const,
        },
        {
          key: "wali_preferences",
          title: "Her Preferences",
          description: "Matching preferences for the sister profile.",
          fields: waliPreferenceFields,
          draft: waliPreferenceDraft,
          original: waliPreferenceOriginal,
          target: "sister_info" as const,
        },
        {
          key: "wali_marriage",
          title: "Idea of Marriage",
          description: "Marriage and relationship expectations for the sister profile.",
          fields: waliMarriageFields,
          draft: waliMarriageDraft,
          original: waliMarriageOriginal,
          target: "sister_info" as const,
        },
      ]
    : [
        {
          key: "single_profile",
          title: "About You",
          description: `Core profile information for this ${basicRole || "user"}.`,
          fields: singleProfileFields,
          draft: singleProfileDraft,
          original: singleProfileOriginal,
          target: undefined,
        },
        {
          key: "single_preferences",
          title: "Preferences",
          description: "Preference details for matching.",
          fields: singlePreferenceFields,
          draft: singlePreferenceDraft,
          original: singlePreferenceOriginal,
          target: undefined,
        },
        {
          key: "single_marriage",
          title: "Idea of Marriage",
          description: "Marriage and relationship expectations.",
          fields: singleMarriageFields,
          draft: singleMarriageDraft,
          original: singleMarriageOriginal,
          target: undefined,
        },
      ];

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link to="/users" className="inline-flex items-center gap-2 text-sm font-medium text-[#415192] hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to users
        </Link>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.85fr)]">
          <div className="space-y-6">
            <section className="rounded-[20px] border border-slate-200 bg-slate-50 px-6 py-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border border-[#415192]/15 bg-[#415192]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#415192]">
                  User detail
                </div>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-900 lg:text-4xl">User Detail</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      Review the admin record and update the role-specific basic information.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
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

                {basicInfoError ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <p className="font-semibold">Basic info is unavailable</p>
                    <p className="mt-1">{basicInfoError}</p>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-[17px] font-semibold tracking-tight text-slate-900">User details</h2>
                  <p className="mt-1 text-sm text-slate-500">Core account data from the admin user endpoint.</p>
                </div>
              </div>

              <div className="px-6 py-6">
                <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                  {displayDetailRows.map((row) => (
                    <div key={row.label} className="space-y-1">
                      <p className="text-xs font-medium text-slate-500">{row.label}</p>
                      <p className="text-sm font-medium text-slate-900">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="space-y-6">
              {sectionCards.map((section) => (
                <SectionCard
                  key={section.key}
                  title={section.title}
                  description={section.description}
                  editing={editingSection === section.key}
                  saving={savingSection === section.key}
                  error={editingSection === section.key ? sectionError : null}
                  onEdit={() => startEditing(section.key)}
                  onCancel={() => cancelEditing(section.key)}
                  onSave={() => void saveSection(section.key)}
                  canEdit={!basicInfoError && !savingSection}
                  fields={section.fields}
                  draft={section.draft}
                  onFieldChange={(key, value) => updateDraft(section.key, key, value)}
                  readOnlyContent={renderReadOnlyGrid(section.fields, section.original)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
            <section className="rounded-[20px] border border-slate-200 bg-slate-50 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex flex-col items-center text-center">
                <div className="relative h-36 w-36 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#415192] to-[#6c78b7] shadow-[0_18px_40px_rgba(65,81,146,0.28)] ring-4 ring-white">
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
                  <p className="truncate text-xl font-semibold text-slate-900">
                    {`${detail.first_name} ${detail.last_name}`.trim() || detail.email}
                  </p>
                  <p className="mt-1 truncate text-sm text-slate-500">{detail.email}</p>
                  <p className="mt-3 text-sm text-slate-500">
                    {detail.city || detail.country ? [detail.city, detail.country].filter(Boolean).join(", ") : "Location not set"}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <ProfileCompletion value={profileCompletion} />
              </div>
            </section>

            <section className="rounded-[20px] border border-slate-200 bg-slate-50 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <h3 className="text-[17px] font-semibold tracking-tight text-slate-900">Actions</h3>
              <p className="mt-1 text-sm text-slate-500">Moderation and matching shortcuts for this profile.</p>

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
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
