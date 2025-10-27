import type {
  AssessmentSubjectRecord,
  ParameterRecord,
  StandardRecord,
  DomainRecord,
  IndustryRecord,
  SubjectRecord,
  AssessmentRecord,
  NocoDBResponse,
  APIConfig,
} from "@/types/nocodb";

export const API_CONFIG: APIConfig = {
  baseUrl: "https://t3e.c7l.net/api/v2/tables",
  assessmentParameterTableId: "mvwp0clyib58fmu",
  assessmentParameterViewId: "vw21j4wedht899a7",
  parameterTableId: "mzl1rklg5ppirmq",
  parameterViewId: "vwzfojrs16f0bkbb",
  standardTableId: "mqu8i2zyrwwkxjt",
  standardViewId: "vw1e3b4g2y4i6svq",
  domainTableId: "mm6tm9l8rmv6pt5",
  domainViewId: "vwapfxsgk315pzg1",
  industryTableId: "mfz2qh80ihmuknq",
  industryViewId: "vwcjon39m3xc9n5c",
  assessmentTableId: "m0t64x4b3a75f2h",
  assessmentViewId: "vw0vhw9zed5wwj6x",
  userTableId: "m3vg1nw53wrwb56",
  userViewId: "vwecjuhu6e0cfbri",
  token: "4wIlrUcrEuQSx4tfDhBzvUst7gp_iSbUDDaavz3m",
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
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Response data:`, data);
    return data;
  }

  async fetchAssessmentParameters(
    offset: number = 0,
    limit: number = 100
  ): Promise<NocoDBResponse<AssessmentSubjectRecord>> {
    return this.fetchFromNocoDB<AssessmentSubjectRecord>(
      this.config.assessmentParameterTableId,
      this.config.assessmentParameterViewId,
      offset,
      limit
    );
  }

  async fetchAssessmentSubjects(
    offset: number = 0,
    limit: number = 100
  ): Promise<NocoDBResponse<AssessmentSubjectRecord>> {
    return this.fetchAssessmentParameters(offset, limit);
  }

  async fetchParameters(
    offset: number = 0,
    limit: number = 100
  ): Promise<NocoDBResponse<ParameterRecord>> {
    return this.fetchFromNocoDB<ParameterRecord>(
      this.config.parameterTableId,
      this.config.parameterViewId,
      offset,
      limit
    );
  }

  async fetchSubjects(
    offset: number = 0,
    limit: number = 100
  ): Promise<NocoDBResponse<SubjectRecord>> {
    return this.fetchParameters(offset, limit) as Promise<
      NocoDBResponse<SubjectRecord>
    >;
  }

  async fetchStandards(
    offset: number = 0,
    limit: number = 100
  ): Promise<NocoDBResponse<StandardRecord>> {
    return this.fetchFromNocoDB<StandardRecord>(
      this.config.standardTableId,
      this.config.standardViewId,
      offset,
      limit
    );
  }

  async fetchDomains(
    offset: number = 0,
    limit: number = 100
  ): Promise<NocoDBResponse<DomainRecord>> {
    return this.fetchFromNocoDB<DomainRecord>(
      this.config.domainTableId,
      this.config.domainViewId,
      offset,
      limit
    );
  }

  async fetchIndustries(
    offset: number = 0,
    limit: number = 100
  ): Promise<NocoDBResponse<IndustryRecord>> {
    return this.fetchFromNocoDB<IndustryRecord>(
      this.config.industryTableId,
      this.config.industryViewId,
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

export const fetchParameters = (offset?: number, limit?: number) =>
  nocoDBAPI.fetchParameters(offset, limit);

export const fetchSubjects = (offset?: number, limit?: number) =>
  nocoDBAPI.fetchSubjects(offset, limit);

export const fetchStandards = (offset?: number, limit?: number) =>
  nocoDBAPI.fetchStandards(offset, limit);

export const fetchDomains = (offset?: number, limit?: number) =>
  nocoDBAPI.fetchDomains(offset, limit);

export const fetchIndustries = (offset?: number, limit?: number) =>
  nocoDBAPI.fetchIndustries(offset, limit);

export const fetchAssessments = (offset?: number, limit?: number) =>
  nocoDBAPI.fetchAssessments(offset, limit);
