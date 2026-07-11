import { apiRequest } from "./client";

export type AdminRoleValue = "superadmin" | "matchmaker";

export interface AdminProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: AdminRoleValue;
  profile_picture: string | null;
  member_since: string;
  created_at: string;
  updated_at: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface MatchmakerAccount {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: AdminRoleValue;
  profile_picture: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AdminMatchmakerListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MatchmakerAccount[];
}

export interface MatchmakerAccountDetail extends MatchmakerAccount {}

export type AdminUserRoleValue = "male" | "female" | "wali";

export interface AdminUserAccount {
  id: string;
  codename: string | null;
  first_name: string;
  last_name: string;
  email: string;
  role: AdminUserRoleValue | string;
  gender: string | null;
  subscription_plan: string | null;
  is_verified: boolean;
  date_of_birth: string | null;
  age: number | string | null;
  sect: string | null;
  city: string | null;
  country: string | null;
  profile_picture: string | null;
  profile_completion_percentage: number | string | null;
  is_active: boolean;
  deactivated_by_user?: boolean;
  is_private_matchmaking_client?: boolean;
  last_active: string | null;
  last_active_display: string | null;
  created_at: string;
}

export interface AdminUserDetail extends AdminUserAccount {
  deactivated_by_user?: boolean;
  is_private_matchmaking_client?: boolean;
  last_active?: string | null;
  last_active_display?: string | null;
}

export interface AdminUserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUserAccount[];
}

export type UserBasicInfoTarget = "wali_profile" | "sister_info";

