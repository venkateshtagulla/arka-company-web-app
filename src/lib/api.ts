import axios, { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
const lapi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
let isRedirecting = false;
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401 && !isRedirecting) {
      // Refresh token also expired OR session invalid
      isRedirecting = true;
      useAuthStore.getState().logout();

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

/*import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/authStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let queue: any[] = [];

const flushQueue = (err: any, token: string | null = null) => {
  queue.forEach(p => (err ? p.reject(err) : p.resolve(token)));
  queue = [];
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const req = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (status === 401 && !req._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          queue.push({ resolve, reject })
        ).then(token => {
          req.headers.Authorization = `Bearer ${token}`;
          return api(req);
        });
      }

      req._retry = true;
      isRefreshing = true;

      const { refreshToken, setAuth, logout, adminId, email } = useAuthStore.getState();

      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        setAuth({
          accessToken: data.AccessToken,
          refreshToken: refreshToken!,
          adminId: adminId!,
          email: email!,
        });

        flushQueue(null, data.AccessToken);
        req.headers.Authorization = `Bearer ${data.AccessToken}`;
        return api(req);
      } catch (e) {
        flushQueue(e);
        logout();
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 400) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;*/



export interface AdminData {
  admin_id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

export interface GetAdminProfileResponse {
  success: boolean;
  data: AdminData;
  message: string;
  error: string | null;
}

export const authApi = {
  login: async (email: string, password: string,newPassword?: string) => {
    const payload: any = { email, password };
    try{
    if (newPassword) {
      payload.new_password = newPassword;
    }
    const response = await lapi.post("/admins/login", payload);
    return response.data;
  }
  catch(err){
    console.log(err);
  }
  },
  register: async (
    email: string,
    password: string,
    first_name: string,
    last_name: string
  ) => {
    const response = await lapi.post("/admins/register", {
      email,
      password,
      first_name,
      last_name,
    });
    return response.data;
  },
  getProfile: async (): Promise<GetAdminProfileResponse> => {
    const response = await api.get("/admin/profile");
    return response.data;
  },
};

export interface CreateVesselPayload {
  name: string;
  vessel_type: string;
  imo_number: string;
  message:string;
}

export interface VesselForm {
  form_id: string;
  title: string;
  description: string;
  status: string;
  assigned_date: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export interface VesselDefect {
  defect_id: string;
  title: string;
  description: string;
  severity: string;
  priority: string;
  status: string;
  location_on_ship?: string;
  equipment_name?: string;
  form_id: string;
  due_date?: string;
  photos?: string[];
  created_at: string;
  updated_at: string;
}

export interface VesselInspection {
  assignment_id: string;
  inspection_name: string;
  form_id: string;
  form_title: string;
  assignee_type: string;
  assignee_name: string;
  role: string;
  priority: string;
  due_date: string;
  status: string;
  created_at: string;
}

export interface VesselData {
  vessel_id: string;
  name: string;
  vessel_type: string;
  other_vessel_type: string | null;
  imo_number: string;
  status: string;
  inspections?: VesselInspection[];
  defects?: VesselDefect[];
}

export interface CreateVesselResponse {
  success: boolean;
  data: VesselData;
  message: string;
  error: string | null;
}

export interface GetVesselsResponse {
  success: boolean;
  data: {
    items: VesselData[];
    page: number;
    limit: number;
    has_next: boolean;
  };
  message: string;
  error: string | null;
}

export interface GetVesselByIdResponse {
  success: boolean;
  data: VesselData;
  message: string;
  error: string | null;
}

export const vesselsApi = {
  create: async (
    payload: CreateVesselPayload
  ): Promise<CreateVesselResponse> => {
    const response = await api.post("/vessels", payload);
    return response.data;
  },

  getAll: async (
    page: number = 1,
    limit: number = 10
  ): Promise<GetVesselsResponse> => {
    const response = await api.get(`/vessels?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (vesselId: string): Promise<GetVesselByIdResponse> => {
    const response = await api.get(`/vessels/${vesselId}`);
    return response.data;
  },
};

// Vessel Assignment Interfaces
export interface VesselAssignment {
  assignment_id: string;
  vessel_id: string;
  user_id: string;
  user_type: "inspector" | "crew";
  user_name?: string | null;
  user_email?: string | null;
  created_by_admin_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateVesselAssignmentPayload {
  vessel_id: string;
  user_id: string;
  user_type: "inspector" | "crew";
}

export interface GetVesselAssignmentsResponse {
  success: boolean;
  data: {
    vessel_id: string;
    assignments: VesselAssignment[];
  };
  message: string;
  error: string | null;
}

export interface CreateVesselAssignmentResponse {
  success: boolean;
  data: VesselAssignment;
  message: string;
  error: string | null;
}

export interface DeleteVesselAssignmentResponse {
  success: boolean;
  data: {
    assignment_id: string;
    deleted: boolean;
  };
  message: string;
  error: string | null;
}

export const vesselAssignmentsApi = {
  create: async (
    payload: CreateVesselAssignmentPayload
  ): Promise<CreateVesselAssignmentResponse> => {
    const response = await api.post("/vessels/assignments", payload);
    return response.data;
  },

  getByVessel: async (
    vesselId: string
  ): Promise<GetVesselAssignmentsResponse> => {
    const response = await api.get(`/vessels/assignments/${vesselId}`);
    return response.data;
  },

  delete: async (
    vesselId: string,
    assignmentId: string
  ): Promise<DeleteVesselAssignmentResponse> => {
    const response = await api.delete(`/vessels/assignments/${vesselId}/${assignmentId}`);
    return response.data;
  },
};

export interface FormQuestion {
  order: number;
  type: "mcq" | "text" | "image" | "section";
  prompt?: string;  // Optional - only for questions
  title?: string;   // Optional - only for sections
  options?: string[];
  answer?: string;
  allow_image_upload?: boolean;
}

export interface CreateFormPayload {
  title: string;
  description: string;
  vessel_id?: string;
  due_date?: string;
  questions: FormQuestion[];
  questionImages?: { [key: number]: File }; // Maps question order to image file
  // Recurrence fields
  recurrence_start_date?: string;
  recurrence_interval_value?: number;
  recurrence_interval_unit?: "day" | "week" | "month" | "year";
  reminder_before_value?: number;
}

export interface FormData {
  form_id: string;
  vessel_id: string;
  created_by_admin_id: string | null;
  ship_id: string | null;
  title: string;
  description: string;
  status: string;
  assigned_inspector_id: string | null;
  assigned_crew_id: string | null;
  due_date: string | null;
  last_synced_at: string | null;
  questions: FormQuestion[];
  created_at: string | null;
  updated_at: string | null;
}

export interface CreateFormResponse {
  success: boolean;
  data: FormData;
  message: string;
  error: string | null;
}

export interface FormListItem {
  form_id: string;
  vessel_id: string;
  created_by_admin_id: string | null;
  title: string;
  description: string;
  status: string;
  due_date: string | null;
  questions: FormQuestion[];
  created_at: string | null;
  updated_at: string | null;
}

export interface GetFormsResponse {
  success: boolean;
  data: {
    items: FormListItem[];
    page: number;
    limit: number;
    has_next: boolean;
  };
  message: string;
  error: string | null;
}

export const formsApi = {
  create: async (payload: CreateFormPayload): Promise<CreateFormResponse> => {
    const formData = new FormData();
    formData.append("title", payload.title);
    formData.append("description", payload.description);
    if (payload.vessel_id) {
      formData.append("vessel_id", payload.vessel_id);
    }
    if (payload.due_date) {
      formData.append("due_date", payload.due_date);
    }
    formData.append("questions", JSON.stringify(payload.questions));

    // Append question images if provided
    if (payload.questionImages) {
      Object.entries(payload.questionImages).forEach(([order, file]) => {
        formData.append(`question_${order}_image`, file);
      });
    }

    // Append recurrence fields if provided
    if (payload.recurrence_start_date) {
      formData.append("recurrence_start_date", payload.recurrence_start_date);
    }
    if (payload.recurrence_interval_value !== undefined) {
      formData.append(
        "recurrence_interval_value",
        payload.recurrence_interval_value.toString()
      );
    }
    if (payload.recurrence_interval_unit) {
      formData.append(
        "recurrence_interval_unit",
        payload.recurrence_interval_unit
      );
    }
    if (payload.reminder_before_value !== undefined) {
      formData.append(
        "reminder_before_value",
        payload.reminder_before_value.toString()
      );
    }

    const response = await api.post("/forms", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getAll: async (
    page: number = 1,
    limit: number = 10
  ): Promise<GetFormsResponse> => {
    const response = await api.get(`/forms?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (formId: string, inspectionId?: string): Promise<GetFormByIdResponse> => {
    let url = `/forms/${formId}`;
    if (inspectionId) {
      url += `?inspection_id=${inspectionId}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  update: async (
    formId: string,
    payload: Partial<CreateFormPayload>
  ): Promise<CreateFormResponse> => {
    const formData = new FormData();

    if (payload.title) {
      formData.append("title", payload.title);
    }
    if (payload.description) {
      formData.append("description", payload.description);
    }
    if (payload.vessel_id) {
      formData.append("vessel_id", payload.vessel_id);
    }
    if (payload.due_date) {
      formData.append("due_date", payload.due_date);
    }
    if (payload.questions) {
      formData.append("questions", JSON.stringify(payload.questions));
    }

    // Append question images if provided
    if (payload.questionImages) {
      Object.entries(payload.questionImages).forEach(([order, file]) => {
        formData.append(`question_${order}_image`, file);
      });
    }

    // Append recurrence fields if provided
    if (payload.recurrence_start_date) {
      formData.append("recurrence_start_date", payload.recurrence_start_date);
    }
    if (payload.recurrence_interval_value !== undefined) {
      formData.append(
        "recurrence_interval_value",
        payload.recurrence_interval_value.toString()
      );
    }
    if (payload.recurrence_interval_unit) {
      formData.append(
        "recurrence_interval_unit",
        payload.recurrence_interval_unit
      );
    }
    if (payload.reminder_before_value !== undefined) {
      formData.append(
        "reminder_before_value",
        payload.reminder_before_value.toString()
      );
    }

    const response = await api.put(`/forms/${formId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  delete: async (formId: string): Promise<{ success: boolean; message: string; error: string | null }> => {
    const response = await api.delete(`/forms/${formId}`);
    return response.data;
  },

  checkTitle: async (title: string, excludeFormId?: string): Promise<{ success: boolean; data: { exists: boolean; message?: string }; message: string; error: string | null }> => {
    const params = new URLSearchParams({ title });
    if (excludeFormId) {
      params.append('exclude_form_id', excludeFormId);
    }
    const response = await api.get(`/forms/check-title?${params.toString()}`);
    return response.data;
  },
};

export interface FormDetailData {
  form_id: string;
  vessel_id: string;
  created_by_admin_id: string | null;
  ship_id: string | null;
  title: string;
  description: string;
  status: string;
  assigned_inspector_id: string | null;
  assigned_crew_id: string | null;
  due_date: string | null;
  last_synced_at: string | null;
  questions: FormQuestion[];
  created_at: string | null;
  updated_at: string | null;
}

export interface GetFormByIdResponse {
  success: boolean;
  data: FormDetailData;
  message: string;
  error: string | null;
}

// Inspection Assignment Interfaces
export interface CreateInspectionPayload {
  inspection_name: string;
  form_id: string;
  vessel_id: string;
  assignee_id: string;
  assignee_type: "inspector" | "crew";
  role: string;
  priority: "High" | "Medium" | "Low";
  due_date: string; // ISO 8601 format
}

export interface InspectionFormData {
  form_id: string;
  title: string;
  status: string;
  progress_percentage: number;
  due_date: string;
  vessel_id: string;
  description: string;
  questions?: Array<{
    options: string[];
    type: string;
    answer?: string;
    prompt: string;
    order: number;
  }>;
}

export interface InspectionAssignmentData {
  assignment_id: string;
  inspection_name?: string;
  form_id: string;
  vessel_id?: string;
  created_by_admin_id: string;
  assignee_id: string;
  assignee_type: string;
  role: string;
  priority: string;
  due_date: string;
  status: string;
  inspection_status?: string;
  inspection_progress_percentage?: number;
  created_at: string;
  updated_at: string;
  vessel?: {
    vessel_id: string;
    name: string;
    vessel_type: string;
    imo_number: string;
  };
  assignee: {
    user_id: string;
    name?: string | null;
    email: string;
    user_type: string;
  };
  admin: {
    admin_id: string;
    name?: string | null;
    email: string;
  };
  forms?: InspectionFormData[];
  // Keep backward compatibility with old API structure
  form?: {
    form_id: string;
    title: string;
    status: string;
    due_date: string;
    vessel_id: string;
    description: string;
  };
}

export interface CreateInspectionResponse {
  success: boolean;
  data: InspectionAssignmentData;
  message: string;
  error: string | null;
}

export interface GetInspectionAssignmentsResponse {
  success: boolean;
  data: {
    items: InspectionAssignmentData[];
    page: number;
    limit: number;
    has_next: boolean;
  };
  message: string;
  error: string | null;
}

export const inspectionApi = {
  create: async (
    payload: CreateInspectionPayload
  ): Promise<CreateInspectionResponse> => {
    const response = await api.post("/inspection-assignments", payload);
    return response.data;
  },

  getAll: async (
    page: number = 1,
    limit: number = 20
  ): Promise<GetInspectionAssignmentsResponse> => {
    const response = await api.get(
      `/inspection-assignments?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getByVessel: async (
    vesselId: string,
    page: number = 1,
    limit: number = 100
  ): Promise<GetInspectionAssignmentsResponse> => {
    const response = await api.get(
      `/inspection-assignments?vessel_id=${vesselId}&page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getById: async (vessel_id:string,assignmentId: string): Promise<CreateInspectionResponse> => {
    const response = await api.get(`/inspection-assignments/${vessel_id}/${assignmentId}`);
    return response.data;
  },

  deleteByFormId: async (
    vessel_id:string,
    assignment_id:string,
    formId: string
  ): Promise<{ success: boolean; message: string; error: string | null }> => {
    const response = await api.delete(`/inspection-assignments/${vessel_id}/${assignment_id}/${formId}`);
    return response.data;
  },
};

// User Interfaces
export interface CrewData {
  crew_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string | null;
  id_proof_url: string | null;
  address_proof_url: string | null;
  additional_docs: string[] | null;
}

export interface InspectorData {
  inspector_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string | null;
  id_proof_url: string | null;
  address_proof_url: string | null;
  additional_docs: string[] | null;
}

export interface GetCrewResponse {
  success: boolean;
  data: {
    crew: CrewData[];
    page: number;
    limit: number;
    has_next: boolean;
  };
  message: string;
  error: string | null;
}

export interface GetInspectorsResponse {
  success: boolean;
  data: {
    inspectors: InspectorData[];
    page: number;
    limit: number;
    has_next: boolean;
  };
  message: string;
  error: string | null;
}

export interface GetCrewByIdResponse {
  success: boolean;
  data: CrewData;
  message: string;
  error: string | null;
}

export interface GetInspectorByIdResponse {
  success: boolean;
  data: InspectorData;
  message: string;
  error: string | null;
}

export interface CreateUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  role: string;
  id_proof?: File;
  address_proof?: File;
  additional_docs?: File;
}

export interface CreateUserResponse {
  success: boolean;
  data: InspectorData | CrewData;
  message: string;
  error: string | null;
}

export interface DeleteUserResponse {
  success: boolean;
  data: {
    user_id?: string;
    inspector_id?: string;
    crew_id?: string;
    deleted: boolean;
    message: string;
  };
  message: string;
  error: string | null;
}

export const usersApi = {
  getCrew: async (
    page: number = 1,
    limit: number = 20
  ): Promise<GetCrewResponse> => {
    const response = await api.get(`/crew?page=${page}&limit=${limit}`);
    return response.data;
  },

  getCrewById: async (crewId: string): Promise<GetCrewByIdResponse> => {
    const response = await api.get(`/crew/${crewId}`);
    return response.data;
  },

  createCrew: async (
    payload: CreateUserPayload
  ): Promise<CreateUserResponse> => {
    const formData = new FormData();
    formData.append("first_name", payload.first_name);
    formData.append("last_name", payload.last_name);
    formData.append("email", payload.email);
    formData.append("phone_number", payload.phone_number);
    formData.append("password", payload.password);
    formData.append("role", payload.role);
    if (payload.id_proof) {
      formData.append("id_proof", payload.id_proof);
    }
    if (payload.address_proof) {
      formData.append("address_proof", payload.address_proof);
    }
    if (payload.additional_docs) {
      formData.append("additional_docs", payload.additional_docs);
    }

    const response = await api.post("/crew", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getInspectors: async (
    page: number = 1,
    limit: number = 20
  ): Promise<GetInspectorsResponse> => {
    const response = await api.get(
      `/admin/inspectors?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getInspectorById: async (
    inspectorId: string
  ): Promise<GetInspectorByIdResponse> => {
    const response = await api.get(`/admin/inspectors/${inspectorId}`);
    return response.data;
  },

  createInspector: async (
    payload: CreateUserPayload
  ): Promise<CreateUserResponse> => {
    const formData = new FormData();
    formData.append("first_name", payload.first_name);
    formData.append("last_name", payload.last_name);
    formData.append("email", payload.email);
    formData.append("phone_number", payload.phone_number);
    formData.append("password", payload.password);
    formData.append("role", payload.role);
    if (payload.id_proof) {
      formData.append("id_proof", payload.id_proof);
    }
    if (payload.address_proof) {
      formData.append("address_proof", payload.address_proof);
    }
    if (payload.additional_docs) {
      formData.append("additional_docs", payload.additional_docs);
    }

    const response = await api.post("/admin/inspectors", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  resetInspectorPassword: async (
    inspectorId: string,
    password: string
  ): Promise<any> => {
    const response = await api.post(
      `/admin/inspectors/${inspectorId}/reset-password`,
      { password }
    );
    return response.data;
  },

  resetCrewPassword: async (crewId: string, password: string): Promise<any> => {
    const response = await api.post(`/admin/crew/${crewId}/reset-password`, {
      password,
    });
    return response.data;
  },

  // deleteInspector: async (inspectorId: string): Promise<DeleteUserResponse> => {
  //   const response = await api.delete(`/admin/inspectors/${inspectorId}`);
  //   return response.data;
  // },
  deleteInspector: async (inspectorId: string): Promise<DeleteUserResponse> => {
  try {
    const response = await api.delete(`/admin/inspectors/${inspectorId}`);
    return response.data;
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "Failed to delete inspector";

    throw new Error(message);
  }
},

deleteCrew: async (crewId: string): Promise<DeleteUserResponse> => {
  try {
    const response = await api.delete(`/crew/${crewId}`);
    return response.data;
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      "Failed to delete crew";

    throw new Error(message);
  }
},




  // deleteCrew: async (crewId: string): Promise<DeleteUserResponse> => {
  //   const response = await api.delete(`/crew/${crewId}`);
  //   return response.data;
  // },

};

// Dashboard Interfaces
export interface SummaryCard {
  label: string;
  value: number;
  change_percentage: number;
  trend: "up" | "down";
}

export interface RecentActivity {
  action: string;
  timestamp: string;
  vessel_name: string | null;
  user_name: string;
}

export interface DefectSeverity {
  critical: number;
  major: number;
  minor: number;
  medium: number;
}

export interface DashboardVessel {
  vessel_id: string;
  vessel_name: string;
  defects_count: number;
  audits_count: number;
  last_updated: string;
}

export interface DashboardData {
  summary_cards: SummaryCard[];
  recent_activities: RecentActivity[];
  defect_severity: DefectSeverity;
  vessels: DashboardVessel[];
}

export interface GetDashboardResponse {
  success: boolean;
  data: DashboardData;
  message: string;
  error: string | null;
}

export const dashboardApi = {
  getData: async (): Promise<GetDashboardResponse> => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },
};

// Defects Interfaces
export interface TaskActivity {
  performed_by: string;
  action: string;
  timestamp: string;
}

export interface DefectData {
  defect_id: string;
  vessel_id: string;
  form_id: string;
  assignment_id: string;
  title: string;
  description?: string;
  severity: string;
  priority: string;
  status: string;
  raised_by_inspector_id?: string;
  raised_by_crew_id?: string;
  triggered_question_order?: number;
  triggered_question_text?: string;
  admin_comments?: string[];
  task_activities?: TaskActivity[];
  due_date?: string;
  closed_at?: string;
  approved_by_admin_id?: string;
  location_on_ship?: string;
  equipment_name?: string;
  photos?: string[];
  // Defect Analysis fields (legacy - preserved but not displayed)
  analysis_root_cause?: string;
  analysis_impact_assessment?: string;
  analysis_recurrence_probability?: string;
  analysis_notes?: string;
  analysis_photos?: string[];
  analysis_by_inspector_id?: string;
  analysis_created_at?: string;
  analysis_updated_at?: string;
  // New analysis fields
  detailed_description?: string;
  type_of_event?: string;
  immediate_causes_substandard_acts?: string;
  immediate_causes_substandard_conditions?: string;
  basic_causes_personal_factors?: string;
  basic_causes_job_system_factors?: string;
  corrective_action?: string;
  preventive_action?: string;
  cost_claims?: {
    marpol_claims?: { selected: boolean; details: string | null };
    hnm_claims?: { selected: boolean; details: string | null };
    offhire_due_to_operations_or_mechanical_failure?: { selected: boolean; details: string | null };
    medical_charges_involved?: { selected: boolean; details: string | null };
    penalties?: { selected: boolean; details: string | null };
    other?: { selected: boolean; details: string | null };
  };
  lessons_learnt?: string;
  supporting_documents?: Array<{
    file_name: string;
    file_type: string;
    s3_url: string;
  }>;
  created_at: string;
  updated_at: string;
  vessel?: {
    vessel_id: string;
    name: string;
    imo_number: string;
  };
  form?: {
    form_id: string;
    title: string;
  };
  raised_by_inspector?: {
    user_id: string;
    name: string;
    email: string;
    user_type: string;
  };
  raised_by_crew?: {
    user_id: string;
    name: string;
    email: string;
    user_type: string;
  };
}

export interface GetDefectsResponse {
  success: boolean;
  data: {
    items: DefectData[];
    page: number;
    limit: number;
    has_next: boolean;
  };
  message: string;
  error: string | null;
}

export interface GetDefectByIdResponse {
  success: boolean;
  data: DefectData;
  message: string;
  error: string | null;
}

export interface CreateDefectPayload {
  vessel_id: string;
  form_id?: string;
  assignment_id?: string;
  title: string;
  description?: string;
  severity: string;
  priority?: string;
  location_on_ship?: string;
  equipment_name?: string;
  assignee_id?: string;
  assignee_type?: string;
  due_date?: string;
  photos?: File[];
}

export interface CreateDefectResponse {
  success: boolean;
  data: DefectData;
  message: string;
  error: string | null;
}

export const defectsApi = {
  create: async (payload: CreateDefectPayload): Promise<CreateDefectResponse> => {
    const formData = new FormData();
    formData.append("vessel_id", payload.vessel_id);
    formData.append("title", payload.title);
    formData.append("severity", payload.severity);

    if (payload.form_id) formData.append("form_id", payload.form_id);
    if (payload.assignment_id) formData.append("assignment_id", payload.assignment_id);
    if (payload.description) formData.append("description", payload.description);
    if (payload.priority) formData.append("priority", payload.priority);
    if (payload.location_on_ship) formData.append("location_on_ship", payload.location_on_ship);
    if (payload.equipment_name) formData.append("equipment_name", payload.equipment_name);
    if (payload.assignee_id) formData.append("assignee_id", payload.assignee_id);
    if (payload.assignee_type) formData.append("assignee_type", payload.assignee_type);
    if (payload.due_date) formData.append("due_date", payload.due_date);

    if (payload.photos && payload.photos.length > 0) {
      payload.photos.forEach((photo) => {
        formData.append("photo", photo);
      });
    }

    const response = await api.post("/admin/defects", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getAll: async (
    page: number = 1,
    limit: number = 10
  ): Promise<GetDefectsResponse> => {
    const response = await api.get(
      `/admin/defects?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  getById: async (vessel_id:string,defectId: string): Promise<GetDefectByIdResponse> => {
    const response = await api.get(`/admin/defects/${vessel_id}/${defectId}`);
    return response.data;
  },

  approve: async (vessel_id:string,defectId: string): Promise<GetDefectByIdResponse> => {
    const response = await api.post(`/admin/defects/${vessel_id}/${defectId}/approve`);
    return response.data;
  },

  close: async (vessel_id:string,defectId: string): Promise<GetDefectByIdResponse> => {
    const response = await api.post(`/admin/defects/${vessel_id}/${defectId}/close`);
    return response.data;
  },

  addComment: async (
    vessel_id:string,
    defectId: string,
    comment: string
  ): Promise<GetDefectByIdResponse> => {
    const response = await api.post(`/admin/defects/${vessel_id}/${defectId}/comments`, {
      comment,
    });
    return response.data;
  },
};
