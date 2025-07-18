import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Project {
  id: number;
  name: string;
  description: string;
  type: string;
  status: string;
  progress: number;
  created_at: string;
  updated_at: string;
  ai_models: number;
  data_points: number;
}

interface ProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  createLoading: boolean;
  updateLoading: boolean;
  selectedProject: Project | null;
}

interface CreateProjectData {
  name: string;
  description: string;
  type: string;
}

interface UpdateProjectData {
  id: number;
  status?: string;
  progress?: number;
}

// Initial state
const initialState: ProjectsState = {
  projects: [],
  loading: false,
  error: null,
  createLoading: false,
  updateLoading: false,
  selectedProject: null,
};

// Async thunks
export const fetchProjects = createAsyncThunk<Project[], void, { state: { auth: { token: string | null } } }>(
  'projects/fetchProjects',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue('No authentication token');
      }

      const response = await fetch('http://localhost:5001/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch projects');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const createProject = createAsyncThunk<
  { message: string; id: number },
  CreateProjectData,
  { state: { auth: { token: string | null } } }
>(
  'projects/createProject',
  async (projectData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue('No authentication token');
      }

      const response = await fetch('http://localhost:5001/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to create project');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const updateProject = createAsyncThunk<
  { message: string },
  UpdateProjectData,
  { state: { auth: { token: string | null } } }
>(
  'projects/updateProject',
  async (updateData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue('No authentication token');
      }

      const { id, ...data } = updateData;
      const response = await fetch(`http://localhost:5001/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to update project');
      }

      const responseData = await response.json();
      return responseData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const deleteProject = createAsyncThunk<
  number,
  number,
  { state: { auth: { token: string | null } } }
>(
  'projects/deleteProject',
  async (projectId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue('No authentication token');
      }

      const response = await fetch(`http://localhost:5001/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to delete project');
      }

      return projectId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Project slice
const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedProject: (state, action: PayloadAction<Project | null>) => {
      state.selectedProject = action.payload;
    },
    updateProjectProgress: (state, action: PayloadAction<{ id: number; progress: number }>) => {
      const project = state.projects.find(p => p.id === action.payload.id);
      if (project) {
        project.progress = action.payload.progress;
      }
    },
    updateProjectStatus: (state, action: PayloadAction<{ id: number; status: string }>) => {
      const project = state.projects.find(p => p.id === action.payload.id);
      if (project) {
        project.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create project
      .addCase(createProject.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state) => {
        state.createLoading = false;
        state.error = null;
        // Optionally refresh projects list or add the new project
      })
      .addCase(createProject.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload as string;
      })
      // Update project
      .addCase(updateProject.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state) => {
        state.updateLoading = false;
        state.error = null;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      })
      // Delete project
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p.id !== action.payload);
        if (state.selectedProject?.id === action.payload) {
          state.selectedProject = null;
        }
      });
  },
});

export const {
  clearError,
  setSelectedProject,
  updateProjectProgress,
  updateProjectStatus,
} = projectSlice.actions;

export default projectSlice.reducer;

// Selectors
export const selectProjects = (state: { projects: ProjectsState }) => state.projects.projects;
export const selectProjectsLoading = (state: { projects: ProjectsState }) => state.projects.loading;
export const selectProjectsError = (state: { projects: ProjectsState }) => state.projects.error;
export const selectCreateLoading = (state: { projects: ProjectsState }) => state.projects.createLoading;
export const selectUpdateLoading = (state: { projects: ProjectsState }) => state.projects.updateLoading;
export const selectSelectedProject = (state: { projects: ProjectsState }) => state.projects.selectedProject;

// Computed selectors
export const selectProjectsByStatus = (status: string) => (state: { projects: ProjectsState }) =>
  state.projects.projects.filter(project => project.status === status);

export const selectProjectsByType = (type: string) => (state: { projects: ProjectsState }) =>
  state.projects.projects.filter(project => project.type === type);

export const selectProjectStats = (state: { projects: ProjectsState }) => {
  const projects = state.projects.projects;
  return {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    paused: projects.filter(p => p.status === 'paused').length,
    avgProgress: projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0,
  };
};