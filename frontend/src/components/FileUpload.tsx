import React, { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
// Removed react-dropzone dependency for simpler implementation

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxFiles?: number;
  maxSize?: number;
  disabled?: boolean;
}

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  acceptedFileTypes = ['.txt', '.pdf', '.doc', '.docx', '.md', '.json'],
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => {
        const errorMessages = errors.map((e: any) => {
          switch (e.code) {
            case 'file-too-large':
              return `File "${file.name}" is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`;
            case 'file-invalid-type':
              return `File "${file.name}" has an invalid type. Accepted types: ${acceptedFileTypes.join(', ')}`;
            case 'too-many-files':
              return `Too many files. Maximum allowed: ${maxFiles}`;
            default:
              return `Error with file "${file.name}": ${e.message}`;
          }
        });
        return errorMessages.join(' ');
      });
      setError(errors.join(' '));
    }

    if (acceptedFiles.length > 0) {
      const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
        file,
        id: `${file.name}-${Date.now()}`,
        progress: 0,
        status: 'pending'
      }));

      setUploadedFiles(prev => [...prev, ...newFiles]);
      onFilesSelected(acceptedFiles);
    }
  }, [acceptedFileTypes, maxFiles, maxSize, onFilesSelected]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onDrop(files, []);
    }
  };

  const isDragActive = false; // Simplified for now

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileProgress = (fileId: string, progress: number, status: UploadedFile['status'], error?: string) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, progress, status, error } : f
    ));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'uploading': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Paper
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: 'grey.300',
          backgroundColor: 'background.paper',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: disabled ? 'grey.300' : 'primary.main',
            backgroundColor: disabled ? 'background.paper' : 'action.hover'
          }
        }}
      >
        <input 
          type="file" 
          multiple 
          accept={acceptedFileTypes.join(',')} 
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="file-upload-input"
          disabled={disabled}
        />
        <Box textAlign="center">
          <UploadIcon 
            sx={{ 
              fontSize: 48, 
              color: isDragActive ? 'primary.main' : 'grey.400',
              mb: 2 
            }} 
          />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            or click to select files
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Accepted formats: {acceptedFileTypes.join(', ')}
          </Typography>
          <br />
          <Typography variant="caption" color="textSecondary">
            Maximum file size: {formatFileSize(maxSize)}
          </Typography>
          {!disabled && (
            <Box mt={2}>
              <Button 
                variant="outlined" 
                component="label" 
                htmlFor="file-upload-input"
              >
                Choose Files
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {uploadedFiles.length > 0 && (
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            Uploaded Files ({uploadedFiles.length})
          </Typography>
          <List>
            {uploadedFiles.map((uploadedFile) => (
              <ListItem key={uploadedFile.id} divider>
                <FileIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1">
                        {uploadedFile.file.name}
                      </Typography>
                      <Chip 
                        label={uploadedFile.status} 
                        size="small" 
                        color={getStatusColor(uploadedFile.status) as any}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        {formatFileSize(uploadedFile.file.size)}
                      </Typography>
                      {uploadedFile.status === 'uploading' && (
                        <LinearProgress 
                          variant="determinate" 
                          value={uploadedFile.progress} 
                          sx={{ mt: 1 }}
                        />
                      )}
                      {uploadedFile.error && (
                        <Typography variant="caption" color="error">
                          {uploadedFile.error}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    onClick={() => removeFile(uploadedFile.id)}
                    disabled={uploadedFile.status === 'uploading'}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;