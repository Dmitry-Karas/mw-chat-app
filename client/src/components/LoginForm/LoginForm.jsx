import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";
import { useState } from "react";
import { ChatAPI } from "../../services/chatAPI";
import { useHistory } from "react-router-dom";

const LoginForm = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const history = useHistory();

  const handleChange = (e) => {
    switch (e.target.name) {
      case "email":
        setName(e.target.value);
        return;

      case "password":
        setPassword(e.target.value);
        return;

      default:
        return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await ChatAPI.auth({ name, password });

      if (!data) {
        return;
      }

      const { token } = data;

      sessionStorage.setItem("token", token);
      history.push("/chat");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            value={name}
            margin="normal"
            required
            fullWidth
            id="email"
            label="Name"
            name="email"
            autoComplete="email"
            autoFocus
            onChange={handleChange}
          />
          <TextField
            value={password}
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={handleChange}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;
