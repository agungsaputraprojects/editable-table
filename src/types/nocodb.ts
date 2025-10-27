export interface AssessmentSubjectRecord {
  Id?: number;
  Actual?: string;
  Subject?: unknown;
  Target?: string;
  [key: string]: unknown;
}

export interface ParameterRecord {
  Id?: number;
  standard_id?: number | StandardRecord | StandardRecord[];
  Validate?: string;
  Title?: string;
  Standard?: string | StandardRecord | StandardRecord[];
  [key: string]: unknown;
}

export interface StandardRecord {
  Id?: number;
  Validate?: string;
  Standard?: string;
  [key: string]: unknown;
}

export interface DomainRecord {
  Id?: number;
  Salary?: string;
  [key: string]: unknown;
}

export interface IndustryRecord {
  Id?: number;
  Title?: string;
  [key: string]: unknown;
}

export interface SubjectRecord {
  Id?: number;
  Title?: string;
  Validate?: string;
  Target?: string;
  standard_id?: number | StandardRecord | StandardRecord[];
  Standard?: string | StandardRecord | StandardRecord[];
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
  StandardName?: string;
  StandardCode?: string;
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
  assessmentParameterTableId: string;
  assessmentParameterViewId: string;
  parameterTableId: string;
  parameterViewId: string;
  standardTableId: string;
  standardViewId: string;
  domainTableId: string;
  domainViewId: string;
  industryTableId: string;
  industryViewId: string;
  assessmentTableId: string;
  assessmentViewId: string;
  userTableId: string;
  userViewId: string;
  token: string;
}

export type StatusFilter = "All" | string;
export type FulfilmentStatusType =
  | "Fully Met"
  | "Partially Met"
  | "Not Met"
  | "";
