import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface AIModel {
  id: number;
  name: string;
  type: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  status: string;
  last_trained: string | null;
}

export interface SecurityEvent {
  id: number;
  type: string;
  severity: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  ip_address: string;
}

export interface DashboardMetrics {
  cpu_usage: number;
  memory_usage: number;
  active_connections: number;
  requests_per_second: number;
  error_rate: number;
  uptime: string;
  total_requests: string;
  avg_response_time: string;
}

export interface PerformanceData {
  timestamp: string;
  requests: number;
  errors: number;
  response_time: number;
  cpu_usage: number;
  memory_usage: number;
}

interface AnalyticsState {
  // AI Models
  aiModels: AIModel[];
  aiModelsLoading: boolean;
  aiModelsError: string | null;
  
  // Security Events
  securityEvents: SecurityEvent[];
  securityEventsLoading: boolean;
  securityEventsError: string | null;
  
  // Dashboard Metrics
  dashboardMetrics: DashboardMetrics | null;
  metricsLoading: boolean;
  metricsError: string | null;
  
  // Performance Data
  performanceData: PerformanceData[];
  performanceLoading: boolean;
  performanceError: string | null;
  
  // Model Training
  trainingLoading: boolean;
  trainingError: string | null;
}

// Initial state
const initialState: AnalyticsState = {
  aiModels: [],
  aiModelsLoading: false,
  aiModelsError: null,
  
  securityEvents: [],
  securityEventsLoading: false,
  securityEventsError: null,
  
  dashboardMetrics: null,
  metricsLoading: false,
  metricsError: null,
  
  performanceData: [],
  performanceLoading: false,
  performanceError: null,
  
  trainingLoading: false,
  trainingError: null,
};

// Async thunks
export const fetchAIModels = createAsyncThunk<AIModel[], void, { state: { auth: { token: string | null } } }>(
  'analytics/fetchAIModels',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue('No authentication token');
      }

      const response = await fetch('http://localhost:5001/api/ai-models', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch AI models');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchSecurityEvents = createAsyncThunk<SecurityEvent[], void, { state: { auth: { token: string | null } } }>(
  'analytics/fetchSecurityEvents',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue('No authentication token');
      }

      const response = await fetch('http://localhost:5001/api/analytics/security-events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch security events');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchDashboardMetrics = createAsyncThunk<DashboardMetrics, void, { state: { auth: { token: string | null } } }>(
  'analytics/fetchDashboardMetrics',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue('No authentication token');
      }

      const response = await fetch('http://localhost:5001/api/dashboard/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch dashboard metrics');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchPerformanceData = createAsyncThunk<PerformanceData[], void, { state: { auth: { token: string | null } } }>(
  'analytics/fetchPerformanceData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue('No authentication token');
      }

      const response = await fetch('http://localhost:5001/api/dashboard/performance-data', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to fetch performance data');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const trainAIModel = createAsyncThunk<
  { message: string; metrics: any },
  { model_name: string },
  { state: { auth: { token: string | null } } }
>(
  'analytics/trainAIModel',
  async (modelData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) {
        return rejectWithValue('No authentication token');
      }

      const response = await fetch('http://localhost:5001/api/ai-models/train', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(modelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || 'Failed to train model');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Analytics slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.aiModelsError = null;
      state.securityEventsError = null;
      state.metricsError = null;
      state.performanceError = null;
      state.trainingError = null;
    },
    clearAIModelsError: (state) => {
      state.aiModelsError = null;
    },
    clearSecurityEventsError: (state) => {
      state.securityEventsError = null;
    },
    clearMetricsError: (state) => {
      state.metricsError = null;
    },
    clearPerformanceError: (state) => {
      state.performanceError = null;
    },
    clearTrainingError: (state) => {
      state.trainingError = null;
    },
    updateSecurityEventStatus: (state, action: PayloadAction<{ id: number; resolved: boolean }>) => {
      const event = state.securityEvents.find(e => e.id === action.payload.id);
      if (event) {
        event.resolved = action.payload.resolved;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch AI Models
      .addCase(fetchAIModels.pending, (state) => {
        state.aiModelsLoading = true;
        state.aiModelsError = null;
      })
      .addCase(fetchAIModels.fulfilled, (state, action) => {
        state.aiModelsLoading = false;
        state.aiModels = action.payload;
        state.aiModelsError = null;
      })
      .addCase(fetchAIModels.rejected, (state, action) => {
        state.aiModelsLoading = false;
        state.aiModelsError = action.payload as string;
      })
      // Fetch Security Events
      .addCase(fetchSecurityEvents.pending, (state) => {
        state.securityEventsLoading = true;
        state.securityEventsError = null;
      })
      .addCase(fetchSecurityEvents.fulfilled, (state, action) => {
        state.securityEventsLoading = false;
        state.securityEvents = action.payload;
        state.securityEventsError = null;
      })
      .addCase(fetchSecurityEvents.rejected, (state, action) => {
        state.securityEventsLoading = false;
        state.securityEventsError = action.payload as string;
      })
      // Fetch Dashboard Metrics
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.metricsLoading = true;
        state.metricsError = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.metricsLoading = false;
        state.dashboardMetrics = action.payload;
        state.metricsError = null;
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.metricsLoading = false;
        state.metricsError = action.payload as string;
      })
      // Fetch Performance Data
      .addCase(fetchPerformanceData.pending, (state) => {
        state.performanceLoading = true;
        state.performanceError = null;
      })
      .addCase(fetchPerformanceData.fulfilled, (state, action) => {
        state.performanceLoading = false;
        state.performanceData = action.payload;
        state.performanceError = null;
      })
      .addCase(fetchPerformanceData.rejected, (state, action) => {
        state.performanceLoading = false;
        state.performanceError = action.payload as string;
      })
      // Train AI Model
      .addCase(trainAIModel.pending, (state) => {
        state.trainingLoading = true;
        state.trainingError = null;
      })
      .addCase(trainAIModel.fulfilled, (state) => {
        state.trainingLoading = false;
        state.trainingError = null;
        // Optionally refresh AI models list
      })
      .addCase(trainAIModel.rejected, (state, action) => {
        state.trainingLoading = false;
        state.trainingError = action.payload as string;
      });
  },
});

