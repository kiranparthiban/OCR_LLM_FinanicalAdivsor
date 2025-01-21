import React, { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  IconButton,
  LinearProgress,
  Paper,
  styled,
  Container,
  Stack,
  Grid,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  ReceiptLong as ReceiptIcon,
  Chat as ChatIcon,
  Insights as InsightsIcon,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import axios from "axios";

const DragDropZone = styled(Paper)(({ theme, isDragging }) => ({
  border: "2px dashed",
  borderColor: isDragging ? theme.palette.primary.main : theme.palette.grey[300],
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(4),
  textAlign: "center",
  backgroundColor: isDragging
    ? theme.palette.action.hover
    : theme.palette.background.paper,
  transition: "all 0.3s ease-in-out",
  cursor: "pointer",
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover,
  },
}));

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
  },
}));

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const HomePage = () => {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [response, setResponse] = useState(null);

  const supportedFormats = ["image/jpeg", "image/png", "application/pdf"];

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const uploadedFile = e.dataTransfer.files[0];
    validateAndSetFile(uploadedFile);
  }, []);

  const handleFileChange = useCallback((e) => {
    const uploadedFile = e.target.files[0];
    validateAndSetFile(uploadedFile);
  }, []);

  const validateAndSetFile = (uploadedFile) => {
    if (!uploadedFile) return;

    if (!supportedFormats.includes(uploadedFile.type)) {
      setError(
        "Unsupported file format. Please upload a JPEG, PNG, or PDF file."
      );
      setFile(null);
      setImagePreview(null);
      return;
    }

    if (uploadedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      setFile(null);
      setImagePreview(null);
      return;
    }

    setFile(uploadedFile);
    setError(null);

    if (uploadedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(uploadedFile);
    } else {
      setImagePreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file before uploading");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setResponse(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post(
        "http://localhost:8000/api/ai/analyse/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setUploadProgress(progress);
          },
        }
      );

      setResponse(data.summary);
    } catch (err) {
      setError(
        err.response?.data?.error || "Error uploading file. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", pt: 8, pb: 8, px: 2 }}>
      <Container maxWidth="lg">
        <Stack spacing={6}>
          {/* Hero Section */}
          <Box textAlign="center">
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                backgroundClip: "text",
                textFillColor: "transparent",
                mb: 2,
              }}
            >
              OCR & LLM Powered Financial Guide
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
              Upload your bill to get insights from our AI financial advisor
            </Typography>
          </Box>

          {/* Features Section */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <FeatureCard elevation={2}>
                <ReceiptIcon sx={{ fontSize: 40, color: "primary.main" }} />
                <Typography variant="h6">Accurate Bill Analysis</Typography>
                <Typography color="text.secondary">
                  Our OCR technology extracts and summarizes important
                  information from your bills.
                </Typography>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FeatureCard elevation={2}>
                <InsightsIcon sx={{ fontSize: 40, color: "primary.main" }} />
                <Typography variant="h6">Actionable Insights</Typography>
                <Typography color="text.secondary">
                  Get a detailed breakdown of spending patterns and key insights
                  from your bills.
                </Typography>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FeatureCard elevation={2}>
                <ChatIcon sx={{ fontSize: 40, color: "primary.main" }} />
                <Typography variant="h6">AI-Powered Suggestions</Typography>
                <Typography color="text.secondary">
                  Personalized suggestions to optimize your finances and reduce
                  unnecessary expenses.
                </Typography>
              </FeatureCard>
            </Grid>
          </Grid>

          {/* Upload Section */}
          <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
            <Card elevation={3} sx={{ width: "100%", maxWidth: 600, p: 2, pt: 3 }}>
              <CardContent>
                <DragDropZone
                  isDragging={isDragging}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  elevation={0}
                >
                  <ReceiptIcon
                    sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Upload Your Bill
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    gutterBottom
                  >
                    Drag and drop your bill here, or click to select
                  </Typography>
                  <label htmlFor="file-upload">
                    <Button
                      variant="contained"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      sx={{ mt: 2 }}
                    >
                      Select Bill
                    </Button>
                  </label>
                  <VisuallyHiddenInput
                    id="file-upload"
                    type="file"
                    accept=".pdf,image/jpeg,image/png"
                    onChange={handleFileChange}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: "block" }}
                  >
                    Supported formats: PDF, PNG, JPG (up to 5MB)
                  </Typography>
                </DragDropZone>

                {file && (
                  <Paper sx={{ mt: 2, p: 2 }} variant="outlined">
                    {imagePreview && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mb: 2,
                        }}
                      >
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{ maxWidth: "100%", height: "auto" }}
                        />
                      </Box>
                    )}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <ReceiptIcon color="primary" />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" noWrap>
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => setFile(null)}>
                        <CloseIcon />
                      </IconButton>
                    </Box>
                    {isUploading && (
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={uploadProgress}
                        />
                      </Box>
                    )}
                  </Paper>
                )}

                {error && (
                  <Alert
                    severity="error"
                    sx={{ mt: 2 }}
                    onClose={() => setError(null)}
                  >
                    {error}
                  </Alert>
                )}

                {response && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="h6">Financial Summary:</Typography>
                    <ReactMarkdown>{response}</ReactMarkdown>
                  </Alert>
                )}
              </CardContent>
              <CardActions>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  startIcon={isUploading ? null : <CloudUploadIcon />}
                >
                  {isUploading ? (
                    <>Processing Bill ({uploadProgress}%)</>
                  ) : (
                    "Analyze Bill"
                  )}
                </Button>
              </CardActions>
            </Card>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default HomePage;
