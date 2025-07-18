import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Paper
} from '@mui/material';
import {
  TrendingUp,
  Security,
  Speed,
  CloudQueue,
  Refresh,
  Warning,
  CircularProgress
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MetricData {
  timestamp: string;
  value: number;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  requestsPerSecond: number;
  errorRate: number;
  uptime: string;
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 0,
    memoryUsage: 0,
    activeConnections: 0,
    requestsPerSecond: 0,
    errorRate: 0,
    uptime: '0d 0h 0m'
  });

  const [chartData, setChartData] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/dashboard/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      } else {
        console.error('Failed to fetch metrics:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/dashboard/performance-data', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChartData(data.performance_data || []);
      } else {
        console.error('Failed to fetch performance data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    }
  };

  const refreshMetrics = async () => {
    setLoading(true);
    await Promise.all([fetchMetrics(), fetchPerformanceData()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshMetrics();
    const interval = setInterval(refreshMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" color="white" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" color={color} fontWeight="bold">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="grey.400">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box color={color}>
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
          AI Platform Dashboard
        </Typography>
        <IconButton onClick={refreshMetrics} sx={{ color: '#00ff88' }} disabled={loading}>
          {loading ? <CircularProgress size={24} sx={{ color: '#00ff88' }} /> : <Refresh />}
        </IconButton>
      </Box>

      <Grid container spacing={3}>
        {/* System Metrics */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="CPU Usage"
            value={`${metrics.cpuUsage}%`}
            icon={<Speed fontSize="large" />}
            color="#00ff88"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Memory Usage"
            value={`${metrics.memoryUsage}%`}
            icon={<CloudQueue fontSize="large" />}
            color="#ff6b6b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Connections"
            value={metrics.activeConnections.toLocaleString()}
            icon={<TrendingUp fontSize="large" />}
            color="#4ecdc4"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Requests/sec"
            value={metrics.requestsPerSecond}
            icon={<Security fontSize="large" />}
            color="#ffe66d"
            subtitle={`Error rate: ${(metrics.errorRate * 100).toFixed(2)}%`}
          />
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, backgroundColor: '#1a1a2e', color: 'white' }}>
            <Typography variant="h6" gutterBottom>
              System Performance (24h)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
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
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#00ff88"
                  strokeWidth={2}
                  dot={{ fill: '#00ff88', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, backgroundColor: '#1a1a2e', color: 'white', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>Uptime</Typography>
                <Chip label={metrics.uptime} color="success" size="small" />
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>Database</Typography>
                <Chip label="Connected" color="success" size="small" />
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>Redis Cache</Typography>
                <Chip label="Connected" color="success" size="small" />
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>AI Models</Typography>
                <Chip label="Loading" color="warning" size="small" />
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>Security Scan</Typography>
                <Chip label="Pending" color="info" size="small" />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Alerts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, backgroundColor: '#1a1a2e', color: 'white' }}>
            <Typography variant="h6" gutterBottom>
              Recent Alerts
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" alignItems="center" gap={2}>
                <Warning color="warning" />
                <Typography>High memory usage detected on backend service</Typography>
                <Typography variant="body2" color="grey.400">2 minutes ago</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={2}>
                <Security color="info" />
                <Typography>Security scan completed - No vulnerabilities found</Typography>
                <Typography variant="body2" color="grey.400">15 minutes ago</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;