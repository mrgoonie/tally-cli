import { TallyClient } from "../client.js";
import { Paginated } from "../types.js";

export interface Submission {
  id: string;
  formId?: string;
  submittedAt?: string;
  responses?: unknown[];
  [k: string]: unknown;
}

export interface ListSubmissionsParams {
  page?: number;
  limit?: number;
  filter?: string;
  startDate?: string;
  endDate?: string;
}

export const list = (
  c: TallyClient,
  formId: string,
  p: ListSubmissionsParams = {},
) =>
  c.request<Paginated<Submission>>(
    `/forms/${encodeURIComponent(formId)}/submissions`,
    { query: { ...p } },
  );

export const get = (c: TallyClient, formId: string, submissionId: string) =>
  c.request<Submission>(
    `/forms/${encodeURIComponent(formId)}/submissions/${encodeURIComponent(submissionId)}`,
  );

export const remove = (c: TallyClient, formId: string, submissionId: string) =>
  c.request<void>(
    `/forms/${encodeURIComponent(formId)}/submissions/${encodeURIComponent(submissionId)}`,
    { method: "DELETE" },
  );
