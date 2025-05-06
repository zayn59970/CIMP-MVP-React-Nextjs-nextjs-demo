"use client";

import { useForm, Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { supabaseClient } from "@/utils/supabaseClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { useAppDispatch } from "@/store/hooks";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";

const schema = z.object({
  title: z.string().nonempty("Board title is required"),
  description: z.string().optional(),
  members: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof schema>;

interface BoardAddFormProps {
  open: boolean;
  onClose: () => void;
  onBoardAdded: () => Promise<void>;
}

export default function BoardAddForm({
  open,
  onClose,
  onBoardAdded,
}: BoardAddFormProps) {
  const { control, handleSubmit, reset, formState, setValue, watch } =
    useForm<FormValues>({
      mode: "onChange",
      defaultValues: {
        title: "",
        description: "",
        members: [],
      },
      resolver: zodResolver(schema),
    });
  const dispatch = useAppDispatch();
  const { isValid } = formState;
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      reset({
        title: "",
        description: "",
        members: [],
      });

      // Fetch users once on dialog open
      const fetchUsers = async () => {
        const { data, error } = await supabaseClient.from("users").select("*");
        if (!error) {
          setUsers(data || []);
        } else {
          console.error("Error fetching users:", error.message);
        }
      };

      fetchUsers();
    }
  }, [open, reset]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);

    const newBoard = {
      title: data.title,
      description: data.description,
      icon: "heroicons-outline:rectangle-group",
      lastActivity: new Date().toISOString(),
      members: data.members || [],
      settings: {
        subscribed: false,
        cardCoverImages: false,
      },
      lists: [],
    };

    const { error } = await supabaseClient
      .from("scrumboard_board")
      .insert([newBoard]);

    setLoading(false);

    if (error) {
      console.error("Failed to create board:", error.message);
      return;
    }
    dispatch(
      showMessage({
        message: "New Board Added",
        autoHideDuration: 2000,
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      })
    );
    await onBoardAdded();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="flex items-center justify-between">
        <span>Create New Board</span>
        <IconButton onClick={onClose} size="small">
          <FuseSvgIcon>heroicons-outline:x-mark</FuseSvgIcon>
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent className="flex flex-col gap-20 py-24 px-32">
          <Controller
            name="title"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Board Title"
                variant="outlined"
                fullWidth
                required
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
              />
            )}
          />

          <Controller
            name="members"
            control={control}
            render={({ field }) => (
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(user) =>
                  user?.displayName || user?.id || "Unknown"
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={field.value
                  .map((id) => users.find((u) => u.id === id))
                  .filter(Boolean)}
                onChange={(_, newValue) => {
                  const ids = newValue.map((user) => user.id);
                  setValue("members", ids);
                }}
                renderTags={(value, getTagProps) =>
                  value.map((user, index) => (
                    <Chip
                      key={user.id || index}
                      avatar={
                        <Tooltip title={user.displayName || user.id}>
                          <Avatar src={user.photoURL} />
                        </Tooltip>
                      }
                      label={user.displayName || user.id}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderOption={(props, user) => (
                  <Box
                    component="li"
                    {...props}
                    key={user.id || user.email}
                    className="flex items-center gap-8"
                  >
                    <Avatar
                      src={user.photoURL}
                      alt={user.displayName || user.id}
                    />
                    <span>{user.displayName || user.id}</span>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Add Members"
                    variant="outlined"
                    placeholder="Select team members"
                  />
                )}
              />
            )}
          />
        </DialogContent>

        <DialogActions className="px-32 pb-24">
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="secondary"
            disabled={!isValid || loading}
          >
            {loading ? "Creating..." : "Create Board"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
