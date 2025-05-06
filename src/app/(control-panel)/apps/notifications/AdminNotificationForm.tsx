'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Autocomplete,
  Typography,
} from '@mui/material';
import { useCreateNotificationMutation, Notification } from './NotificationApi';

const VARIANT_OPTIONS = [
  'success',
  'info',
  'error',
  'warning',
  'alert',
  'primary',
  'secondary',
] as const;

// You can expand this list or fetch dynamically if you want
const HEROICON_OPTIONS = [
  'heroicons-solid:fire',
  'heroicons-solid:bell',
  'heroicons-solid:check-circle',
  'heroicons-solid:information-circle',
  'heroicons-solid:star',
];

export default function AdminNotificationForm({
  refresh,
}: {
  refresh: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [variant, setVariant] = useState<Notification['variant']>('info');
  const [icon, setIcon] = useState('');
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLink('');
    setVariant('info');
    setIcon('');
  };

  const handleSubmit = async () => {
    const newNotification: Notification = {
      title,
      description,
      link,
      time: new Date().toISOString(),
      variant,
      icon,
    };

    const res = await useCreateNotificationMutation(newNotification);

    if (res?.error) {
      alert('Failed to create notification');
    } else {
      handleClose();
      refresh();
    }
  };

  return (
    <>
      <Button
        className="whitespace-nowrap"
        onClick={handleOpen}
        variant="contained"
        color="primary"
      >
        Send Notification
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Send Notification</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Title"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Link (optional)"
              fullWidth
              value={link}
              onChange={(e) => setLink(e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Variant</InputLabel>
              <Select
                value={variant}
                label="Variant"
                onChange={(e: SelectChangeEvent) =>
                  setVariant(e.target.value as Notification['variant'])
                }
              >
                {VARIANT_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Icon Picker */}
            <Autocomplete
              options={HEROICON_OPTIONS}
              value={icon}
              onChange={(_, newValue) => setIcon(newValue || '')}
              renderInput={(params) => (
                <TextField {...params} label="Icon" fullWidth />
              )}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  {...props}
                >
                  <img
                    src={`https://raw.githubusercontent.com/tailwindlabs/heroicons/master/optimized/24/solid/${option.split(':')[1]}.svg`}
                    alt={option}
                    width={20}
                    height={20}
                  />
                  <Typography variant="body2">{option}</Typography>
                </Box>
              )}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
