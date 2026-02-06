import { create } from "zustand";
import { InspectionAssignmentData, inspectionApi } from "@/lib/api";

interface InspectionState {
  inspections: InspectionAssignmentData[];
  isLoading: boolean;
  error: string | null;
  page: number;
  hasNext: boolean;
  lastFetched: number | null;

  // Actions
  setInspections: (inspections: InspectionAssignmentData[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (page: number, hasNext: boolean) => void;
  getInspectionById: (id: string) => InspectionAssignmentData | undefined;
  fetchInspections: (page?: number, limit?: number) => Promise<void>;
  clearCache: () => void;
}

export const useInspectionStore = create<InspectionState>()((set, get) => ({
  inspections: [],
  isLoading: false,
  error: null,
  page: 1,
  hasNext: false,
  lastFetched: null,

  setInspections: (inspections) =>
    set({ inspections, lastFetched: Date.now() }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setPagination: (page, hasNext) => set({ page, hasNext }),

  getInspectionById: (id) => {
    const { inspections } = get();
    return inspections.find((i) => i.assignment_id === id);
  },

  fetchInspections: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await inspectionApi.getAll(page, limit);
      if (response.success) {
        set({
          inspections: response.data.items,
          page: response.data.page,
          hasNext: response.data.has_next,
          lastFetched: Date.now(),
          isLoading: false,
        });
      } else {
        set({
          error: response.message || "Failed to fetch inspections",
          isLoading: false,
        });
      }
    } catch (err) {
      console.error("Error fetching inspections:", err);
      set({
        error: "Failed to fetch inspections. Please try again.",
        isLoading: false,
      });
    }
  },

  clearCache: () =>
    set({
      inspections: [],
      lastFetched: null,
      page: 1,
      hasNext: false,
    }),
}));
