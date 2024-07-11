import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Box, Snackbar } from "@mui/material";
import MuiAlert from '@mui/material/Alert';
import APIService from '../services/APIService';

function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const data = await APIService.request("/login", "POST", { username, password });
      localStorage.setItem("token", data.token);
      navigate("/profile"); // Navigate to UserProfile on successful login
    } catch (error: any) {
      if (error.message === "Please update your client application.") {
        setUpdateMessage(error.message);
      } else {
        setErrorMessage(error.message || "Login failed");
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={8}>
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        {errorMessage && (
          <Typography color="error" gutterBottom>
            {errorMessage}
          </Typography>
        )}
        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleLogin}
        >
          Login
        </Button>
        <Snackbar open={!!updateMessage} autoHideDuration={6000} onClose={() => setUpdateMessage(null)}>
          <MuiAlert elevation={6} variant="filled" onClose={() => setUpdateMessage(null)} severity="warning">
            {updateMessage}</MuiAlert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default Login;