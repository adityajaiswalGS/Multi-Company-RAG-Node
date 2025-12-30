'use client';
import { useState } from 'react';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useSelector } from 'react-redux';

export default function UserCard({ user, onDeleteSuccess }) {
  const { token } = useSelector((state) => state.auth);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${user.full_name}?`)) return;

    setDeleting(true);
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // THIS IS THE KEY: 
      // Tell the parent list to refresh data to keep pagination in sync
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (error) {
      console.error("Failed to delete user", error);
      alert("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent>
        <Typography variant="h6" fontWeight="bold">{user.full_name}</Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {user.email}
        </Typography>

        <Box display="flex" justifyContent="flex-end">
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={deleting}
            size="small"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}