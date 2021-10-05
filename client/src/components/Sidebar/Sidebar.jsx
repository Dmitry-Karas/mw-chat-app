import React from "react";
import {
  Avatar,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Box } from "@mui/system";
import UsersList from "../UsersList/UsersList";

const Sidebar = ({
  drawerWidth,
  mobileOpen,
  onDrawerToggle,
  currentUser,
  allUsers,
  onlineUsers,
  socket,
}) => {
  const drawer = (
    <Box>
      <List>
        <ListItem>
          <ListItemIcon>
            <Avatar sx={{ bgcolor: currentUser?.color }}>
              {currentUser?.name?.slice(0, 1).toUpperCase()}
            </Avatar>
          </ListItemIcon>
          <ListItemText primary={currentUser?.name} />
        </ListItem>
      </List>
      <Divider />
      <List>
        <UsersList
          currentUser={currentUser}
          allUsers={allUsers}
          onlineUsers={onlineUsers}
          socket={socket}
        />
      </List>
    </Box>
  );

  return (
    <Box sx={{ width: { sm: drawerWidth.sm }, flexShrink: { sm: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClick={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
