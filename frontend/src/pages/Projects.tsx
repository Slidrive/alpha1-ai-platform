import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../store';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Avatar,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add,
  PlayArrow,
  Pause,
  Stop,
  Settings,
  Code,
  Analytics,
  CloudUpload
} from '@mui/icons-material';
import { 
  fetchProjects, 
  createProject, 
  updateProject,
  selectProjects,
  selectProjectsLoading,
  selectProjectsError,
  selectCreateLoading,
  Project
} from '../store/slices/projectSlice';

const Projects: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const projects = useSelector(selectProjects);
  const loading = useSelector(selectProjectsLoading);
  const error = useSelector(selectProjectsError);
  const createLoading = useSelector(selectCreateLoading);
  
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    type: 'ai-model' as Project['type']
  });

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'info';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: Project['type']) => {
    switch (type) {
      case 'ai-model': return <Analytics />;
      case 'data-processing': return <CloudUpload />;
      case 'web-app': return <Code />;
      case 'api': return <Settings />;
      default: return <Code />;
    }
  };

  const handleCreateProject = async () => {
    if (!newProject.name || !newProject.description) return;
    
    try {
      await dispatch(createProject({
        name: newProject.name,
        description: newProject.description,
        type: newProject.type
      }));
      
      setCreateDialogOpen(false);
      setNewProject({ name: '', description: '', type: 'ai-model' });
      
      // Refresh projects list
      dispatch(fetchProjects());
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleProjectAction = async (projectId: number, action: 'play' | 'pause' | 'stop') => {
    let newStatus: string;
    switch (action) {
      case 'play':
        newStatus = 'active';
        break;
      case 'pause':
        newStatus = 'paused';
        break;
      case 'stop':
        newStatus = 'completed';
        break;
      default:
        return;
    }
    
    try {
      await dispatch(updateProject({
        id: projectId,
        status: newStatus
      }));
      
      // Refresh projects list
      dispatch(fetchProjects());
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays === 1) return '1 day ago';
      return `${diffDays} days ago`;
    };
    
    return (
      <Card sx={{ 
        height: '100%', 
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '1px solid #333',
        '&:hover': {
          border: '1px solid #00ff88',
          transform: 'translateY(-2px)',
          transition: 'all 0.3s ease'
        }
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar sx={{ bgcolor: '#00ff88', width: 32, height: 32 }}>
                {getTypeIcon(project.type as any)}
              </Avatar>
              <Box>
                <Typography variant="h6" color="white" fontWeight="bold">
                  {project.name}
                </Typography>
                <Chip 
                  label={project.status.toUpperCase()} 
                  color={getStatusColor(project.status as any)}
                  size="small"
                />
              </Box>
            </Box>
            <Box display="flex" gap={1}>
              <IconButton 
                size="small" 
                onClick={() => handleProjectAction(project.id, 'play')}
                sx={{ color: '#00ff88' }}
              >
                <PlayArrow />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => handleProjectAction(project.id, 'pause')}
                sx={{ color: '#ffe66d' }}
              >
                <Pause />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={() => handleProjectAction(project.id, 'stop')}
                sx={{ color: '#ff6b6b' }}
              >
                <Stop />
              </IconButton>
            </Box>
          </Box>

          <Typography variant="body2" color="grey.300" mb={2}>
            {project.description}
          </Typography>

          <Box mb={2}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2" color="grey.400">
                Progress
              </Typography>
              <Typography variant="body2" color="white">
                {project.progress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={project.progress}
              sx={{
                backgroundColor: '#333',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#00ff88'
                }
              }}
            />
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" gap={2}>
              {project.ai_models > 0 && (
                <Typography variant="body2" color="#4ecdc4">
                  {project.ai_models} AI Models
                </Typography>
              )}
              {project.data_points > 0 && (
                <Typography variant="body2" color="#ffe66d">
                  {project.data_points.toLocaleString()} Data Points
                </Typography>
              )}
            </Box>
            <Typography variant="body2" color="grey.400">
              {formatDate(project.updated_at)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading && projects.length === 0) {
    return (
      <Box sx={{ p: 3, backgroundColor: '#0a0a0a', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#00ff88' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => dispatch(fetchProjects())}
          sx={{
            backgroundColor: '#00ff88',
            color: '#000',
            '&:hover': {
              backgroundColor: '#00cc6a'
            }
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" color="white" fontWeight="bold">
          Projects
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
          disabled={createLoading}
          sx={{
            backgroundColor: '#00ff88',
            color: '#000',
            '&:hover': {
              backgroundColor: '#00cc6a'
            }
          }}
        >
          {createLoading ? <CircularProgress size={20} sx={{ color: '#000' }} /> : 'New Project'}
        </Button>
      </Box>

      {/* Project Statistics */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a2e', color: 'white', textAlign: 'center' }}>
            <Typography variant="h3" color="#00ff88" fontWeight="bold">
              {projects.length}
            </Typography>
            <Typography variant="body2" color="grey.400">
              Total Projects
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a2e', color: 'white', textAlign: 'center' }}>
            <Typography variant="h3" color="#4ecdc4" fontWeight="bold">
              {projects.filter(p => p.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="grey.400">
              Active Projects
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a2e', color: 'white', textAlign: 'center' }}>
            <Typography variant="h3" color="#4ecdc4" fontWeight="bold">
              {projects.reduce((sum, p) => sum + p.data_points, 0).toLocaleString()}
            </Typography>
            <Typography variant="body2" color="grey.400">
              Data Points
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 2, backgroundColor: '#1a1a2e', color: 'white', textAlign: 'center' }}>
            <Typography variant="h3" color="#ff6b6b" fontWeight="bold">
              {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)}%
            </Typography>
            <Typography variant="body2" color="grey.400">
              Avg Progress
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <ProjectCard project={project} />
          </Grid>
        ))}
      </Grid>

      {/* Create Project Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a1a2e',
            color: 'white'
          }
        }}
      >
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Name"
            fullWidth
            variant="outlined"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
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
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
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
            <InputLabel sx={{ color: 'grey.400' }}>Project Type</InputLabel>
            <Select
              value={newProject.type}
              onChange={(e) => setNewProject({ ...newProject, type: e.target.value as Project['type'] })}
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#00ff88' }
              }}
            >
              <MenuItem value="ai-model">AI Model</MenuItem>
              <MenuItem value="data-processing">Data Processing</MenuItem>
              <MenuItem value="web-app">Web Application</MenuItem>
              <MenuItem value="api">API Service</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ color: 'grey.400' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateProject}
            variant="contained"
            sx={{
              backgroundColor: '#00ff88',
              color: '#000',
              '&:hover': { backgroundColor: '#00cc6a' }
            }}
            disabled={!newProject.name || !newProject.description}
          >
            Create Project
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;