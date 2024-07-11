import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Typography, Button, Container, Card, CardContent, Box, CardActions, Grid } from "@mui/material";

function Home() {
  const [username, setUsername] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      // get access token
      const token = localStorage.getItem("token"); // Example token retrieval

      if (token) {
        const response = await fetch("http://localhost:3002/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setUsername(data.username);
        }
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    // Handle logout logic, e.g., clearing tokens, etc.
    localStorage.removeItem("token"); // Example token removal
    navigate("/logout");
  };

  return (
    <Container maxWidth="sm">
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
        <Grid item xs={12}>
          <Box mt={8}>
            <Card>
              <CardContent>
                <Typography variant="h2" gutterBottom align="center">
                  Home
                </Typography>
                {username ? (
                  <>
                    <Typography variant="h6" align="center">Welcome, {username}!</Typography>
                    <CardActions>
                      <Button variant="contained" color="secondary" onClick={handleLogout} fullWidth>
                        Logout
                      </Button>
                    </CardActions>
                  </>
                ) : (
                  <Typography variant="h6" align="center">
                    Please{" "}
                    <Button component={Link} to="/login" variant="contained" color="primary" sx={{ mx: 1 }}>
                      login
                    </Button>{" "}
                    or{" "}
                    <Button component={Link} to="/register" variant="contained" color="secondary" sx={{ mx: 1 }}>
                      register
                    </Button>.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Home;