export const {
  clearErrors,
  clearAIModelsError,
  clearSecurityEventsError,
  clearMetricsError,
  clearPerformanceError,
  clearTrainingError,
  updateSecurityEventStatus,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;

// Selectors
export const selectAIModels = (state: { analytics: AnalyticsState }) => state.analytics.aiModels;
export const selectAIModelsLoading = (state: { analytics: AnalyticsState }) => state.analytics.aiModelsLoading;
export const selectAIModelsError = (state: { analytics: AnalyticsState }) => state.analytics.aiModelsError;

export const selectSecurityEvents = (state: { analytics: AnalyticsState }) => state.analytics.securityEvents;
export const selectSecurityEventsLoading = (state: { analytics: AnalyticsState }) => state.analytics.securityEventsLoading;
export const selectSecurityEventsError = (state: { analytics: AnalyticsState }) => state.analytics.securityEventsError;

export const selectDashboardMetrics = (state: { analytics: AnalyticsState }) => state.analytics.dashboardMetrics;
export const selectMetricsLoading = (state: { analytics: AnalyticsState }) => state.analytics.metricsLoading;
export const selectMetricsError = (state: { analytics: AnalyticsState }) => state.analytics.metricsError;

export const selectPerformanceData = (state: { analytics: AnalyticsState }) => state.analytics.performanceData;
export const selectPerformanceLoading = (state: { analytics: AnalyticsState }) => state.analytics.performanceLoading;
export const selectPerformanceError = (state: { analytics: AnalyticsState }) => state.analytics.performanceError;

export const selectTrainingLoading = (state: { analytics: AnalyticsState }) => state.analytics.trainingLoading;
export const selectTrainingError = (state: { analytics: AnalyticsState }) => state.analytics.trainingError;

// Computed selectors
export const selectActiveAIModels = (state: { analytics: AnalyticsState }) =>
  state.analytics.aiModels.filter(model => model.status === 'active');

export const selectUnresolvedSecurityEvents = (state: { analytics: AnalyticsState }) =>
  state.analytics.securityEvents.filter(event => !event.resolved);

export const selectHighSeverityEvents = (state: { analytics: AnalyticsState }) =>
  state.analytics.securityEvents.filter(event => event.severity === 'high');

export const selectAIModelStats = (state: { analytics: AnalyticsState }) => {
  const models = state.analytics.aiModels;
  if (models.length === 0) {
    return {
      total: 0,
      active: 0,
      avgAccuracy: 0,
      avgPrecision: 0,
      avgRecall: 0,
      avgF1Score: 0,
    };
  }

  const activeModels = models.filter(m => m.status === 'active');
  return {
    total: models.length,
    active: activeModels.length,
    avgAccuracy: Math.round(models.reduce((sum, m) => sum + m.accuracy, 0) / models.length),
    avgPrecision: Math.round(models.reduce((sum, m) => sum + m.precision, 0) / models.length),
    avgRecall: Math.round(models.reduce((sum, m) => sum + m.recall, 0) / models.length),
    avgF1Score: Math.round(models.reduce((sum, m) => sum + m.f1_score, 0) / models.length),
  };
};

export const selectSecurityEventStats = (state: { analytics: AnalyticsState }) => {
  const events = state.analytics.securityEvents;
  return {
    total: events.length,
    unresolved: events.filter(e => !e.resolved).length,
    high: events.filter(e => e.severity === 'high').length,
    medium: events.filter(e => e.severity === 'medium').length,
    low: events.filter(e => e.severity === 'low').length,
  };
};