export interface UserBasicInfoBase {
  id?: string;
  how_found?: string | string[] | null;
  phone?: string | null;
  date_of_birth?: string | null;
  city?: string | null;
  country?: string | null;
  sect?: string | null;
  marital_status?: string | null;
  ethnicity?: string | string[] | null;
  nationality?: string | string[] | null;
  has_children?: boolean | null;
  children_count?: number | string | null;
  height?: string | null;
  weight?: string | null;
  pray_5x?: string | null;
  open_to_relocate?: string | null;
  dress?: string | null;
  preferred_dress?: string | null;
  wali_name?: string | null;
  wali_relation?: string | null;
  wali_number?: string | null;
  employment?: string | null;
  education?: string | null;
  income?: string | null;
  frame?: string | null;
  languages_spoken?: string | string[] | null;
  pref_age_min?: number | string | null;
  pref_age_max?: number | string | null;
  pref_marital_status?: string | string[] | null;
  pref_ethnicity?: string | string[] | null;
  pref_country_of_residence?: string | string[] | null;
  relationship_with_islam?: string | null;
  role_as_spouse?: string | null;
  about_yourself?: string | null;
  about?: string | null;
  envision_spouse?: string | null;
  envision_marriage?: string | null;
  spouse_religious_status_pref?: string | null;
  open_to_relocate_details?: string | null;
  health_concerns?: string | null;
  other_preferences?: string | null;
  completion_percentage?: number | string | null;
  age?: number | string | null;
  photos?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface WaliProfileBasicInfo {
  id?: string;
  how_found?: string | string[] | null;
  gender?: string | null;
  relation_to_sister?: string | null;
  phone?: string | null;
  completion_percentage?: number | string | null;
  created_at?: string;
  updated_at?: string;
}

export interface WaliSisterBasicInfo extends UserBasicInfoBase {
  sister_first_name?: string | null;
  sister_last_name?: string | null;
}

export interface WaliBasicInfoResponse {
  wali_profile: WaliProfileBasicInfo;
  sister_info: WaliSisterBasicInfo;
}

export type UserBasicInfoResponse = UserBasicInfoBase | WaliBasicInfoResponse;

export interface AdminUserListParams {
  about_yourself?: string;
  age?: number | string;
  children_count?: string;
  city?: string;
  country?: string;
  date_of_birth?: string;
  education?: string;
  employment?: string;
  envision_marriage?: string;
  envision_spouse?: string;
  ethnicity?: string;
  frame?: string;
  gender?: string;
  has_children?: boolean;
  health_concerns?: string;
  height?: string;
  how_found?: string;
  income?: string;
  is_active?: boolean;
  is_verified?: boolean;
  languages_spoken?: string;
  marital_status?: string;
  nationality?: string;
  open_to_relocate?: string;
  open_to_relocate_details?: string;
  ordering?: string;
  other_preferences?: string;
  page?: number;
  page_size?: number;
  pray_5x?: string;
  pref_age_max?: number | string;
  pref_age_min?: number | string;
  pref_country_of_residence?: string;
  pref_ethnicity?: string;
  pref_marital_status?: string;
  relationship_with_islam?: string;
  role?: string;
  role_as_spouse?: string;
  search?: string;
  sect?: string;
  spouse_religious_status_pref?: string;
  subscription_plan?: string;
  wali_profile_gender?: string;
  wali_profile_how_found?: string;
  wali_profile_phone?: string;
  wali_profile_relation_to_sister?: string;
  weight?: string;
}

export function getAdminProfile() {
  return apiRequest<AdminProfile>("user/admin/profile/", {
    method: "GET",
    auth: true,
  });
}

export function updateAdminProfile(payload: {
  first_name?: string;
  last_name?: string;
  profile_picture?: File | null;
}) {
  const formData = new FormData();

  if (payload.first_name !== undefined) formData.set("first_name", payload.first_name);
  if (payload.last_name !== undefined) formData.set("last_name", payload.last_name);
  if (payload.profile_picture instanceof File) {
    formData.set("profile_picture", payload.profile_picture);
  }

  return apiRequest<AdminProfile>("user/admin/profile/", {
    method: "PATCH",
    auth: true,
    body: formData,
  });
}

export function changePassword(payload: ChangePasswordRequest) {
  return apiRequest<ChangePasswordResponse>("user/password/change/", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export function listMatchmakers(params: {
  ordering?: string;
  page?: number;
  page_size?: number;
  role?: AdminRoleValue;
  is_active?: boolean;
  search?: string;
} = {}) {
  const searchParams = new URLSearchParams();

  if (params.ordering) searchParams.set("ordering", params.ordering);
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.page_size !== undefined) searchParams.set("page_size", String(params.page_size));
  if (params.role) searchParams.set("role", params.role);
  if (params.is_active !== undefined) searchParams.set("is_active", String(params.is_active));
  if (params.search) searchParams.set("search", params.search);

  const query = searchParams.toString();

  return apiRequest<AdminMatchmakerListResponse>(`user/admin/matchmakers/${query ? `?${query}` : ""}`, {
    method: "GET",
    auth: true,
  });
}

export function createMatchmaker(payload: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  profile_picture?: File | null;
}) {
  const formData = new FormData();

  formData.set("first_name", payload.first_name);
  formData.set("last_name", payload.last_name);
  formData.set("email", payload.email);
  formData.set("password", payload.password);

  if (payload.profile_picture instanceof File) {
    formData.set("profile_picture", payload.profile_picture);
  }

  return apiRequest<MatchmakerAccount>("user/admin/matchmakers/create-matchmaker/", {
    method: "POST",
    auth: true,
    body: formData,
  });
}

export function getMatchmaker(id: string) {
  return apiRequest<MatchmakerAccountDetail>(`user/admin/matchmakers/${id}/`, {
    method: "GET",
    auth: true,
  });
}

export function updateMatchmakerInfo(
  id: string,
  payload: { first_name?: string; last_name?: string; profile_picture?: File | null },
) {
  const formData = new FormData();

  if (payload.first_name !== undefined) formData.set("first_name", payload.first_name);
  if (payload.last_name !== undefined) formData.set("last_name", payload.last_name);
  if (payload.profile_picture instanceof File) {
    formData.set("profile_picture", payload.profile_picture);
  }

  return apiRequest<MatchmakerAccountDetail>(`user/admin/matchmakers/${id}/update-info/`, {
    method: "PATCH",
    auth: true,
    body: formData,
  });
}

export function changeMatchmakerRole(id: string, role: AdminRoleValue) {
  return apiRequest<MatchmakerAccountDetail>(`user/admin/matchmakers/${id}/change-role/`, {
    method: "PATCH",
    auth: true,
    body: { role },
  });
}

export function setMatchmakerActive(id: string, is_active: boolean) {
  const formData = new FormData();
  formData.set("is_active", String(is_active));

  return apiRequest<{ message: string }>(`user/admin/matchmakers/${id}/set-active/`, {
    method: "PATCH",
    auth: true,
    body: formData,
  });
}

export function deleteMatchmaker(id: string) {
  return apiRequest<void>(`user/admin/matchmakers/${id}/delete/`, {
    method: "DELETE",
    auth: true,
  });
}

export function listUsers(params: AdminUserListParams = {}) {
  const searchParams = new URLSearchParams();

  const append = (key: string, value: string | number | boolean | null | undefined) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  };

