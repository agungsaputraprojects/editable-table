import type {
  AssessmentSubjectRecord,
  SubjectRecord,
  AssessmentRecord,
  NocoDBResponse,
  APIConfig,
} from "@/types/nocodb";

export const API_CONFIG: APIConfig = {
  baseUrl: "https://t3e.c7l.net/api/v2/tables",
  assessmentSubjectTableId: "mvwp0clyib58fmu",
  assessmentSubjectViewId: "vw21j4wedht899a7",
  subjectTableId: "mzl1rklg5ppirmq",
  subjectViewId: "vwzfojrs16f0bkbb",
  assessmentTableId: "m0t64x4b3a75f2h",
  assessmentViewId: "vw0vhw9zed5wwj6x",
  token:
    process.env.NEXT_PUBLIC_NOCODB_TOKEN ||
    "4wIlrUcrEuQSx4tfDhBzvUst7gp_iSbUDDaavz3m",
};

export class NocoDBAPI {
  private config: APIConfig;

  constructor(config: APIConfig = API_CONFIG) {
    this.config = config;
  }

  private async fetchFromNocoDB<T>(
    tableId: string,
    viewId: string,
    offset: number = 0,
    limit: number = 100
  ): Promise<NocoDBResponse<T>> {
    const url = `${this.config.baseUrl}/${tableId}/records?offset=${offset}&limit=${limit}&viewId=${viewId}`;

    console.log(`Fetching from: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "xc-token": this.config.token,
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Response data:`, data);
    return data;
  }

  async fetchAssessmentSubjects(
    offset: number = 0,
    limit: number = 100
  ): Promise<NocoDBResponse<AssessmentSubjectRecord>> {
    return this.fetchFromNocoDB<AssessmentSubjectRecord>(
      this.config.assessmentSubjectTableId,
      this.config.assessmentSubjectViewId,
      offset,
      limit
    );
  }

  async fetchSubjects(
    offset: number = 0,
    limit: number = 100
  ): Promise<NocoDBResponse<SubjectRecord>> {
    return this.fetchFromNocoDB<SubjectRecord>(
      this.config.subjectTableId,
      this.config.subjectViewId,
      offset,
      limit
    );
  }

  async fetchAssessments(
    offset: number = 0,
    limit: number = 100
  ): Promise<NocoDBResponse<AssessmentRecord>> {
    return this.fetchFromNocoDB<AssessmentRecord>(
      this.config.assessmentTableId,
      this.config.assessmentViewId,
      offset,
      limit
    );
  }
}

export const nocoDBAPI = new NocoDBAPI();

export const fetchAssessmentSubjects = (offset?: number, limit?: number) =>
  nocoDBAPI.fetchAssessmentSubjects(offset, limit);

export const fetchSubjects = (offset?: number, limit?: number) =>
  nocoDBAPI.fetchSubjects(offset, limit);

export const fetchAssessments = (offset?: number, limit?: number) =>
  nocoDBAPI.fetchAssessments(offset, limit);
