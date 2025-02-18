import { Controller, useForm } from 'react-hook-form';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState, MouseEvent } from 'react';
import _ from 'lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabaseClient } from '@/utils/supabaseClient';
import { useParams } from 'next/navigation';

/**
 * Form Validation Schema
 */
const schema = z.object({
  title: z.string().nonempty('You must enter a title'),
});

/**
 * The board title component.
 */
function BoardTitle() {
  const [board, setBoard] = useState<any>(null); // To store board data
  const { boardId } = useParams(); // Get the boardId from route params
  const [formOpen, setFormOpen] = useState(false);

  const { control, formState, handleSubmit, reset } = useForm({
    mode: 'onChange',
    defaultValues: {
      title: board?.title,
    },
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields } = formState;

  // Fetch board details from Supabase
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const { data, error } = await supabaseClient
          .from('scrumboard_board')
          .select('*')
          .eq('id', boardId)
          .single();

        if (error) {
          console.error('Error fetching board:', error.message);
          return;
        }

        setBoard(data);
      } catch (err) {
        console.error('Unexpected error fetching board:', err);
      }
    };

    if (boardId) {
      fetchBoard();
    }
  }, [boardId]);

  useEffect(() => {
    if (!formOpen) {
      reset({
        title: board?.title,
      });
    }
  }, [formOpen, reset, board?.title]);

  const handleOpenForm = (ev: MouseEvent<HTMLDivElement>) => {
    ev.stopPropagation();
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
  };

  const onSubmit = async (data: { title: string }) => {
    try {
      const { error } = await supabaseClient
        .from('scrumboard_board')
        .update({ title: data.title })
        .eq('id', boardId);

      if (error) {
        console.error('Error updating board:', error.message);
        return;
      }

      setBoard((prevBoard) => ({
        ...prevBoard,
        title: data.title,
      }));
      handleCloseForm();
    } catch (err) {
      console.error('Unexpected error updating board:', err);
    }
  };

  return (
    <div className="flex items-center min-w-0">
      {formOpen ? (
        <ClickAwayListener onClickAway={handleCloseForm}>
          <form className="flex w-full" onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  variant="filled"
                  margin="none"
                  autoFocus
                  hiddenLabel
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="submit"
                          disabled={_.isEmpty(dirtyFields) || !isValid}
                          size="large"
                        >
                          <FuseSvgIcon>heroicons-outline:check</FuseSvgIcon>
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </form>
        </ClickAwayListener>
      ) : (
        <div className="flex items-center justify-center space-x-12">
          <Typography
            className="text-17 sm:text-4xl font-extrabold leading-none tracking-tight cursor-pointer"
            onClick={handleOpenForm}
            color="inherit"
          >
            {board?.title}
          </Typography>
          {board?.settings?.subscribed && (
            <FuseSvgIcon>heroicons-outline:eye</FuseSvgIcon>
          )}
        </div>
      )}
    </div>
  );
}

export default BoardTitle;
