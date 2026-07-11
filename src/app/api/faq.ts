import { apiRequest } from "./client";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FaqItem[];
}

export interface CreateFaqRequest {
  question: string;
  answer: string;
}

export function listFaqs(params: {
  ordering?: string;
  page?: number;
  page_size?: number;
  search?: string;
} = {}) {
  const searchParams = new URLSearchParams();

  if (params.ordering) searchParams.set("ordering", params.ordering);
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.page_size !== undefined) searchParams.set("page_size", String(params.page_size));
  if (params.search) searchParams.set("search", params.search);

  const query = searchParams.toString();

  return apiRequest<FaqListResponse>(`supports/faq/manage/${query ? `?${query}` : ""}`, {
    method: "GET",
    auth: true,
  });
}

export function createFaq(payload: CreateFaqRequest) {
  return apiRequest<FaqItem>("supports/faq/manage/", {
    method: "POST",
    auth: true,
    body: payload,
  });
}

export function deleteFaq(id: string) {
  return apiRequest<void>(`supports/faq/manage/${id}/`, {
    method: "DELETE",
    auth: true,
  });
}
