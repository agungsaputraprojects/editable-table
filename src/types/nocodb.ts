export interface AssessmentSubjectRecord {
  Id?: number;
  Actual?: string;
  Subject?: unknown;
  Target?: string;
  [key: string]: unknown;
}

export interface SubjectRecord {
  Id?: number;
  Title?: string;
  Target?: string;
  [key: string]: unknown;
}

export interface AssessmentRecord {
  Id?: number;
  Title?: string;
  [key: string]: unknown;
}

export interface DisplayData {
  Id?: number;
  Actual?: string;
  Subject?: string;
  SubjectId?: number;
  Target?: string;
  FulfilmentStatus?: "Fully Met" | "Partially Met" | "Not Met" | "";
  Assessment?: string;
  AssessmentId?: number;
}

export interface PageInfo {
  totalRows: number;
  page: number;
  pageSize: number;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export interface NocoDBResponse<T> {
  list: T[];
  pageInfo: PageInfo;
}

export interface APIConfig {
  baseUrl: string;
  assessmentSubjectTableId: string;
  assessmentSubjectViewId: string;
  subjectTableId: string;
  subjectViewId: string;
  assessmentTableId: string;
  assessmentViewId: string;
  token: string;
}

export type StatusFilter = "All" | string;
export type FulfilmentStatusType =
  | "Fully Met"
  | "Partially Met"
  | "Not Met"
  | "";
