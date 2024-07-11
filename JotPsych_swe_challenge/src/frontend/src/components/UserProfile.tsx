import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Container,
  Grid,
  Avatar,
  TextField,
  Box,
  Snackbar,
} from "@mui/material";
import MuiAlert from '@mui/material/Alert';
import APIService from '../services/APIService'; 
import AudioRecorder from "./AudioRecorder";

const UserProfile: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [motto, setMotto] = useState<string>("Your motto here...");
  const [newMotto, setNewMotto] = useState<string>("");
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await APIService.request("/user", "GET", null, true);
        setUsername(data.username);
        setMotto(data.motto || "Your motto here...");
      } catch (error: any) {
        if (error.message === "Please update your client application.") {
          setUpdateMessage(error.message);
        } else {
          navigate("/login");
        }
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/logout");
  };

  const handleMottoChange = async () => {
    try {
      await APIService.request("/update_motto", "POST", { motto: newMotto }, true);
      setMotto(newMotto);
      setNewMotto("");
    } catch (error: any) {
      console.error(error.message);
    }};

  const onTranscriptionUpload = (newTranscript: string) => {
    setMotto(newTranscript);
  };

  return (
    <Container
      maxWidth="sm"
      style={{ marginTop: "2rem", position: "relative", minHeight: "70vh" }}
    >
      <Grid container justifyContent="center" alignItems="center">
        <Avatar sx={{ width: 100, height: 100 }} />
      </Grid>
      <Typography variant="h4" gutterBottom align="center">
        {username}
      </Typography>
      <Typography variant="h6" gutterBottom align="center">
        {motto}
      </Typography>
      <TextField
        label="New Motto"
        fullWidth
        margin="normal"
        value={newMotto}
        onChange={(e) => setNewMotto(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleMottoChange} style={{ position: "absolute", bottom: 0, left: 0 }}>
        Update Motto
      </Button>
      <Button variant="contained" color="secondary" onClick={handleLogout} style={{ position: "absolute", bottom: 0, right: 0 }}>
        Logout
      </Button>
      <AudioRecorder onTranscriptionUpload={onTranscriptionUpload} />
      <Snackbar open={!!updateMessage} autoHideDuration={6000} onClose={() => setUpdateMessage(null)}>
        <MuiAlert elevation={6} variant="filled" onClose={() => setUpdateMessage(null)} severity="warning">
          {updateMessage}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default UserProfile;