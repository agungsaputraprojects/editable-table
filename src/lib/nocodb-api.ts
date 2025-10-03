// lib/nocodb-api.ts

// Konfigurasi API NocoDB
export const API_CONFIG = {
  baseUrl: "https://t3e.c7l.net/api/v2/tables",
  assessmentSubjectTableId: "mvwp0clyib58fmu",
  assessmentSubjectViewId: "vw21j4wedht899a7",
  subjectTableId: "mzl1rklg5ppirmq",
  subjectViewId: "vwzfojrs16f0bkbb",
  token: process.env.NEXT_PUBLIC_NOCODB_TOKEN || "GANTI_DENGAN_TOKEN_ANDA",
};

// Types untuk Assessment Subject
export interface AssessmentSubjectRecord {
  Id?: number;
  Actual?: string;
  Subject?: unknown; // Ganti any jadi unknown
  Target?: string;
  [key: string]: unknown; // Ganti any jadi unknown
}

// Types untuk Subject (untuk dropdown)
export interface SubjectRecord {
  Id?: number;
  Title?: string;
  Target?: string;
  [key: string]: unknown; // Ganti any jadi unknown
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

// Fetch Assessment Subject records
export async function fetchAssessmentSubjects(
  offset: number = 0,
  limit: number = 100
): Promise<NocoDBResponse<AssessmentSubjectRecord>> {
  const url = `${API_CONFIG.baseUrl}/${API_CONFIG.assessmentSubjectTableId}/records?offset=${offset}&limit=${limit}&viewId=${API_CONFIG.assessmentSubjectViewId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "xc-token": API_CONFIG.token,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Fetch Subject records (untuk dropdown)
export async function fetchSubjects(
  offset: number = 0,
  limit: number = 100
): Promise<NocoDBResponse<SubjectRecord>> {
  const url = `${API_CONFIG.baseUrl}/${API_CONFIG.subjectTableId}/records?offset=${offset}&limit=${limit}&viewId=${API_CONFIG.subjectViewId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "xc-token": API_CONFIG.token,
    },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
