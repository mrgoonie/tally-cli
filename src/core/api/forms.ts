import { TallyClient } from "../client.js";
import { Paginated } from "../types.js";

export interface Form {
  id: string;
  name?: string;
  status?: string;
  workspaceId?: string;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: unknown;
}

export interface FormBlock {
  uuid?: string;
  type: string;
  payload?: Record<string, unknown>;
  [k: string]: unknown;
}

export interface FormQuestion {
  id?: string;
  type?: string;
  title?: string;
  [k: string]: unknown;
}

export interface ListFormsParams {
  page?: number;
  limit?: number;
  workspaceIds?: string[];
}

export interface CreateFormInput {
  status?: string;
  blocks: FormBlock[];
  workspaceId?: string;
  [k: string]: unknown;
}

export interface UpdateFormInput {
  status?: string;
  blocks?: FormBlock[];
  name?: string;
  [k: string]: unknown;
}

export const list = (c: TallyClient, p: ListFormsParams = {}) =>
  c.request<Paginated<Form>>("/forms", {
    query: {
      page: p.page,
      limit: p.limit,
      workspaceIds: p.workspaceIds?.join(","),
    },
  });

export const get = (c: TallyClient, id: string) =>
  c.request<Form>(`/forms/${encodeURIComponent(id)}`);

export const create = (c: TallyClient, body: CreateFormInput) =>
  c.request<Form>("/forms", { method: "POST", body });

export const update = (c: TallyClient, id: string, body: UpdateFormInput) =>
  c.request<Form>(`/forms/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body,
  });

export const remove = (c: TallyClient, id: string) =>
  c.request<void>(`/forms/${encodeURIComponent(id)}`, { method: "DELETE" });

export const listQuestions = (c: TallyClient, id: string) =>
  c.request<FormQuestion[]>(`/forms/${encodeURIComponent(id)}/questions`);

export const updateQuestion = (
  c: TallyClient,
  id: string,
  questionId: string,
  body: Record<string, unknown>,
) =>
  c.request<FormQuestion>(
    `/forms/${encodeURIComponent(id)}/questions/${encodeURIComponent(questionId)}`,
    { method: "PATCH", body },
  );

export const listBlocks = (c: TallyClient, id: string) =>
  c.request<FormBlock[]>(`/forms/${encodeURIComponent(id)}/blocks`);

export const updateBlocks = (
  c: TallyClient,
  id: string,
  blocks: FormBlock[],
) =>
  c.request<FormBlock[]>(`/forms/${encodeURIComponent(id)}/blocks`, {
    method: "PATCH",
    body: { blocks },
  });
