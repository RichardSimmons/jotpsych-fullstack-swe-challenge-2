import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Typography, Box } from "@mui/material";

function Register() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<string>("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    const requestBody: any = { username, password };
    if (profilePicture.trim()) {
      requestBody.profilePicture = profilePicture;
    }

    const response = await fetch("http://localhost:3002/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      navigate("/login");
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={8}>
        <Typography variant="h4" gutterBottom>
          Register
        </Typography>
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
        <TextField
          label="Profile Picture URL (Optional)"
          fullWidth
          margin="normal"
          value={profilePicture}
          onChange={(e) => setProfilePicture(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleRegister} fullWidth>
          Register
        </Button>
      </Box>
    </Container>
  );
}

export default Register;