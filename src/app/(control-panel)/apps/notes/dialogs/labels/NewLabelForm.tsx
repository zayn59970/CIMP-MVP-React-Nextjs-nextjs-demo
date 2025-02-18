import { Controller, useForm } from 'react-hook-form';
import _ from 'lodash';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ListItem from '@mui/material/ListItem';
import clsx from 'clsx';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import LabelModel from '../../models/LabelModel';
import { NotesLabel, useCreateNotesLabelMutation, useGetNotesLabelsQuery } from '../../NotesApi';
import { useEffect, useState } from 'react';

const defaultValues = {
  title: ''
};

type FormType = { title: NotesLabel['title'] };

function NewLabelForm() {
  const [labels, setLabels] = useState<NotesLabel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    const { data } = await useGetNotesLabelsQuery();

    if (data) {
      setLabels(data);
    } else if (error) {
      setError(error);
    }

    setIsLoading(false);
  };

  /** Subscribe to real-time changes */
  useEffect(() => {
    fetchTasks();
  }, []);

  /**
   * Form Validation Schema
   */
  const schema = z.object({
    title: z
      .string()
      .nonempty('You must enter a label title')
      .refine(
        (title) => {
          return !labels.some((label) => label.title === title);
        },
        {
          message: 'This label title already exists'
        }
      )
  });

  const { control, formState, handleSubmit, reset } = useForm<FormType>({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema)
  });

  const { isValid, dirtyFields, errors } = formState;

  const onSubmit = async (data: FormType) => {
    const newLabel = LabelModel(data);
    try {
     await useCreateNotesLabelMutation(newLabel); // Handle async call and unwrap the result
      reset(defaultValues); // Reset the form after successful creation
    } catch (err) {
      console.error("Error creating label:", err);
      // Optionally, set error state to display an error message
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <ListItem className="p-0 mb-12" dense>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              className={clsx('flex flex-1')}
              error={!!errors.title}
              helperText={errors?.title?.message}
              placeholder="Create new label"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon color="action" size={16}>
                      heroicons-outline:tag
                    </FuseSvgIcon>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      className="p-0"
                      aria-label="Create"
                      disabled={_.isEmpty(dirtyFields) || !isValid}
                      type="submit"
                      size="small"
                    >
                      <FuseSvgIcon color="action">heroicons-outline:check</FuseSvgIcon>
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          )}
        />
      </ListItem>
    </form>
  );
}

export default NewLabelForm;
