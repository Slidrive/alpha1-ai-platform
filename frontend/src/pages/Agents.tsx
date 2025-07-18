import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Paper,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab
} from '@mui/material';
import {
  Send as SendIcon,
  Upload as UploadIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Code as CodeIcon,
  BugReport as BugIcon,
  CloudUpload as CloudIcon,
  Description as DocIcon,
  Campaign as MarketingIcon,
  School as TrainerIcon,
  Engineering as DevOpsIcon,
  Psychology as AIIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';

interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  status: string;
  version: string;
  last_updated: string;
}

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: string;
  agent_name?: string;
}

interface Conversation {
  id: string;
  session_id: string;
  user_message: string;
  agent_response: string;
  timestamp: string;
  agent: string;
}

const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAgent, setUploadAgent] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/agents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }

      const data = await response.json();
      setAgents(data.agents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case 'project-manager': return <PersonIcon />;
      case 'developer': return <CodeIcon />;
      case 'tester': return <BugIcon />;
      case 'devops': return <DevOpsIcon />;
      case 'fine-tuning': return <AIIcon />;
      case 'documentation': return <DocIcon />;
      case 'marketing': return <MarketingIcon />;
      case 'trainer': return <TrainerIcon />;
      default: return <BotIcon />;
    }
  };

  const getAgentColor = (agentId: string) => {
    const colors: { [key: string]: string } = {
      'project-manager': '#2196F3',
      'developer': '#4CAF50',
      'tester': '#FF9800',
      'devops': '#9C27B0',
      'fine-tuning': '#E91E63',
      'documentation': '#00BCD4',
      'marketing': '#FF5722',
      'trainer': '#795548'
    };
    return colors[agentId] || '#607D8B';
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
    setMessages([]);
    setSessionId('');
    setChatOpen(true);
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !selectedAgent || chatLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setChatLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/agents/${selectedAgent.id}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: currentMessage,
          session_id: sessionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      if (!sessionId) {
        setSessionId(data.session_id);
      }

      const agentMessage: Message = {
        id: data.conversation_id,
        type: 'agent',
        content: data.response,
        timestamp: data.timestamp,
        agent_name: selectedAgent.name
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (err) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'agent',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date().toISOString(),
        agent_name: selectedAgent.name
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !uploadAgent) return;

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('agent_id', uploadAgent);
    formData.append('file_type', 'knowledge');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/agents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      alert('File uploaded successfully!');
      setUploadOpen(false);
      setUploadFile(null);
      setUploadAgent('');
    } catch (err) {
      alert('Failed to upload file. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={fetchAgents} sx={{ mt: 2 }}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom sx={{ color: '#00ff41', fontWeight: 'bold' }}>
        🤖 AI Agent Command Center
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom sx={{ color: '#888', mb: 3 }}>
        Select an AI agent to start collaborating on your projects
      </Typography>

      <Grid container spacing={3}>
        {agents.map((agent) => (
          <Grid item xs={12} sm={6} md={4} key={agent.id}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 25px ${getAgentColor(agent.id)}40`
                },
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                border: `1px solid ${getAgentColor(agent.id)}30`
              }}
              onClick={() => handleAgentSelect(agent)}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar 
                    sx={{ 
                      bgcolor: getAgentColor(agent.id), 
                      mr: 2,
                      width: 48,
                      height: 48
                    }}
                  >
                    {getAgentIcon(agent.id)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                      {agent.name}
                    </Typography>
                    <Chip 
                      label={agent.status} 
                      size="small" 
                      sx={{ 
                        bgcolor: agent.status === 'active' ? '#4CAF50' : '#FF9800',
                        color: '#fff'
                      }} 
                    />
                  </Box>
                </Box>
                
                <Typography variant="body2" sx={{ color: '#ccc', mb: 2 }}>
                  {agent.description}
                </Typography>
                
                <Typography variant="caption" sx={{ color: '#888' }}>
                  Capabilities:
                </Typography>
                <Box mt={1}>
                  {agent.capabilities.slice(0, 3).map((capability, index) => (
                    <Chip
                      key={index}
                      label={capability}
                      size="small"
                      sx={{ 
                        mr: 0.5, 
                        mb: 0.5, 
                        bgcolor: `${getAgentColor(agent.id)}20`,
                        color: getAgentColor(agent.id),
                        fontSize: '0.7rem'
                      }}
                    />
                  ))}
                  {agent.capabilities.length > 3 && (
                    <Chip
                      label={`+${agent.capabilities.length - 3} more`}
                      size="small"
                      sx={{ 
                        mr: 0.5, 
                        mb: 0.5, 
                        bgcolor: '#333',
                        color: '#888',
                        fontSize: '0.7rem'
                      }}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Upload FAB */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setUploadOpen(true)}
      >
        <UploadIcon />
      </Fab>

      {/* Chat Dialog */}
      <Dialog 
        open={chatOpen} 
        onClose={() => setChatOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '80vh',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#fff', 
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center'
        }}>
          {selectedAgent && (
            <>
              <Avatar sx={{ bgcolor: getAgentColor(selectedAgent.id), mr: 2 }}>
                {getAgentIcon(selectedAgent.id)}
              </Avatar>
              Chat with {selectedAgent.name}
            </>
          )}
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {messages.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" sx={{ color: '#888' }}>
                  Start a conversation with {selectedAgent?.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                  Ask questions, request help, or collaborate on your projects
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {messages.map((message) => (
                  <ListItem key={message.id} sx={{ 
                    flexDirection: 'column', 
                    alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                    px: 0
                  }}>
                    <Paper
                      sx={{
                        p: 2,
                        maxWidth: '80%',
                        bgcolor: message.type === 'user' 
                          ? (selectedAgent ? getAgentColor(selectedAgent.id) : '#2196F3')
                          : '#333',
                        color: '#fff',
                        borderRadius: message.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
                      }}
                    >
                      <Typography variant="body1">
                        {message.content}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#ccc', mt: 1, display: 'block' }}>
                        {message.type === 'user' ? 'You' : message.agent_name} • {new Date(message.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Paper>
                  </ListItem>
                ))}
                {chatLoading && (
                  <ListItem sx={{ justifyContent: 'flex-start' }}>
                    <Paper sx={{ p: 2, bgcolor: '#333', borderRadius: '18px 18px 18px 4px' }}>
                      <CircularProgress size={20} sx={{ color: '#00ff41' }} />
                      <Typography variant="body2" sx={{ color: '#ccc', ml: 1, display: 'inline' }}>
                        {selectedAgent?.name} is typing...
                      </Typography>
                    </Paper>
                  </ListItem>
                )}
              </List>
            )}
            <div ref={messagesEndRef} />
          </Box>
          
          <Divider sx={{ bgcolor: '#333' }} />
          
          <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': { borderColor: '#555' },
                  '&:hover fieldset': { borderColor: '#777' },
                  '&.Mui-focused fieldset': { borderColor: selectedAgent ? getAgentColor(selectedAgent.id) : '#2196F3' }
                }
              }}
            />
            <IconButton 
              onClick={sendMessage}
              disabled={!currentMessage.trim() || chatLoading}
              sx={{ 
                color: selectedAgent ? getAgentColor(selectedAgent.id) : '#2196F3',
                '&:disabled': { color: '#555' }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Knowledge Base File</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Agent</InputLabel>
              <Select
                value={uploadAgent}
                onChange={(e) => setUploadAgent(e.target.value)}
                label="Select Agent"
              >
                {agents.map((agent) => (
                  <MenuItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudIcon />}
              sx={{ mb: 2 }}
            >
              Choose File
              <input
                type="file"
                hidden
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                accept=".txt,.pdf,.doc,.docx,.md"
              />
            </Button>
            
            {uploadFile && (
              <Typography variant="body2" sx={{ color: '#666' }}>
                Selected: {uploadFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleFileUpload}
            disabled={!uploadFile || !uploadAgent}
            variant="contained"
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Agents;