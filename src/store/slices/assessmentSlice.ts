import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type {
  DisplayData,
  SubjectRecord,
  StandardRecord,
  AssessmentRecord,
  AssessmentSubjectRecord,
  FulfilmentStatusType,
} from "@/types/nocodb";
import { nocoDBAPI } from "@/app/api/nocodb";

interface ExtendedAssessmentSubjectRecord extends AssessmentSubjectRecord {
  Parameter?: unknown;
  Fulfilment?: string;
}

interface AssessmentState {
  data: DisplayData[];
  subjectOptions: SubjectRecord[];
  standardOptions: StandardRecord[];
  assessmentOptions: AssessmentRecord[];
  loading: boolean;
  error: string | null;
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  selectedItem: DisplayData | null;
}

const initialState: AssessmentState = {
  data: [],
  subjectOptions: [],
  standardOptions: [],
  assessmentOptions: [],
  loading: false,
  error: null,
  isAddDialogOpen: false,
  isEditDialogOpen: false,
  isDeleteDialogOpen: false,
  selectedItem: null,
};

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

export const fetchAllData = createAsyncThunk(
  "assessment/fetchAllData",
  async () => {
    console.log("=== Starting Data Fetch ===");

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

    const mappedData: DisplayData[] = (assessmentResult.list || []).map(
      (item: ExtendedAssessmentSubjectRecord) => {
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

export const updateAssessmentParameter = createAsyncThunk(
  "assessment/update",
  async (updateData: {
    id: number;
    SubjectId?: number;
    Actual?: string;
    Target?: string;
    FulfilmentStatus?: string;
    AssessmentId?: number;
  }) => {
    console.log("Updating assessment parameter:", updateData);
    const { id, ...data } = updateData;
    const response = await nocoDBAPI.updateAssessmentParameter(id, data);
    console.log("Update response:", response);
    return response;
  }
);

export const deleteAssessmentParameter = createAsyncThunk(
  "assessment/delete",
  async (id: number) => {
    console.log("Deleting assessment parameter:", id);
    const response = await nocoDBAPI.deleteAssessmentParameter(id);
    console.log("Delete response:", response);
    return { id };
  }
);

const assessmentSlice = createSlice({
  name: "assessment",
  initialState,
  reducers: {
    setAddDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isAddDialogOpen = action.payload;
    },
    setEditDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isEditDialogOpen = action.payload;
    },
    setDeleteDialogOpen: (state, action: PayloadAction<boolean>) => {
      state.isDeleteDialogOpen = action.payload;
    },
    setSelectedItem: (state, action: PayloadAction<DisplayData | null>) => {
      state.selectedItem = action.payload;
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
      // Create
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
      })
      // Update
      .addCase(updateAssessmentParameter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssessmentParameter.fulfilled, (state) => {
        state.loading = false;
        state.isEditDialogOpen = false;
        state.selectedItem = null;
      })
      .addCase(updateAssessmentParameter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update record";
      })
      // Delete
      .addCase(deleteAssessmentParameter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssessmentParameter.fulfilled, (state) => {
        state.loading = false;
        state.isDeleteDialogOpen = false;
        state.selectedItem = null;
      })
      .addCase(deleteAssessmentParameter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to delete record";
      });
  },
});

export const {
  setAddDialogOpen,
  setEditDialogOpen,
  setDeleteDialogOpen,
  setSelectedItem,
  clearError,
} = assessmentSlice.actions;

export default assessmentSlice.reducer;
