import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  DisplayData,
  SubjectRecord,
  StandardRecord,
  AssessmentRecord,
  AssessmentSubjectRecord,
  FulfilmentStatusType,
} from "@/types/nocodb";
import { nocoDBAPI } from "@/app/api/nocodb";

// Extended type untuk item yang punya field tambahan
interface ExtendedAssessmentSubjectRecord extends AssessmentSubjectRecord {
  Parameter?: unknown;
  Fulfilment?: string;
}

export function useAssessmentSubjects() {
  const [data, setData] = useState<DisplayData[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<SubjectRecord[]>([]);
  const [standardOptions, setStandardOptions] = useState<StandardRecord[]>([]);
  const [assessmentOptions, setAssessmentOptions] = useState<
    AssessmentRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const renderValue = useCallback((value: unknown): string => {
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
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("=== Starting Data Fetch ===");

      // Fetch Parameters (for Subject dropdown)
      console.log("Fetching parameters (subjects)...");
      const parametersResult = await nocoDBAPI.fetchParameters(0, 100);
      console.log("Parameters API Response:", parametersResult);
      console.log("Parameters List Length:", parametersResult.list?.length);

      if (!parametersResult.list || parametersResult.list.length === 0) {
        console.warn("WARNING: Parameter list is empty!");
      } else {
        console.log("First Parameter:", parametersResult.list[0]);
      }

      setSubjectOptions(parametersResult.list as unknown as SubjectRecord[]);

      // Fetch Standards (for Target auto-fill)
      console.log("Fetching standards...");
      const standardsResult = await nocoDBAPI.fetchStandards(0, 100);
      console.log("Standards API Response:", standardsResult);
      console.log("Standards List Length:", standardsResult.list?.length);
      setStandardOptions(standardsResult.list || []);

      // Fetch Assessments
      console.log("Fetching assessments...");
      const assessmentsResult = await nocoDBAPI.fetchAssessments(0, 100);
      console.log("Assessments API Response:", assessmentsResult);
      console.log("Assessments List Length:", assessmentsResult.list?.length);
      setAssessmentOptions(assessmentsResult.list || []);

      // Fetch Assessment Parameters (main data)
      console.log("Fetching assessment parameters...");
      const assessmentResult = await nocoDBAPI.fetchAssessmentParameters(
        0,
        100
      );
      console.log("Assessment Parameters API Response:", assessmentResult);
      console.log(
        "Assessment Parameters List Length:",
        assessmentResult.list?.length
      );

      const mappedData: DisplayData[] = (assessmentResult.list || []).map(
        (item: AssessmentSubjectRecord) => {
          console.log("Processing item:", item);

          // Cast to extended type
          const itemWithParameter = item as ExtendedAssessmentSubjectRecord;

          const parameterValue = itemWithParameter.Parameter || item.Subject;
          let subjectTitle = "";
          let subjectId: number | undefined;

          if (parameterValue && typeof parameterValue === "object") {
            if (Array.isArray(parameterValue) && parameterValue.length > 0) {
              const firstParameter = parameterValue[0];
              if (
                typeof firstParameter === "object" &&
                firstParameter !== null
              ) {
                const parameterObj = firstParameter as Record<string, unknown>;
                // Use Title field from Parameter table
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
              (renderValue(
                itemWithParameter.Fulfilment
              ) as FulfilmentStatusType) || "",
            Assessment: "",
            AssessmentId: undefined,
            StandardName: "",
            StandardCode: "",
          };

          console.log("Mapped item:", mappedItem);
          return mappedItem;
        }
      );

      console.log("Final Mapped Data:", mappedData);
      setData(mappedData);
      console.log("=== Data Fetch Complete ===");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch data";
      setError(errorMessage);
      console.error("ERROR fetching data:", err);
      console.error("Error message:", errorMessage);
    } finally {
      setLoading(false);
    }
  }, [renderValue]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addNewRow = useCallback(() => {
    const newId =
      data.length > 0 ? Math.max(...data.map((d) => d.Id || 0)) + 1 : 1;
    const newRow: DisplayData = {
      Id: newId,
      Actual: "",
      Subject: "",
      Target: "",
      FulfilmentStatus: "",
      Assessment: "",
      AssessmentId: undefined,
      StandardName: "",
      StandardCode: "",
    };
    setData((prev) => [...prev, newRow]);
  }, [data]);

  const deleteRow = useCallback((rowId: number) => {
    setData((prev) => prev.filter((row) => row.Id !== rowId));
  }, []);

  const updateActual = useCallback((rowId: number, newValue: string) => {
    setData((prev) =>
      prev.map((row) => (row.Id === rowId ? { ...row, Actual: newValue } : row))
    );
  }, []);

  const updateTarget = useCallback((rowId: number, newValue: string) => {
    setData((prev) =>
      prev.map((row) => (row.Id === rowId ? { ...row, Target: newValue } : row))
    );
  }, []);

  const updateFulfilmentStatus = useCallback(
    (rowId: number, newValue: FulfilmentStatusType) => {
      setData((prev) =>
        prev.map((row) =>
          row.Id === rowId ? { ...row, FulfilmentStatus: newValue } : row
        )
      );
    },
    []
  );

  const updateAssessment = useCallback(
    (rowId: number, assessmentId: number) => {
      const selectedAssessment = assessmentOptions.find(
        (a) => a.Id === assessmentId
      );

      if (selectedAssessment) {
        setData((prev) =>
          prev.map((row) =>
            row.Id === rowId
              ? {
                  ...row,
                  Assessment: selectedAssessment.Title || "",
                  AssessmentId: selectedAssessment.Id,
                }
              : row
          )
        );
      }
    },
    [assessmentOptions]
  );

  const updateSubject = useCallback(
    (rowId: number, subjectId: number) => {
      const selectedSubject = subjectOptions.find((s) => s.Id === subjectId);

      if (selectedSubject) {
        console.log("=== UPDATE SUBJECT DEBUG ===");
        console.log("Selected Subject FULL:", selectedSubject);

        let targetValue = "";
        let standardName = "";
        let standardCode = "";
        let linkedStandardId: number | undefined;

        // Get StandardName from Parameter.Standard field
        const parameterStandard = selectedSubject.Standard;
        console.log("parameterStandard value:", parameterStandard);

        if (parameterStandard) {
          if (typeof parameterStandard === "string") {
            standardName = parameterStandard;
            console.log("StandardName from string:", standardName);
          } else if (typeof parameterStandard === "object") {
            console.log("parameterStandard is object");
            if (
              Array.isArray(parameterStandard) &&
              parameterStandard.length > 0
            ) {
              const firstItem = parameterStandard[0];
              console.log("First item in parameterStandard array:", firstItem);
              if (typeof firstItem === "object" && firstItem !== null) {
                const obj = firstItem as Record<string, unknown>;
                standardName =
                  (obj.Title as string) || (obj.Validate as string) || "";
                linkedStandardId = obj.Id as number;
                console.log("StandardName from array object:", standardName);
                console.log("Linked Standard ID:", linkedStandardId);
              }
            } else {
              console.log("parameterStandard is single object");
              const obj = parameterStandard as Record<string, unknown>;
              standardName =
                (obj.Title as string) || (obj.Validate as string) || "";
              linkedStandardId = obj.Id as number;
              console.log("StandardName from object:", standardName);
              console.log("Linked Standard ID:", linkedStandardId);
            }
          }
        }

        // Get StandardCode from standardOptions using linkedStandardId
        if (linkedStandardId) {
          const linkedStandard = standardOptions.find(
            (s) => s.Id === linkedStandardId
          );
          console.log("Found Standard in standardOptions:", linkedStandard);
          if (linkedStandard) {
            standardCode = linkedStandard.Standard || "";
            targetValue = linkedStandard.Validate || "";
            console.log("StandardCode from standardOptions:", standardCode);
            console.log("Target from standardOptions:", targetValue);
          }
        }

        // Fallback for standard_id if Standard field doesn't exist
        if (!linkedStandardId) {
          const standardIdValue = selectedSubject.standard_id;
          console.log("Trying standard_id field:", standardIdValue);

          if (standardIdValue && typeof standardIdValue === "object") {
            if (Array.isArray(standardIdValue) && standardIdValue.length > 0) {
              const firstStandard = standardIdValue[0];
              if (typeof firstStandard === "object" && firstStandard !== null) {
                const standardObj = firstStandard as Record<string, unknown>;
                linkedStandardId = standardObj.Id as number;
              }
            } else {
              const standardObj = standardIdValue as Record<string, unknown>;
              linkedStandardId = standardObj.Id as number;
            }
          } else if (typeof standardIdValue === "number") {
            linkedStandardId = standardIdValue;
          }

          // Lookup again with standard_id
          if (linkedStandardId) {
            const linkedStandard = standardOptions.find(
              (s) => s.Id === linkedStandardId
            );
            console.log("Found Standard via standard_id:", linkedStandard);
            if (linkedStandard) {
              standardCode = linkedStandard.Standard || "";
              targetValue = linkedStandard.Validate || "";
              console.log(
                "StandardCode from standard_id lookup:",
                standardCode
              );
              console.log("Target from standard_id lookup:", targetValue);
            }
          }
        }

        // Fallback: use Target field directly from Parameter
        if (!targetValue && selectedSubject.Target) {
          targetValue = selectedSubject.Target;
          console.log("Using fallback Target from Parameter:", targetValue);
        }

        console.log("=== FINAL VALUES ===");
        console.log(
          "Subject:",
          selectedSubject.Title || selectedSubject.Validate || ""
        );
        console.log("Target:", targetValue);
        console.log("StandardName:", standardName);
        console.log("StandardCode:", standardCode);
        console.log("======================");

        setData((prev) =>
          prev.map((row) =>
            row.Id === rowId
              ? {
                  ...row,
                  Subject:
                    selectedSubject.Title || selectedSubject.Validate || "",
                  SubjectId: selectedSubject.Id,
                  Target: targetValue,
                  StandardName: standardName,
                  StandardCode: standardCode,
                }
              : row
          )
        );
      }
    },
    [subjectOptions, standardOptions]
  );

  const actualValues = useMemo(() => {
    const values = new Set(
      data
        .map((row) => row.Actual)
        .filter((value): value is string => Boolean(value) && value !== "")
    );
    return Array.from(values);
  }, [data]);

  return {
    data,
    subjectOptions,
    standardOptions,
    assessmentOptions,
    loading,
    error,
    actualValues,
    fetchData,
    addNewRow,
    deleteRow,
    updateActual,
    updateTarget,
    updateFulfilmentStatus,
    updateAssessment,
    updateSubject,
  };
}
