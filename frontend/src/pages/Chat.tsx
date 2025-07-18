import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  List,
  ListItem,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
  Fade,
  Slide,
  Button,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Code as CodeIcon,
  BugReport as BugIcon,
  CloudUpload as CloudIcon,
  Description as DocIcon,
  Campaign as MarketingIcon,
  School as TrainerIcon,
  Engineering as DevOpsIcon,
  Psychology as AIIcon,
  MoreVert as MoreIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  status: 'active' | 'busy' | 'idle';
  version: string;
  last_updated: string;
}

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: string;
  agent_id?: string;
  agent_name?: string;
}

interface AgentActivity {
  id: string;
  agent_id: string;
  agent_name: string;
  activity: string;
  status: 'thinking' | 'processing' | 'collaborating' | 'completed';
  progress?: number;
  timestamp: string;
  details?: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchAgents();
    // Simulate real-time agent activities
    const interval = setInterval(() => {
      simulateAgentActivity();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5001/api/agents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
        // Auto-select project manager initially
        if (data.agents?.length > 0) {
          setSelectedAgents(['project-manager']);
        }
      }
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    } finally {
      setLoading(false);
    }
  };

  const simulateAgentActivity = () => {
    const activities = [
      'Analyzing code structure',
      'Reviewing documentation',
      'Planning test scenarios',
      'Optimizing deployment pipeline',
      'Generating marketing content',
      'Training model parameters',
      'Collaborating with team',
      'Processing user request'
    ];

    const statuses: AgentActivity['status'][] = ['thinking', 'processing', 'collaborating'];
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    
    if (randomAgent && selectedAgents.includes(randomAgent.id)) {
      const newActivity: AgentActivity = {
        id: Date.now().toString(),
        agent_id: randomAgent.id,
        agent_name: randomAgent.name,
        activity: activities[Math.floor(Math.random() * activities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        progress: Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString()
      };

      setAgentActivities(prev => {
        const filtered = prev.filter(a => a.agent_id !== randomAgent.id);
        return [newActivity, ...filtered].slice(0, 10);
      });

      // Complete activity after some time
      setTimeout(() => {
        setAgentActivities(prev => 
          prev.map(a => 
            a.id === newActivity.id 
              ? { ...a, status: 'completed' as const, progress: 100 }
              : a
          )
        );
      }, 5000);
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

  const getStatusColor = (status: AgentActivity['status']) => {
    switch (status) {
      case 'thinking': return '#FFC107';
      case 'processing': return '#2196F3';
      case 'collaborating': return '#4CAF50';
      case 'completed': return '#8BC34A';
      default: return '#9E9E9E';
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || chatLoading || selectedAgents.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setChatLoading(true);

    // Simulate agent collaboration
    selectedAgents.forEach((agentId, index) => {
      setTimeout(() => {
        const agent = agents.find(a => a.id === agentId);
        if (agent) {
          const activity: AgentActivity = {
            id: `${Date.now()}-${index}`,
            agent_id: agentId,
            agent_name: agent.name,
            activity: 'Processing your request',
            status: 'processing',
            progress: 0,
            timestamp: new Date().toISOString()
          };
          setAgentActivities(prev => [activity, ...prev.slice(0, 9)]);
        }
      }, index * 500);
    });

    try {
      const token = localStorage.getItem('token');
      const primaryAgent = selectedAgents[0];
      const response = await fetch(`http://localhost:5001/api/agents/${primaryAgent}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: currentMessage,
          session_id: sessionId,
          collaborating_agents: selectedAgents
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (!sessionId) {
          setSessionId(data.session_id);
        }

        const agentMessage: Message = {
          id: data.conversation_id || Date.now().toString(),
          type: 'agent',
          content: data.response,
          timestamp: data.timestamp || new Date().toISOString(),
          agent_id: primaryAgent,
          agent_name: agents.find(a => a.id === primaryAgent)?.name
        };

        setMessages(prev => [...prev, agentMessage]);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'agent',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date().toISOString(),
        agent_name: 'System'
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

  const toggleAgent = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#0a0a0a' }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          bgcolor: '#1a1a1a', 
          borderBottom: '1px solid #333',
          borderRadius: 0
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <GroupIcon sx={{ color: '#00ff41', mr: 2, fontSize: 28 }} />
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 'bold' }}>
              AI Collaboration Hub
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Chip 
              label={`${selectedAgents.length} agents active`} 
              sx={{ bgcolor: '#00ff41', color: '#000', fontWeight: 'bold' }}
            />
            <IconButton 
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{ color: '#fff' }}
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      <Grid container sx={{ flex: 1, overflow: 'hidden' }}>
        {/* Main Chat Area */}
        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Agent Selection */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: '#1a1a1a', 
              borderBottom: '1px solid #333',
              borderRadius: 0
            }}
          >
            <Typography variant="subtitle2" sx={{ color: '#888', mb: 1 }}>
              Active Agents:
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {agents.map((agent) => (
                <Chip
                  key={agent.id}
                  avatar={
                    <Avatar sx={{ bgcolor: getAgentColor(agent.id), width: 24, height: 24 }}>
                      {getAgentIcon(agent.id)}
                    </Avatar>
                  }
                  label={agent.name}
                  onClick={() => toggleAgent(agent.id)}
                  sx={{
                    bgcolor: selectedAgents.includes(agent.id) 
                      ? `${getAgentColor(agent.id)}30` 
                      : '#333',
                    color: selectedAgents.includes(agent.id) 
                      ? getAgentColor(agent.id) 
                      : '#888',
                    border: selectedAgents.includes(agent.id) 
                      ? `1px solid ${getAgentColor(agent.id)}` 
                      : '1px solid #555',
                    '&:hover': {
                      bgcolor: `${getAgentColor(agent.id)}20`
                    }
                  }}
                />
              ))}
            </Box>
          </Paper>

          {/* Messages Area */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#0a0a0a' }}>
            {messages.length === 0 ? (
              <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                justifyContent="center" 
                height="100%"
                textAlign="center"
              >
                <BotIcon sx={{ fontSize: 64, color: '#333', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#666', mb: 1 }}>
                  Welcome to AI Collaboration Hub
                </Typography>
                <Typography variant="body2" sx={{ color: '#888' }}>
                  Select agents above and start collaborating on your projects
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                {messages.map((message) => (
                  <Fade key={message.id} in timeout={500}>
                    <ListItem 
                      sx={{ 
                        flexDirection: 'column', 
                        alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
                        px: 0,
                        mb: 2
                      }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          maxWidth: '80%',
                          bgcolor: message.type === 'user' 
                            ? '#00ff41' 
                            : '#1a1a1a',
                          color: message.type === 'user' ? '#000' : '#fff',
                          borderRadius: message.type === 'user' 
                            ? '20px 20px 4px 20px' 
                            : '20px 20px 20px 4px',
                          border: message.type === 'agent' ? '1px solid #333' : 'none'
                        }}
                      >
                        {message.type === 'agent' && message.agent_name && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: message.agent_id ? getAgentColor(message.agent_id) : '#00ff41',
                              fontWeight: 'bold',
                              display: 'block',
                              mb: 1
                            }}
                          >
                            {message.agent_name}
                          </Typography>
                        )}
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {message.content}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: message.type === 'user' ? '#000' : '#666',
                            mt: 1, 
                            display: 'block',
                            opacity: 0.7
                          }}
                        >
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </ListItem>
                  </Fade>
                ))}
                {chatLoading && (
                  <ListItem sx={{ justifyContent: 'flex-start', px: 0 }}>
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        bgcolor: '#1a1a1a', 
                        borderRadius: '20px 20px 20px 4px',
                        border: '1px solid #333',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <CircularProgress size={16} sx={{ color: '#00ff41' }} />
                      <Typography variant="body2" sx={{ color: '#888' }}>
                        Agents are collaborating...
                      </Typography>
                    </Paper>
                  </ListItem>
                )}
              </List>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              bgcolor: '#1a1a1a', 
              borderTop: '1px solid #333',
              borderRadius: 0
            }}
          >
            <Box display="flex" gap={1} alignItems="flex-end">
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message to collaborate with AI agents..."
                variant="outlined"
                disabled={selectedAgents.length === 0}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    bgcolor: '#0a0a0a',
                    borderRadius: '20px',
                    '& fieldset': { borderColor: '#333' },
                    '&:hover fieldset': { borderColor: '#555' },
                    '&.Mui-focused fieldset': { borderColor: '#00ff41' }
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#666'
                  }
                }}
              />
              <IconButton 
                onClick={sendMessage}
                disabled={!currentMessage.trim() || chatLoading || selectedAgents.length === 0}
                sx={{ 
                  bgcolor: '#00ff41',
                  color: '#000',
                  '&:hover': { bgcolor: '#00cc33' },
                  '&:disabled': { bgcolor: '#333', color: '#666' },
                  width: 48,
                  height: 48
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
            {selectedAgents.length === 0 && (
              <Typography variant="caption" sx={{ color: '#888', mt: 1, display: 'block' }}>
                Select at least one agent to start collaborating
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Agent Collaboration Panel */}
        <Grid item xs={12} md={4} sx={{ borderLeft: '1px solid #333', height: '100%' }}>
          <Paper 
            elevation={0} 
            sx={{ 
              height: '100%', 
              bgcolor: '#1a1a1a', 
              borderRadius: 0,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Panel Header */}
            <Box 
              sx={{ 
                p: 2, 
                borderBottom: '1px solid #333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box display="flex" alignItems="center">
                <TimelineIcon sx={{ color: '#00ff41', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                  Agent Activity
                </Typography>
              </Box>
              <Tooltip title="Refresh">
                <IconButton 
                  size="small" 
                  onClick={simulateAgentActivity}
                  sx={{ color: '#888' }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Activity List */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
              {agentActivities.length === 0 ? (
                <Box 
                  display="flex" 
                  flexDirection="column" 
                  alignItems="center" 
                  justifyContent="center" 
                  height="100%"
                  textAlign="center"
                >
                  <TimelineIcon sx={{ fontSize: 48, color: '#333', mb: 2 }} />
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    No agent activity yet
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#888' }}>
                    Start a conversation to see agents collaborate
                  </Typography>
                </Box>
              ) : (
                agentActivities.map((activity) => (
                  <Slide key={activity.id} direction="down" in timeout={300}>
                    <Card 
                      sx={{ 
                        mb: 1, 
                        bgcolor: '#0a0a0a',
                        border: `1px solid ${getAgentColor(activity.agent_id)}30`
                      }}
                    >
                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <Avatar 
                            sx={{ 
                              bgcolor: getAgentColor(activity.agent_id), 
                              width: 24, 
                              height: 24, 
                              mr: 1 
                            }}
                          >
                            {getAgentIcon(activity.agent_id)}
                          </Avatar>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: getAgentColor(activity.agent_id),
                              fontWeight: 'bold',
                              flex: 1
                            }}
                          >
                            {activity.agent_name}
                          </Typography>
                          <Chip 
                            label={activity.status} 
                            size="small"
                            sx={{ 
                              bgcolor: `${getStatusColor(activity.status)}20`,
                              color: getStatusColor(activity.status),
                              fontSize: '0.6rem',
                              height: 20
                            }}
                          />
                        </Box>
                        
                        <Typography 
                          variant="body2" 
                          sx={{ color: '#ccc', mb: 1, fontSize: '0.8rem' }}
                        >
                          {activity.activity}
                        </Typography>
                        
                        {activity.progress !== undefined && activity.status !== 'completed' && (
                          <LinearProgress 
                            variant="determinate" 
                            value={activity.progress} 
                            sx={{
                              bgcolor: '#333',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: getStatusColor(activity.status)
                              }
                            }}
                          />
                        )}
                        
                        <Typography 
                          variant="caption" 
                          sx={{ color: '#666', display: 'block', mt: 1 }}
                        >
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Slide>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: { bgcolor: '#1a1a1a', border: '1px solid #333' }
        }}
      >
        <MenuItem onClick={() => setAnchorEl(null)} sx={{ color: '#fff' }}>
          <SettingsIcon sx={{ mr: 1 }} />
          Settings
        </MenuItem>
        <MenuItem onClick={() => { setMessages([]); setAnchorEl(null); }} sx={{ color: '#fff' }}>
          <RefreshIcon sx={{ mr: 1 }} />
          Clear Chat
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Chat;