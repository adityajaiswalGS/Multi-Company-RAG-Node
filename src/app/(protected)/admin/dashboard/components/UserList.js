'use client';
import { Box, Typography, Grid, CircularProgress, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import UserCard from './UserCard';

export default function UserList({ users, loading, onRefresh }) {
  return (
    <Box mt={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Team Members</Typography>
        <IconButton onClick={onRefresh} disabled={loading} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      {loading && users.length === 0 ? (
        <Box textAlign="center" py={10}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <UserCard user={user} />
            </Grid>
          ))}
          {users.length === 0 && (
            <Typography variant="body1" color="text.secondary" sx={{ ml: 3 }}>
              No users found. Create your first team member above!
            </Typography>
          )}
        </Grid>
      )}
    </Box>
  );
}