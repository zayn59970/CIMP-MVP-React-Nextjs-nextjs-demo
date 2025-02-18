import { Controller, useForm } from 'react-hook-form';
import { alpha, darken } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { useEffect, useState, MouseEvent } from 'react';
import _ from 'lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabaseClient } from '@/utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

type FormType = {
  title: string;
};

const defaultValues = {
  title: '',
};

/**
 * Form Validation Schema
 */
const schema = z.object({
  title: z.string().nonempty('You must enter a title'),
});

/**
 * The board add list component.
 */
function BoardAddList() {
  const routeParams = useParams();
  const { boardId } = routeParams as { boardId: string };

  const [formOpen, setFormOpen] = useState(false);

  const { control, formState, handleSubmit, reset } = useForm<FormType>({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields } = formState;

  useEffect(() => {
    if (!formOpen) {
      reset(defaultValues);
    }
  }, [formOpen, reset]);

  function handleOpenForm(ev: MouseEvent<HTMLButtonElement>) {
    ev.stopPropagation();
    setFormOpen(true);
  }

  function handleCloseForm() {
    setFormOpen(false);
  }

  async function onSubmit(data: FormType) {
    try {
      // Step 1: Insert a new list into the "scrumboard_list" table
      const { data: newList, error: insertError } = await supabaseClient
        .from('scrumboard_list')
        .insert({  boardid: boardId, title: data.title, id: uuidv4() })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating list:', insertError.message);
        return;
      }

      // Step 2: Fetch the current board to get the latest lists
      const { data: board, error: fetchError } = await supabaseClient
        .from('scrumboard_board')
        .select('lists')
        .eq('id', boardId)
        .single();

      if (fetchError) {
        console.error('Error fetching board:', fetchError.message);
        return;
      }

      // Step 3: Update the board with the new list
      const updatedLists = [...(board?.lists || []), { id: newList.id, cards: [] }];
      const { error: updateError } = await supabaseClient
        .from('scrumboard_board')
        .update({ lists: updatedLists })
        .eq('id', boardId);

      if (updateError) {
        console.error('Error updating board:', updateError.message);
        return;
      }

      // Close the form after successful operation
      handleCloseForm();
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  }

  return (
    <div>
      <Card
        className="w-320 mx-8 sm:mx-12 rounded-lg shadow-0"
        square
        sx={{
          backgroundColor: (theme) =>
            darken(theme.palette.background.default, theme.palette.mode === 'light' ? 0.03 : 0.25),
        }}
      >
        {formOpen ? (
          <ClickAwayListener onClickAway={handleCloseForm}>
            <form className="p-12" onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    className="mb-8"
                    required
                    fullWidth
                    variant="outlined"
                    placeholder="List title*"
                    autoFocus
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleCloseForm} size="small">
                            <FuseSvgIcon size={18}>heroicons-outline:x-mark</FuseSvgIcon>
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <div className="flex justify-between items-center">
                <Button
                  variant="contained"
                  color="secondary"
                  type="submit"
                  disabled={_.isEmpty(dirtyFields) || !isValid}
                  size="small"
                >
                  Add
                </Button>
              </div>
            </form>
          </ClickAwayListener>
        ) : (
          <Button
            onClick={handleOpenForm}
            classes={{
              root: 'font-medium w-full rounded-lg p-24 justify-start',
            }}
            startIcon={<FuseSvgIcon>heroicons-outline:plus-circle</FuseSvgIcon>}
            sx={{
              backgroundColor: 'divider',
              '&:hover, &:focus': {
                backgroundColor: (theme) => alpha(theme.palette.divider, 0.8),
              },
              color: 'text.secondary',
            }}
          >
            Add another list
          </Button>
        )}
      </Card>
    </div>
  );
}

export default BoardAddList;
