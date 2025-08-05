import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Description as PdfIcon,
  Image as ImageIcon,
  FilePresent as FileIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  PictureAsPdf as PdfViewIcon,
  PhotoCamera as CameraIcon
} from '@mui/icons-material';
import { expenseAPI } from '../services/api';

const AttachmentViewer = ({ expenseId, attachments = [], onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [attachmentList, setAttachmentList] = useState(Array.isArray(attachments) ? attachments : []);

  // Fetch attachments if not provided
  useEffect(() => {
    if (!Array.isArray(attachments) || attachments.length === 0) {
      if (expenseId) {
        fetchAttachments();
      } else {
        setAttachmentList([]);
      }
    } else {
      setAttachmentList(attachments);
    }
  }, [expenseId, attachments]);

  const fetchAttachments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await expenseAPI.getAttachments(expenseId);
      if (response.data.success) {
        setAttachmentList(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
      setError('Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (attachment) => {
    try {
      const response = await expenseAPI.downloadAttachment(expenseId, attachment._id);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: attachment.mimetype });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      setError('Failed to download file');
    }
  };

  const handlePreview = (attachment) => {
    setSelectedAttachment(attachment);
    setPreviewOpen(true);
    
    // If no expenseId (local preview), convert file to data URL
    if (!expenseId && attachment.file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedAttachment(prev => ({
          ...prev,
          dataUrl: e.target.result
        }));
      };
      reader.readAsDataURL(attachment.file);
    }
  };

  const getFileIcon = (mimetype) => {
    if (!mimetype) return <FileIcon />;
    if (mimetype.includes('pdf')) return <PdfIcon />;
    if (mimetype.includes('image')) return <ImageIcon />;
    return <FileIcon />;
  };

  const getFileType = (mimetype) => {
    if (!mimetype) return 'Document';
    if (mimetype.includes('pdf')) return 'PDF';
    if (mimetype.includes('image')) return 'Image';
    if (mimetype.includes('document') || mimetype.includes('word')) return 'Document';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'Spreadsheet';
    if (mimetype.includes('text')) return 'Text';
    if (mimetype.includes('zip') || mimetype.includes('rar')) return 'Archive';
    return 'File';
  };

  const getFileExtension = (filename) => {
    const ext = filename.split('.').pop().toUpperCase();
    return ext || 'Unknown';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (attachmentList.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 3, color: 'text.secondary' }}>
        <FileIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
        <Typography variant="h6" gutterBottom>
          No Attachments
        </Typography>
        <Typography variant="body2">
          No files have been uploaded for this expense.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Attachments ({attachmentList.length})
        </Typography>
        <Chip 
          label={`Total: ${formatFileSize(Array.isArray(attachmentList) ? attachmentList.reduce((sum, att) => sum + (att.size || 0), 0) : 0)}`}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* Attachments Grid */}
      <Grid container spacing={2}>
        {Array.isArray(attachmentList) ? attachmentList.map((attachment, index) => (
          <Grid item xs={12} sm={6} md={4} key={attachment._id || index}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4,
                  '& .attachment-actions': {
                    opacity: 1
                  }
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                {/* File Icon and Type */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    bgcolor: (attachment.mimetype && attachment.mimetype.includes('pdf')) ? '#ff4444' : 
                             (attachment.mimetype && attachment.mimetype.includes('image')) ? '#4caf50' : '#2196f3',
                    color: 'white',
                    mr: 1
                  }}>
                    {getFileIcon(attachment.mimetype)}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {attachment.originalName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getFileType(attachment.mimetype)} • {formatFileSize(attachment.size)}
                    </Typography>
                  </Box>
                </Box>

                {/* File Details */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Uploaded: {formatDate(attachment.uploadDate)}
                  </Typography>
                  {attachment.isReceipt && (
                    <Chip 
                      label="Receipt" 
                      size="small" 
                      color="success" 
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>

                {/* Actions */}
                <Box 
                  className="attachment-actions"
                  sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    opacity: 0.7,
                    transition: 'opacity 0.2s ease-in-out'
                  }}
                >
                  <Tooltip title="Preview">
                    <IconButton 
                      size="small" 
                      onClick={() => handlePreview(attachment)}
                      sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Download">
                    <IconButton 
                      size="small" 
                      onClick={() => handleDownload(attachment)}
                      sx={{ 
                        bgcolor: 'success.main', 
                        color: 'white',
                        '&:hover': { bgcolor: 'success.dark' }
                      }}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )) : null}
      </Grid>

      {/* Preview Dialog */}
             <Dialog 
         open={previewOpen} 
         onClose={() => setPreviewOpen(false)} 
         maxWidth="xl" 
         fullWidth
         PaperProps={{
           sx: {
             height: '90vh',
             display: 'flex',
             flexDirection: 'column'
           }
         }}
       >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedAttachment && getFileIcon(selectedAttachment.mimetype)}
            <Typography variant="h6">
              {selectedAttachment?.originalName}
            </Typography>
          </Box>
          <IconButton onClick={() => setPreviewOpen(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ flexGrow: 1, p: 0 }}>
          {selectedAttachment && (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                             {/* File Info */}
               <Box sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.05)' }}>
                 <Grid container spacing={1}>
                   <Grid item xs={6}>
                     <Typography variant="caption" color="text.secondary">Size:</Typography>
                     <Typography variant="body2">{formatFileSize(selectedAttachment.size)}</Typography>
                   </Grid>
                   <Grid item xs={6}>
                     <Typography variant="caption" color="text.secondary">Type:</Typography>
                     <Typography variant="body2">
                       {selectedAttachment.isReceipt ? 'Receipt' : `${getFileType(selectedAttachment.mimetype)} Document`}
                     </Typography>
                   </Grid>
                 </Grid>
               </Box>

              <Divider />

                             {/* File Preview */}
               <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                 {(selectedAttachment.mimetype && selectedAttachment.mimetype.includes('pdf')) ? (
                   <iframe
                     src={expenseId ? `http://localhost:5001/api/expenses/${expenseId}/attachments/${selectedAttachment._id}/download` : 
                          selectedAttachment.dataUrl}
                     width="100%"
                     height="100%"
                     style={{ 
                       border: 'none', 
                       width: '100%', 
                       height: '100%',
                       minHeight: '500px'
                     }}
                     title={selectedAttachment.originalName}
                     onError={(e) => {
                       console.error('PDF preview failed:', e);
                     }}
                   />
                 ) : (selectedAttachment.mimetype && selectedAttachment.mimetype.includes('image')) ? (
                   <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                     <img
                       src={expenseId ? `http://localhost:5001/api/expenses/${expenseId}/attachments/${selectedAttachment._id}/download` : 
                            selectedAttachment.dataUrl}
                       alt={selectedAttachment.originalName}
                       style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                       onError={(e) => {
                         console.error('Image preview failed:', e);
                         e.target.style.display = 'none';
                         if (e.target.nextSibling) {
                           e.target.nextSibling.style.display = 'flex';
                         }
                       }}
                     />
                     <Box sx={{
                       display: 'none',
                       flexDirection: 'column',
                       alignItems: 'center',
                       justifyContent: 'center',
                       height: '100%',
                       color: 'text.secondary',
                       p: 3
                     }}>
                       <ImageIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                       <Typography variant="h6" gutterBottom>
                         Image Preview Failed
                       </Typography>
                       <Typography variant="body2" textAlign="center" sx={{ mb: 2 }}>
                         Unable to load image preview. Please download to view.
                       </Typography>
                       <Button
                         variant="contained"
                         color="primary"
                         onClick={() => selectedAttachment && handleDownload(selectedAttachment)}
                         startIcon={<DownloadIcon />}
                       >
                         Download Image
                       </Button>
                     </Box>
                   </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '100%',
                    color: 'text.secondary'
                  }}>
                    <FileIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" gutterBottom>
                      Preview Not Available
                    </Typography>
                    <Typography variant="body2" textAlign="center">
                      This file type cannot be previewed. Please download to view.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        
                 <DialogActions sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.05)' }}>
           <Button onClick={() => setPreviewOpen(false)}>
             Close
           </Button>
         </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttachmentViewer; 