'use client';

import { Box, Button, Typography, CircularProgress, Pagination, Stack } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DocumentCard from './DocumentCard';

export default function DocumentList({
  documents,
  loading,
  onRefresh,
  onDelete,
  page,
  totalPages,
  onPageChange
}) {
  // --- SAFETY CHECK ---
  // If documents is undefined/null, use an empty array [] to prevent crash
  const safeDocs = Array.isArray(documents) ? documents : [];

  return (
    <Box className="rounded-2xl bg-white p-8 shadow-xl border border-gray-200 mt-8">
      
      {/* HEADER */}
      <Box className="mb-6 flex items-center justify-between">
        <Typography variant="h5" className="font-bold text-gray-800">
          Your Documents ({safeDocs.length})
        </Typography>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* LOADING & EMPTY STATES */}
      {loading && safeDocs.length === 0 ? (
        <Box textAlign="center" py={12}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {safeDocs.length === 0 ? (
            <Typography className="text-center text-gray-500 py-12">
              No documents found on this page.
            </Typography>
          ) : (
            // DOCUMENT GRID
            <Box className="grid gap-4">
              {safeDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onDelete={onDelete}
                  loading={loading}
                />
              ))}
            </Box>
          )}

          {/* PAGINATION CONTROLS */}
          {/* Only show if we have pages or docs */}
          {(safeDocs.length > 0 || totalPages > 1) && (
            <Stack spacing={2} alignItems="center" mt={6}>
              <Pagination 
                count={totalPages || 1} 
                page={page || 1} 
                onChange={onPageChange} 
                color="primary" 
                size="large"
                showFirstButton 
                showLastButton
              />
            </Stack>
          )}
        </>
      )}
    </Box>
  );
}