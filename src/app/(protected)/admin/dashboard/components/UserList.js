'use client';
import { Box, Typography, Grid, CircularProgress, IconButton } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import UserCard from './UserCard';

export default function UserList({ users, loading, onRefresh }) {
  
  return (
    <Box mt={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Team Members</Typography>
        
        {/* Manual Refresh Button */}
        <IconButton onClick={onRefresh} disabled={loading} color="primary">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Loading State: Show spinner only if we have no data yet */}
      {loading && (!users || users.length === 0) ? (
        <Box textAlign="center" py={10}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {/* Safe Check: ensure users is an array before mapping */}
          {Array.isArray(users) && users.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              {/* CRITICAL CHANGE: 
                  We pass onRefresh as 'onDeleteSuccess'.
                  When a user is deleted, this triggers the Dashboard to reload the current page.
              */}
              <UserCard 
                user={user} 
                onDeleteSuccess={onRefresh} 
              />
            </Grid>
          ))}

          {/* Empty State */}
          {!loading && users?.length === 0 && (
            <Box width="100%" textAlign="center" mt={4}>
              <Typography variant="body1" color="text.secondary">
                No users found on this page.
              </Typography>
            </Box>
          )}
        </Grid>
      )}
    </Box>
  );
}