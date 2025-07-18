import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Analytics as AnalyticsIcon,
  Speed,
  Security,
  Refresh,
  Download
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface AnalyticsData {
  timestamp: string;
  requests: number;
  errors: number;
  responseTime: number;
  cpuUsage: number;
  memoryUsage: number;
}

interface ModelPerformance {
  modelName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastTrained: string;
  status: 'active' | 'training' | 'error';
}

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  resolved: boolean;
}

const Analytics: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('24h');
  
  const [performanceData, setPerformanceData] = useState<AnalyticsData[]>([
    { timestamp: '00:00', requests: 120, errors: 2, responseTime: 45, cpuUsage: 35, memoryUsage: 60 },
    { timestamp: '04:00', requests: 89, errors: 1, responseTime: 38, cpuUsage: 28, memoryUsage: 55 },
    { timestamp: '08:00', requests: 245, errors: 5, responseTime: 52, cpuUsage: 65, memoryUsage: 72 },
    { timestamp: '12:00', requests: 189, errors: 3, responseTime: 41, cpuUsage: 45, memoryUsage: 68 },
    { timestamp: '16:00', requests: 298, errors: 8, responseTime: 67, cpuUsage: 78, memoryUsage: 85 },
    { timestamp: '20:00', requests: 156, errors: 2, responseTime: 39, cpuUsage: 42, memoryUsage: 63 },
    { timestamp: '24:00', requests: 134, errors: 1, responseTime: 35, cpuUsage: 38, memoryUsage: 58 }
  ]);

  const [modelPerformance, setModelPerformance] = useState<ModelPerformance[]>([
    {
      modelName: 'Predictive Analytics Model',
      accuracy: 94.5,
      precision: 92.8,
      recall: 96.2,
      f1Score: 94.4,
      lastTrained: '2 hours ago',
      status: 'active'
    },
    {
      modelName: 'Anomaly Detection Model',
      accuracy: 89.3,
      precision: 87.1,
      recall: 91.5,
      f1Score: 89.2,
      lastTrained: '6 hours ago',
      status: 'active'
    },
    {
      modelName: 'Classification Model',
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      lastTrained: 'Never',
      status: 'training'
    }
  ]);

  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([
    {
      id: '1',
      type: 'Failed Login Attempt',
      severity: 'medium',
      description: 'Multiple failed login attempts from IP 192.168.1.100',
      timestamp: '2 minutes ago',
      resolved: false
    },
    {
      id: '2',
      type: 'Suspicious API Call',
      severity: 'high',
      description: 'Unusual API access pattern detected',
      timestamp: '15 minutes ago',
      resolved: true
    },
    {
      id: '3',
      type: 'Rate Limit Exceeded',
      severity: 'low',
      description: 'Client exceeded rate limit threshold',
      timestamp: '1 hour ago',
      resolved: true
    }
  ]);

  const pieData = [
    { name: 'Successful Requests', value: 92, color: '#00ff88' },
    { name: 'Client Errors', value: 5, color: '#ffe66d' },
    { name: 'Server Errors', value: 2, color: '#ff6b6b' },
    { name: 'Timeouts', value: 1, color: '#4ecdc4' }
  ];

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'error';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getModelStatusColor = (status: ModelPerformance['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'training': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const refreshData = () => {
    // Simulate data refresh
    console.log('Refreshing analytics data...');
  };

  const exportData = () => {
    // Simulate data export
    console.log('Exporting analytics data...');
  };

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    change: number;
    icon: React.ReactNode;
  }> = ({ title, value, change, icon }) => (
    <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" color="white" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" color="white" fontWeight="bold">
              {value}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              {change >= 0 ? (
                <TrendingUp color="success" fontSize="small" />
              ) : (
                <TrendingDown color="error" fontSize="small" />
              )}
              <Typography 
                variant="body2" 
                color={change >= 0 ? 'success.main' : 'error.main'}
              >
                {change >= 0 ? '+' : ''}{change}%
              </Typography>
            </Box>
          </Box>
          <Box color="#00ff88">
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3, backgroundColor: '#0f0f23', minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" color="white" fontWeight="bold">
          Analytics Dashboard
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: 'grey.400' }}>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' }
              }}
            >
              <MenuItem value="1h">Last Hour</MenuItem>
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
            </Select>
          </FormControl>
          <IconButton onClick={refreshData} sx={{ color: '#00ff88' }}>
            <Refresh />
          </IconButton>
          <IconButton onClick={exportData} sx={{ color: '#4ecdc4' }}>
            <Download />
          </IconButton>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Requests"
            value="1.2M"
            change={12.5}
            icon={<AnalyticsIcon fontSize="large" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg Response Time"
            value="45ms"
            change={-8.2}
            icon={<Speed fontSize="large" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Error Rate"
            value="0.02%"
            change={-15.3}
            icon={<Security fontSize="large" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Uptime"
            value="99.9%"
            change={0.1}
            icon={<TrendingUp fontSize="large" />}
          />
        </Grid>
      </Grid>

      {/* Analytics Tabs */}
      <Paper sx={{ backgroundColor: '#1a1a2e', color: 'white' }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: '1px solid #333',
            '& .MuiTab-root': { color: 'grey.400' },
            '& .Mui-selected': { color: '#00ff88' },
            '& .MuiTabs-indicator': { backgroundColor: '#00ff88' }
          }}
        >
          <Tab label="Performance" />
          <Tab label="AI Models" />
          <Tab label="Security" />
          <Tab label="Usage" />
        </Tabs>

        <Box p={3}>
          {/* Performance Tab */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" color="white" gutterBottom>
                  System Performance Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="timestamp" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2a2a3e',
                        border: '1px solid #00ff88',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="requests"
                      stackId="1"
                      stroke="#00ff88"
                      fill="#00ff88"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="errors"
                      stackId="2"
                      stroke="#ff6b6b"
                      fill="#ff6b6b"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" color="white" gutterBottom>
                  Request Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          )}

          {/* AI Models Tab */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" color="white" gutterBottom>
                AI Model Performance
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'white', borderColor: '#333' }}>Model Name</TableCell>
                      <TableCell sx={{ color: 'white', borderColor: '#333' }}>Accuracy</TableCell>
                      <TableCell sx={{ color: 'white', borderColor: '#333' }}>Precision</TableCell>
                      <TableCell sx={{ color: 'white', borderColor: '#333' }}>Recall</TableCell>
                      <TableCell sx={{ color: 'white', borderColor: '#333' }}>F1 Score</TableCell>
                      <TableCell sx={{ color: 'white', borderColor: '#333' }}>Last Trained</TableCell>
                      <TableCell sx={{ color: 'white', borderColor: '#333' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {modelPerformance.map((model, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ color: 'white', borderColor: '#333' }}>
                          {model.modelName}
                        </TableCell>
                        <TableCell sx={{ color: 'white', borderColor: '#333' }}>
                          {model.accuracy > 0 ? `${model.accuracy}%` : 'N/A'}
                        </TableCell>
                        <TableCell sx={{ color: 'white', borderColor: '#333' }}>
                          {model.precision > 0 ? `${model.precision}%` : 'N/A'}
                        </TableCell>
                        <TableCell sx={{ color: 'white', borderColor: '#333' }}>
                          {model.recall > 0 ? `${model.recall}%` : 'N/A'}
                        </TableCell>
                        <TableCell sx={{ color: 'white', borderColor: '#333' }}>
                          {model.f1Score > 0 ? `${model.f1Score}%` : 'N/A'}
                        </TableCell>
                        <TableCell sx={{ color: 'white', borderColor: '#333' }}>
                          {model.lastTrained}
                        </TableCell>
                        <TableCell sx={{ color: 'white', borderColor: '#333' }}>
                          <Chip
                            label={model.status.toUpperCase()}
                            color={getModelStatusColor(model.status)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Security Tab */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" color="white" gutterBottom>
                Security Events
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'white', borderColor: '#333' }}>Type</TableCell>
                      <TableCell sx={{ color: 'white', borderColor: '#333' }}>Severity</TableCell>
                      <TableCell sx={{ color: 'white', borderColor: '#333' }}>Description</TableCell>
                      <TableCell sx={{ color: 'white', borderColor: '#333' }}>Timestamp</TableCell>
                      <TableCell sx={{ color: 'white', borderColor: '#333' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {securityEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell sx={{ color: 'white', borderColor: '#333' }}>
                          {event.type}
                        </TableCell>
                        <TableCell sx={{ color: 'white', borderColor: '#333' }}>
                          <Chip
                            label={event.severity.toUpperCase()}
                            color={getSeverityColor(event.severity)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ color: 'white', borderColor: '#333' }}>
                          {event.description}
                        </TableCell>
                        <TableCell sx={{ color: 'white', borderColor: '#333' }}>
                          {event.timestamp}
                        </TableCell>
                        <TableCell sx={{ color: 'white', borderColor: '#333' }}>
                          <Chip
                            label={event.resolved ? 'RESOLVED' : 'OPEN'}
                            color={event.resolved ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Usage Tab */}
          {tabValue === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" color="white" gutterBottom>
                  Resource Usage Trends
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="timestamp" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#2a2a3e',
                        border: '1px solid #00ff88',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cpuUsage"
                      stroke="#00ff88"
                      strokeWidth={2}
                      name="CPU Usage (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="memoryUsage"
                      stroke="#4ecdc4"
                      strokeWidth={2}
                      name="Memory Usage (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="#ffe66d"
                      strokeWidth={2}
                      name="Response Time (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Analytics;