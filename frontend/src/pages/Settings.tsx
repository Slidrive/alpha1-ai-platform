import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Paper,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider
} from '@mui/material';
import {
  Security,
  Notifications,
  Storage,
  Speed,
  Delete,
  Edit,
  Add,
  Save,
  Refresh,
  CloudUpload,
  VpnKey,
  Shield
} from '@mui/icons-material';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'analyst' | 'viewer';
  lastActive: string;
  status: 'active' | 'inactive';
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  created: string;
  lastUsed: string;
}

const Settings: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openAPIDialog, setOpenAPIDialog] = useState(false);
  
  // General Settings
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      security: true,
      performance: true
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5
    },
    performance: {
      cacheEnabled: true,
      compressionEnabled: true,
      maxConnections: 1000,
      requestTimeout: 30
    },
    ai: {
      autoRetrain: true,
      modelOptimization: true,
      batchSize: 32,
      learningRate: 0.001
    }
  });

  // Users Management
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
      lastActive: '2 minutes ago',
      status: 'active'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'developer',
      lastActive: '1 hour ago',
      status: 'active'
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      role: 'analyst',
      lastActive: '1 day ago',
      status: 'inactive'
    }
  ]);

  // API Keys Management
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'Production API',
      key: 'ak_prod_1234567890abcdef',
      permissions: ['read', 'write', 'admin'],
      created: '2023-01-15',
      lastUsed: '2 hours ago'
    },
    {
      id: '2',
      name: 'Development API',
      key: 'ak_dev_abcdef1234567890',
      permissions: ['read', 'write'],
      created: '2023-02-01',
      lastUsed: '1 day ago'
    }
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'viewer' as User['role']
  });

  const [newAPIKey, setNewAPIKey] = useState({
    name: '',
    permissions: [] as string[]
  });

  const handleSettingChange = (category: string, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

  const handleCreateUser = () => {
    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      lastActive: 'Never',
      status: 'active'
    };
    setUsers([...users, user]);
    setOpenUserDialog(false);
    setNewUser({ name: '', email: '', role: 'viewer' });
  };

  const handleCreateAPIKey = () => {
    const apiKey: APIKey = {
      id: Date.now().toString(),
      name: newAPIKey.name,
      key: `ak_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`,
      permissions: newAPIKey.permissions,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never'
    };
    setAPIKeys([...apiKeys, apiKey]);
    setOpenAPIDialog(false);
    setNewAPIKey({ name: '', permissions: [] });
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
  };

  const handleDeleteAPIKey = (keyId: string) => {
    setAPIKeys(apiKeys.filter(key => key.id !== keyId));
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'error';
      case 'developer': return 'warning';
      case 'analyst': return 'info';
      case 'viewer': return 'default';
      default: return 'default';
    }
  };

  const SettingsCard: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ title, icon, children }) => (
    <Card sx={{ 
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      border: '1px solid #333'
    }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Box color="#00ff88">{icon}</Box>
          <Typography variant="h6" color="white" fontWeight="bold">
            {title}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3, backgroundColor: '#0f0f23', minHeight: '100vh' }}>
      <Typography variant="h4" color="white" fontWeight="bold" mb={3}>
        System Settings
      </Typography>

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
          <Tab label="General" />
          <Tab label="Security" />
          <Tab label="Users" />
          <Tab label="API Keys" />
          <Tab label="Performance" />
        </Tabs>

        <Box p={3}>
          {/* General Settings */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <SettingsCard title="Notifications" icon={<Notifications />}>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.email}
                          onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#00ff88' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00ff88' }
                          }}
                        />
                      }
                      label="Email Notifications"
                      sx={{ color: 'white' }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.push}
                          onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#00ff88' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00ff88' }
                          }}
                        />
                      }
                      label="Push Notifications"
                      sx={{ color: 'white' }}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.security}
                          onChange={(e) => handleSettingChange('notifications', 'security', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#00ff88' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00ff88' }
                          }}
                        />
                      }
                      label="Security Alerts"
                      sx={{ color: 'white' }}
                    />
                  </Box>
                </SettingsCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <SettingsCard title="AI Configuration" icon={<CloudUpload />}>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.ai.autoRetrain}
                          onChange={(e) => handleSettingChange('ai', 'autoRetrain', e.target.checked)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': { color: '#00ff88' },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00ff88' }
                          }}
                        />
                      }
                      label="Auto Model Retraining"
                      sx={{ color: 'white' }}
                    />
                    <Box>
                      <Typography variant="body2" color="grey.400" gutterBottom>
                        Batch Size: {settings.ai.batchSize}
                      </Typography>
                      <Slider
                        value={settings.ai.batchSize}
                        onChange={(_, value) => handleSettingChange('ai', 'batchSize', value)}
                        min={16}
                        max={128}
                        step={16}
                        sx={{
                          color: '#00ff88',
                          '& .MuiSlider-thumb': { backgroundColor: '#00ff88' },
                          '& .MuiSlider-track': { backgroundColor: '#00ff88' }
                        }}
                      />
                    </Box>
                  </Box>
                </SettingsCard>
              </Grid>
            </Grid>
          )}

          {/* Security Settings */}
          {tabValue === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <SettingsCard title="Security Configuration" icon={<Security />}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.security.twoFactor}
                            onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#00ff88' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00ff88' }
                            }}
                          />
                        }
                        label="Two-Factor Authentication"
                        sx={{ color: 'white' }}
                      />
                      <Box mt={2}>
                        <Typography variant="body2" color="grey.400" gutterBottom>
                          Session Timeout (minutes): {settings.security.sessionTimeout}
                        </Typography>
                        <Slider
                          value={settings.security.sessionTimeout}
                          onChange={(_, value) => handleSettingChange('security', 'sessionTimeout', value)}
                          min={15}
                          max={120}
                          step={15}
                          sx={{
                            color: '#00ff88',
                            '& .MuiSlider-thumb': { backgroundColor: '#00ff88' },
                            '& .MuiSlider-track': { backgroundColor: '#00ff88' }
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="body2" color="grey.400" gutterBottom>
                          Max Login Attempts: {settings.security.loginAttempts}
                        </Typography>
                        <Slider
                          value={settings.security.loginAttempts}
                          onChange={(_, value) => handleSettingChange('security', 'loginAttempts', value)}
                          min={3}
                          max={10}
                          step={1}
                          sx={{
                            color: '#00ff88',
                            '& .MuiSlider-thumb': { backgroundColor: '#00ff88' },
                            '& .MuiSlider-track': { backgroundColor: '#00ff88' }
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </SettingsCard>
              </Grid>
            </Grid>
          )}

          {/* Users Management */}
          {tabValue === 2 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" color="white">
                  User Management
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenUserDialog(true)}
                  sx={{
                    backgroundColor: '#00ff88',
                    color: '#000',
                    '&:hover': { backgroundColor: '#00cc6a' }
                  }}
                >
                  Add User
                </Button>
              </Box>
              <List>
                {users.map((user) => (
                  <ListItem
                    key={user.id}
                    sx={{
                      backgroundColor: '#2a2a3e',
                      mb: 1,
                      borderRadius: 1,
                      border: '1px solid #333'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography color="white">{user.name}</Typography>
                          <Chip
                            label={user.role.toUpperCase()}
                            color={getRoleColor(user.role)}
                            size="small"
                          />
                          <Chip
                            label={user.status.toUpperCase()}
                            color={user.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Typography color="grey.400">
                          {user.email} • Last active: {user.lastActive}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton sx={{ color: '#4ecdc4' }}>
                        <Edit />
                      </IconButton>
                      <IconButton 
                        sx={{ color: '#ff6b6b' }}
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* API Keys Management */}
          {tabValue === 3 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" color="white">
                  API Keys Management
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<VpnKey />}
                  onClick={() => setOpenAPIDialog(true)}
                  sx={{
                    backgroundColor: '#00ff88',
                    color: '#000',
                    '&:hover': { backgroundColor: '#00cc6a' }
                  }}
                >
                  Generate API Key
                </Button>
              </Box>
              <List>
                {apiKeys.map((apiKey) => (
                  <ListItem
                    key={apiKey.id}
                    sx={{
                      backgroundColor: '#2a2a3e',
                      mb: 1,
                      borderRadius: 1,
                      border: '1px solid #333'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={2}>
                          <Typography color="white">{apiKey.name}</Typography>
                          {apiKey.permissions.map((permission) => (
                            <Chip
                              key={permission}
                              label={permission.toUpperCase()}
                              color="info"
                              size="small"
                            />
                          ))}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography color="grey.400" sx={{ fontFamily: 'monospace' }}>
                            {apiKey.key}
                          </Typography>
                          <Typography color="grey.400">
                            Created: {apiKey.created} • Last used: {apiKey.lastUsed}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        sx={{ color: '#ff6b6b' }}
                        onClick={() => handleDeleteAPIKey(apiKey.id)}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Performance Settings */}
          {tabValue === 4 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <SettingsCard title="Performance Configuration" icon={<Speed />}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.performance.cacheEnabled}
                            onChange={(e) => handleSettingChange('performance', 'cacheEnabled', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#00ff88' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00ff88' }
                            }}
                          />
                        }
                        label="Enable Caching"
                        sx={{ color: 'white' }}
                      />
                      <Box mt={2}>
                        <Typography variant="body2" color="grey.400" gutterBottom>
                          Max Connections: {settings.performance.maxConnections}
                        </Typography>
                        <Slider
                          value={settings.performance.maxConnections}
                          onChange={(_, value) => handleSettingChange('performance', 'maxConnections', value)}
                          min={100}
                          max={5000}
                          step={100}
                          sx={{
                            color: '#00ff88',
                            '& .MuiSlider-thumb': { backgroundColor: '#00ff88' },
                            '& .MuiSlider-track': { backgroundColor: '#00ff88' }
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={settings.performance.compressionEnabled}
                            onChange={(e) => handleSettingChange('performance', 'compressionEnabled', e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': { color: '#00ff88' },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00ff88' }
                            }}
                          />
                        }
                        label="Enable Compression"
                        sx={{ color: 'white' }}
                      />
                      <Box mt={2}>
                        <Typography variant="body2" color="grey.400" gutterBottom>
                          Request Timeout (seconds): {settings.performance.requestTimeout}
                        </Typography>
                        <Slider
                          value={settings.performance.requestTimeout}
                          onChange={(_, value) => handleSettingChange('performance', 'requestTimeout', value)}
                          min={10}
                          max={120}
                          step={10}
                          sx={{
                            color: '#00ff88',
                            '& .MuiSlider-thumb': { backgroundColor: '#00ff88' },
                            '& .MuiSlider-track': { backgroundColor: '#00ff88' }
                          }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </SettingsCard>
              </Grid>
            </Grid>
          )}
        </Box>
      </Paper>

      {/* Save Button */}
      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          startIcon={<Save />}
          sx={{
            backgroundColor: '#00ff88',
            color: '#000',
            '&:hover': { backgroundColor: '#00cc6a' }
          }}
        >
          Save Settings
        </Button>
      </Box>

      {/* Add User Dialog */}
      <Dialog
        open={openUserDialog}
        onClose={() => setOpenUserDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: '#1a1a2e', color: 'white' }
        }}
      >
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Full Name"
            fullWidth
            variant="outlined"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: '#333' },
                '&:hover fieldset': { borderColor: '#00ff88' },
                '&.Mui-focused fieldset': { borderColor: '#00ff88' }
              },
              '& .MuiInputLabel-root': { color: 'grey.400' }
            }}
          />
          <TextField
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: '#333' },
                '&:hover fieldset': { borderColor: '#00ff88' },
                '&.Mui-focused fieldset': { borderColor: '#00ff88' }
              },
              '& .MuiInputLabel-root': { color: 'grey.400' }
            }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel sx={{ color: 'grey.400' }}>Role</InputLabel>
            <Select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User['role'] })}
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' }
              }}
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="developer">Developer</MenuItem>
              <MenuItem value="analyst">Analyst</MenuItem>
              <MenuItem value="viewer">Viewer</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)} sx={{ color: 'grey.400' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            sx={{
              backgroundColor: '#00ff88',
              color: '#000',
              '&:hover': { backgroundColor: '#00cc6a' }
            }}
            disabled={!newUser.name || !newUser.email}
          >
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add API Key Dialog */}
      <Dialog
        open={openAPIDialog}
        onClose={() => setOpenAPIDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { backgroundColor: '#1a1a2e', color: 'white' }
        }}
      >
        <DialogTitle>Generate API Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="API Key Name"
            fullWidth
            variant="outlined"
            value={newAPIKey.name}
            onChange={(e) => setNewAPIKey({ ...newAPIKey, name: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: '#333' },
                '&:hover fieldset': { borderColor: '#00ff88' },
                '&.Mui-focused fieldset': { borderColor: '#00ff88' }
              },
              '& .MuiInputLabel-root': { color: 'grey.400' }
            }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel sx={{ color: 'grey.400' }}>Permissions</InputLabel>
            <Select
              multiple
              value={newAPIKey.permissions}
              onChange={(e) => setNewAPIKey({ ...newAPIKey, permissions: e.target.value as string[] })}
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' }
              }}
            >
              <MenuItem value="read">Read</MenuItem>
              <MenuItem value="write">Write</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAPIDialog(false)} sx={{ color: 'grey.400' }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateAPIKey}
            variant="contained"
            sx={{
              backgroundColor: '#00ff88',
              color: '#000',
              '&:hover': { backgroundColor: '#00cc6a' }
            }}
            disabled={!newAPIKey.name || newAPIKey.permissions.length === 0}
          >
            Generate Key
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Settings;