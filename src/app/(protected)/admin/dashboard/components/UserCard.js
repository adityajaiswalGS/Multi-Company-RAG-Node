'use client';
import { Card, CardContent, Typography, Avatar, Box, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

export default function UserCard({ user }) {
  return (
    <Card sx={{ borderRadius: 4, boxShadow: 2, height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar sx={{ bgcolor: '#6366f1' }}>
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold" noWrap sx={{ maxWidth: 150 }}>
              {user.full_name}
            </Typography>
            <Chip label={user.role} size="small" color="primary" variant="outlined" />
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">{user.email}</Typography>
        <Typography variant="caption" color="text.disabled">
          Joined: {new Date(user.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );
}