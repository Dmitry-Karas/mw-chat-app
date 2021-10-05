import {
  useEffect,
  useRef,
  useState,
  FunctionComponent,
  SyntheticEvent,
} from "react";
import { Grid, IconButton, TextField } from "@mui/material";
import { Box } from "@mui/system";
import SendIcon from "@mui/icons-material/Send";
import { IUser } from "../../interfaces";

interface Props {
  onSendMessage: (text: string) => boolean;
  drawerWidth: Record<string, number>;
  muted: boolean | undefined;
}

const SendForm: FunctionComponent<Props> = ({
  onSendMessage,
  drawerWidth,
  muted,
}) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [mutedSeconds, setMutedSeconds] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  useEffect(() => {
    if (!mutedSeconds) {
      return;
    }

    setTimeout(() => {
      setMutedSeconds(mutedSeconds - 1);
    }, 1000);
  }, [mutedSeconds]);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    if (onSendMessage(newMessage)) {
      setNewMessage("");
      setMutedSeconds(15);
    }
  };

  const isMuted = Boolean(muted || mutedSeconds);

  const mutedReason = mutedSeconds
    ? `Wait ${mutedSeconds} seconds before sending the next message`
    : "You are muted";

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
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
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            ref={inputRef}
            name="message"
            autoFocus
            variant="outlined"
            inputProps={{ maxLength: 200 }}
            fullWidth
            autoComplete="off"
            placeholder={isMuted ? mutedReason : "Message"}
            size="small"
            disabled={isMuted}
            sx={{
              backgroundColor: "#fff",
              borderRadius: "4px",
            }}
          />
        </Grid>

        <Grid item xs>
          <IconButton type="submit" color="primary" disabled={isMuted}>
            <SendIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SendForm;
