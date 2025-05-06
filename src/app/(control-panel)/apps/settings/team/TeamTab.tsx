'use client';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabaseClient } from '@/utils/supabaseClient';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';

const roles = [
  { label: 'Read', value: 'read', description: 'Can read and clone this repository.' },
  { label: 'Write', value: 'user', description: 'Can read, clone, and push to this repository.' },
  { label: 'Admin', value: 'admin', description: 'Can manage repository settings, including adding collaborators.' }
];

const schema = z.object({
  email: z.string().email('You must enter a valid email').nonempty('You must enter an email')
});

type FormType = z.infer<typeof schema>;

const defaultValues: FormType = { email: '' };

function TeamTab() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<any[]>([]);
  const dispatch = useAppDispatch();

  const { control, formState, handleSubmit, setError, reset } = useForm<FormType>({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema)
  });

  const { isValid } = formState;

  useEffect(() => {
    const fetchUsers = async () => {
      const currentEmail = session?.user?.email;
      if (!currentEmail) return;

      const { data, error } = await supabaseClient
        .from('users')
        .select('*')
        .neq('email', currentEmail);

      if (error) {
        console.error('Error fetching users:', error);
        dispatch(showMessage({
          message: 'Error fetching users.',
          variant: 'error',
          autoHideDuration: 2000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }));
      } else {
        setUsers(data || []);
      }
    };

    fetchUsers();
  }, [session?.user?.email]);

  const onSubmit = async ({ email }: FormType) => {
    try {
      const res = await fetch('/api/invite-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError('root', { type: 'manual', message: result.message });
        return;
      }

      reset();
      dispatch(showMessage({
        message: 'Invite sent. Ask the user to check their email.',
        variant: 'success',
        autoHideDuration: 2000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      }));
    } catch (error: any) {
      setError('root', { type: 'manual', message: error.message });
    }
  };

  const handleRoleChange = async (email: string, newRole: string) => {
    try {
      const { error } = await supabaseClient
        .from('users')
        .update({ role: [newRole] })
        .eq('email', email);

      if (error) {
        console.error('Error updating user role:', error);
        dispatch(showMessage({
          message: `Error updating role for ${email}`,
          variant: 'error',
          autoHideDuration: 2000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }));
        return;
      }

      setUsers((prev) =>
        prev.map((user) =>
          user.email === email ? { ...user, role: [newRole] } : user
        )
      );

      dispatch(showMessage({
        message: 'Role updated successfully.',
        variant: 'success',
        autoHideDuration: 2000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      }));
    } catch (err: any) {
      console.error('Unexpected error:', err);
      dispatch(showMessage({
        message: `Unexpected error: ${err.message}`,
        variant: 'error',
        autoHideDuration: 2000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      }));
    }
  };

  const handleRemoveMember = async (email: string) => {
    try {
      const res = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();
      if (!res.ok) {
        dispatch(showMessage({
          message: `Error: ${result.error}`,
          variant: 'error',
          autoHideDuration: 2000,
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
        }));
        return;
      }

      setUsers((prev) => prev.filter((user) => user.email !== email));
      dispatch(showMessage({
        message: 'User deleted successfully.',
        variant: 'success',
        autoHideDuration: 2000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      }));
    } catch (err: any) {
      console.error('Unexpected error:', err);
      dispatch(showMessage({
        message: `Unexpected error: ${err.message}`,
        variant: 'error',
        autoHideDuration: 2000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      }));
    }
  };

  return (
    <div>
      <form
        name="inviteForm"
        noValidate
        className="mt-32 flex w-full flex-col justify-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className="w-full mb-24"
              label="Add team member"
              placeholder="Enter email"
              type="email"
              required
              error={!!formState.errors.email}
              helperText={formState.errors.email?.message}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>heroicons-outline:user</FuseSvgIcon>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit" disabled={!isValid}>
                      <FuseSvgIcon size={20}>heroicons-outline:plus-circle</FuseSvgIcon>
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </form>

      <Divider />

      {users.length === 0 && (
        <Typography className="text-center my-32" color="textSecondary">
          No team members found.
        </Typography>
      )}

      <List>
        {users.map((user) => (
          <ListItem
            divider
            key={user.email}
            disablePadding
            className="py-12 flex flex-col items-start sm:items-center sm:flex-row space-y-16 sm:space-y-0"
          >
            <div className="flex flex-1 items-center">
              <ListItemAvatar>
                <Avatar src={user.avatar} alt={`Avatar ${user.name}`} />
              </ListItemAvatar>
              <ListItemText
                primary={user.name}
                secondary={user.email}
                classes={{ secondary: 'truncate' }}
              />
            </div>

            <div className="flex items-center space-x-4">
              <Select
                sx={{ '& .MuiSelect-select': { minHeight: '0!important' } }}
                value={user.role?.[0] || 'read'}
                size="small"
                onChange={(e) => handleRoleChange(user.email, e.target.value)}
              >
                {roles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>

              <IconButton onClick={() => handleRemoveMember(user.email)}>
                <FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>
              </IconButton>
            </div>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default TeamTab;