import { AppBar, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { DrawerWidth } from "../../types";

interface Props {
  drawerWidth: DrawerWidth;
  onDrawerToggle: () => void;
  handleLogout: () => void;
}

const Header = ({ drawerWidth, onDrawerToggle, handleLogout }: Props) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth.sm}px)` },
        ml: { sm: `${drawerWidth.sm}px` },
      }}
    >
      <Toolbar>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Chat app
          </Typography>
          <IconButton color="inherit" size="large" onClick={handleLogout}>
            <ExitToAppIcon fontSize="large" />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
