import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type {
  DisplayData,
  SubjectRecord,
  StandardRecord,
  AssessmentRecord,
  FulfilmentStatusType,
} from "@/types/nocodb";
import { nocoDBAPI } from "@/app/api/nocodb";

interface AssessmentState {
  data: DisplayData[];
  subjectOptions: SubjectRecord[];
  standardOptions: StandardRecord[];
  assessmentOptions: AssessmentRecord[];
  loading: boolean;
  error: string | null;
  isAddDialogOpen: boolean;
}

const initialState: AssessmentState = {
  data: [],
  subjectOptions: [],
  standardOptions: [],
  assessmentOptions: [],
  loading: false,
  error: null,
  isAddDialogOpen: false,
};

// Helper function to render values
const renderValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    if (Array.isArray(value) && value.length > 0) {
      const firstItem = value[0];
      if (typeof firstItem === "object" && firstItem !== null) {
        return (
          ((firstItem as Record<string, unknown>).Validate as string) ||
          ((firstItem as Record<string, unknown>).Title as string) ||
          ((firstItem as Record<string, unknown>).title as string) ||
          ""
        );
      }
    }
    const obj = value as Record<string, unknown>;
    if (obj.Validate) return obj.Validate as string;
    if (obj.Title) return obj.Title as string;
    if (obj.title) return obj.title as string;
  }
  return String(value);
};

// Async Thunks
export const fetchAllData = createAsyncThunk(
  "assessment/fetchAllData",
  async () => {
    console.log("=== Starting Data Fetch ===");

    // Fetch all data in parallel
    const [
      parametersResult,
      standardsResult,
      assessmentsResult,
      assessmentResult,
    ] = await Promise.all([
      nocoDBAPI.fetchParameters(0, 100),
      nocoDBAPI.fetchStandards(0, 100),
      nocoDBAPI.fetchAssessments(0, 100),
      nocoDBAPI.fetchAssessmentParameters(0, 100),
    ]);

    console.log("Parameters:", parametersResult);
    console.log("Standards:", standardsResult);
    console.log("Assessments:", assessmentsResult);
    console.log("Assessment Parameters:", assessmentResult);

    // Map assessment data
    const mappedData: DisplayData[] = (assessmentResult.list || []).map(
      (item: any) => {
        const parameterValue = item.Parameter || item.Subject;
        let subjectTitle = "";
        let subjectId: number | undefined;

        if (parameterValue && typeof parameterValue === "object") {
          if (Array.isArray(parameterValue) && parameterValue.length > 0) {
            const firstParameter = parameterValue[0];
            if (typeof firstParameter === "object" && firstParameter !== null) {
              const parameterObj = firstParameter as Record<string, unknown>;
              subjectTitle =
                (parameterObj.Title as string) ||
                (parameterObj.Validate as string) ||
                "";
              subjectId = parameterObj.Id as number;
            }
          } else {
            const parameterObj = parameterValue as Record<string, unknown>;
            subjectTitle =
              (parameterObj.Title as string) ||
              (parameterObj.Validate as string) ||
              "";
            subjectId = parameterObj.Id as number;
          }
        }

        const mappedItem: DisplayData = {
          Id: item.Id,
          Actual: renderValue(item.Actual),
          Subject: subjectTitle,
          SubjectId: subjectId,
          Target: renderValue(item.Target),
          FulfilmentStatus:
            (renderValue(item.Fulfilment) as FulfilmentStatusType) || "",
          Assessment: "",
          AssessmentId: undefined,
          StandardName: "",
          StandardCode: "",
        };

        return mappedItem;
      }
    );

    return {
      data: mappedData,
      subjectOptions: parametersResult.list as unknown as SubjectRecord[],
      standardOptions: standardsResult.list || [],
      assessmentOptions: assessmentsResult.list || [],
    };
  }
);

export const createAssessmentParameter = createAsyncThunk(
  "assessment/create",
  async (newData: {
    SubjectId?: number;
    Actual?: string;
    Target?: string;
    FulfilmentStatus?: string;
    AssessmentId?: number;
  }) => {
    console.log("Creating new assessment parameter:", newData);

    const response = await nocoDBAPI.createAssessmentParameter(newData);
    console.log("Create response:", response);

    return response;
  }
);

const assessmentSlice = createSlice({
  name: "assessment",
  initialState,
  reducers: {
    setAddDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isAddDialogOpen = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Data
      .addCase(fetchAllData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.subjectOptions = action.payload.subjectOptions;
        state.standardOptions = action.payload.standardOptions;
        state.assessmentOptions = action.payload.assessmentOptions;
      })
      .addCase(fetchAllData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch data";
      })
      // Create Assessment Parameter
      .addCase(createAssessmentParameter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssessmentParameter.fulfilled, (state) => {
        state.loading = false;
        state.isAddDialogOpen = false;
      })
      .addCase(createAssessmentParameter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create record";
      });
  },
});

export const { setAddDialogOpen, clearError } = assessmentSlice.actions;
export default assessmentSlice.reducer;