  append("about_yourself", params.about_yourself);
  append("age", params.age);
  append("children_count", params.children_count);
  append("city", params.city);
  append("country", params.country);
  append("date_of_birth", params.date_of_birth);
  append("education", params.education);
  append("employment", params.employment);
  append("envision_marriage", params.envision_marriage);
  append("envision_spouse", params.envision_spouse);
  append("ethnicity", params.ethnicity);
  append("frame", params.frame);
  append("gender", params.gender);
  append("has_children", params.has_children);
  append("health_concerns", params.health_concerns);
  append("height", params.height);
  append("how_found", params.how_found);
  append("income", params.income);
  append("is_active", params.is_active);
  append("is_verified", params.is_verified);
  append("languages_spoken", params.languages_spoken);
  append("marital_status", params.marital_status);
  append("nationality", params.nationality);
  append("open_to_relocate", params.open_to_relocate);
  append("open_to_relocate_details", params.open_to_relocate_details);
  append("ordering", params.ordering);
  append("other_preferences", params.other_preferences);
  append("page", params.page);
  append("page_size", params.page_size);
  append("pray_5x", params.pray_5x);
  append("pref_age_max", params.pref_age_max);
  append("pref_age_min", params.pref_age_min);
  append("pref_country_of_residence", params.pref_country_of_residence);
  append("pref_ethnicity", params.pref_ethnicity);
  append("pref_marital_status", params.pref_marital_status);
  append("relationship_with_islam", params.relationship_with_islam);
  append("role", params.role);
  append("role_as_spouse", params.role_as_spouse);
  append("search", params.search);
  append("sect", params.sect);
  append("spouse_religious_status_pref", params.spouse_religious_status_pref);
  append("subscription_plan", params.subscription_plan);
  append("wali_profile_gender", params.wali_profile_gender);
  append("wali_profile_how_found", params.wali_profile_how_found);
  append("wali_profile_phone", params.wali_profile_phone);
  append("wali_profile_relation_to_sister", params.wali_profile_relation_to_sister);
  append("weight", params.weight);

  const query = searchParams.toString();

  return apiRequest<AdminUserListResponse>(`user/admin/users/${query ? `?${query}` : ""}`, {
    method: "GET",
    auth: true,
  });
}

export function blockUser(id: string, is_active: boolean) {
  return apiRequest<{ message: string }>(`user/admin/users/${id}/block/`, {
    method: "PATCH",
    auth: true,
    body: { is_active },
  });
}

export function setUserVerification(id: string, is_verified: boolean) {
  return apiRequest<{ message: string }>(`user/admin/users/${id}/verification/`, {
    method: "PATCH",
    auth: true,
    body: { is_verified },
  });
}

export function deleteUser(id: string) {
  return apiRequest<void>(`user/admin/users/${id}/delete/`, {
    method: "DELETE",
    auth: true,
  });
}

export function getUserDetail(id: string) {
  return apiRequest<AdminUserDetail>(`user/admin/users/${id}/`, {
    method: "GET",
    auth: true,
  });
}

export function getUserBasicInfo(userId: string) {
  return apiRequest<UserBasicInfoResponse>(`questions/admin/users/${userId}/`, {
    method: "GET",
    auth: true,
  });
}

export function updateUserBasicInfo(
  userId: string,
  payload: Record<string, unknown>,
  target?: UserBasicInfoTarget,
) {
  const query = target ? `?target=${encodeURIComponent(target)}` : "";

  return apiRequest<UserBasicInfoResponse>(`questions/admin/users/${userId}/${query}`, {
    method: "PATCH",
    auth: true,
    body: payload,
  });
}
