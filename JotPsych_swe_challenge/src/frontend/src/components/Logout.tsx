import React from "react";
import { Button, Container, Typography, Box, Card, CardContent, CardActions } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Handle logout logic, e.g., clearing tokens, etc.
    localStorage.removeItem("token"); // Example token removal
    navigate("/");
  };

  return (
    <Container maxWidth="sm">
      <Box mt={8}>
        <Card>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              Logout
            </Typography>
            <Typography variant="body1" gutterBottom>
              Are you sure you want to log out?
            </Typography>
          </CardContent>
          <CardActions>
            <Button variant="contained" color="secondary" onClick={handleLogout} fullWidth>
              Logout
            </Button>
          </CardActions>
        </Card>
      </Box>
    </Container>
  );
}

export default Logout;