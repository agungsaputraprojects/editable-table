import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  DisplayData,
  SubjectRecord,
  AssessmentRecord,
  AssessmentSubjectRecord,
  FulfilmentStatusType,
} from "@/types/nocodb";
import { nocoDBAPI } from "@/app/api/nocodb";

export function useAssessmentSubjects() {
  const [data, setData] = useState<DisplayData[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<SubjectRecord[]>([]);
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
            ((firstItem as Record<string, unknown>).Title as string) ||
            ((firstItem as Record<string, unknown>).title as string) ||
            ""
          );
        }
      }
      const obj = value as Record<string, unknown>;
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
      console.log("Fetching subjects...");
      const subjectsResult = await nocoDBAPI.fetchSubjects(0, 100);
      console.log("Subjects API Response:", subjectsResult);
      console.log("Subjects List Length:", subjectsResult.list?.length);

      if (!subjectsResult.list || subjectsResult.list.length === 0) {
        console.warn("WARNING: Subject list is empty!");
      } else {
        console.log("First Subject:", subjectsResult.list[0]);
      }

      setSubjectOptions(subjectsResult.list || []);

      console.log("Fetching assessments...");
      const assessmentsResult = await nocoDBAPI.fetchAssessments(0, 100);
      console.log("Assessments API Response:", assessmentsResult);
      console.log("Assessments List Length:", assessmentsResult.list?.length);
      setAssessmentOptions(assessmentsResult.list || []);

      console.log("Fetching assessment subjects...");
      const assessmentResult = await nocoDBAPI.fetchAssessmentSubjects(0, 100);
      console.log("Assessment Subjects API Response:", assessmentResult);
      console.log(
        "Assessment Subjects List Length:",
        assessmentResult.list?.length
      );

      const mappedData: DisplayData[] = (assessmentResult.list || []).map(
        (item: AssessmentSubjectRecord) => {
          console.log("Processing item:", item);

          const subjectValue = item.Subject;
          let subjectTitle = "";
          let subjectId: number | undefined;

          if (subjectValue && typeof subjectValue === "object") {
            if (Array.isArray(subjectValue) && subjectValue.length > 0) {
              const firstSubject = subjectValue[0];
              if (typeof firstSubject === "object" && firstSubject !== null) {
                const subjectObj = firstSubject as Record<string, unknown>;
                subjectTitle = (subjectObj.Title as string) || "";
                subjectId = subjectObj.Id as number;
              }
            } else {
              const subjectObj = subjectValue as Record<string, unknown>;
              subjectTitle = (subjectObj.Title as string) || "";
              subjectId = subjectObj.Id as number;
            }
          }

          const mappedItem: DisplayData = {
            Id: item.Id,
            Actual: renderValue(item.Actual),
            Subject: subjectTitle,
            SubjectId: subjectId,
            Target: renderValue(item.Target),
            FulfilmentStatus: "",
            Assessment: "",
            AssessmentId: undefined,
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
    };
    setData((prev) => [...prev, newRow]);
  }, [data.length]);

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
        console.log("Selected Subject:", selectedSubject);
        setData((prev) =>
          prev.map((row) =>
            row.Id === rowId
              ? {
                  ...row,
                  Subject: selectedSubject.Title || "",
                  SubjectId: selectedSubject.Id,
                  Target: selectedSubject.Target || "",
                }
              : row
          )
        );
      }
    },
    [subjectOptions]
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
