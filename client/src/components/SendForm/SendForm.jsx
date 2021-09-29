import { Grid, IconButton, TextField } from "@mui/material";
import { Box } from "@mui/system";
import SendIcon from "@mui/icons-material/Send";

const SendForm = ({ onSendMessage, drawerWidth, inputRef, currentUser }) => {
  return (
    <Box
      component="form"
      onSubmit={onSendMessage}
      sx={{
        position: "fixed",
        bottom: 0,
        p: 2,
        left: {
          sm: `${drawerWidth.sm}px`,
          xs: `0`,
        },
        width: {
          xs: `100%`,
          sm: `calc(100% - ${drawerWidth.sm}px)`,
        },
      }}
    >
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        wrap="nowrap"
      >
        <Grid item xs={11}>
          <TextField
            inputRef={inputRef}
            name="message"
            autoFocus
            variant="outlined"
            inputProps={{ maxLength: 200 }}
            fullWidth
            autoComplete="off"
            placeholder={currentUser.isMuted ? "You are muted" : "Message"}
            size="small"
            disabled={currentUser.isMuted}
            sx={{
              backgroundColor: "#fff",
              borderRadius: "4px",
            }}
          />
        </Grid>

        <Grid item xs>
          <IconButton
            type="submit"
            color="primary"
            disabled={currentUser.isMuted}
          >
            <SendIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SendForm;
