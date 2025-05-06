// 'use client';

// import { useForm, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useState } from 'react';
// import TextField from '@mui/material/TextField';
// import InputAdornment from '@mui/material/InputAdornment';
// import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
// import Button from '@mui/material/Button';
// import Typography from '@mui/material/Typography';
// import Divider from '@mui/material/Divider';
// import { supabaseClient } from '@/utils/supabaseClient';
// import { useSession } from 'next-auth/react';

// const schema = z.object({
//   newPassword: z.string().min(6, 'Password must be at least 6 characters'),
// });

// type FormType = z.infer<typeof schema>;

// function SecurityTab() {
//   const { control, handleSubmit, formState, reset } = useForm<FormType>({
//     defaultValues: {
//       newPassword: '',
//     },
//     mode: 'all',
//     resolver: zodResolver(schema),
//   });

//   const { isValid, dirtyFields, errors } = formState;
//   const [message, setMessage] = useState<string | null>(null);
//   const { data: session } = useSession();

//   const onSubmit = async ({ newPassword }: FormType) => {
//     const { error } = await supabaseClient.auth.updateUser({
//       password: newPassword,
//     });

//     if (error) {
//       setMessage(`Error: ${error.message}`);
//     } else {
//       setMessage('Password updated successfully');
//       reset();
//     }
//   };

//   return (
//     <div className="w-full max-w-3xl">
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <Typography className="text-xl mb-8">Change your password</Typography>
//         <Controller
//           name="newPassword"
//           control={control}
//           render={({ field }) => (
//             <TextField
//               {...field}
//               label="New Password"
//               type="password"
//               fullWidth
//               error={!!errors.newPassword}
//               helperText={errors.newPassword?.message}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <FuseSvgIcon size={20}>heroicons-solid:key</FuseSvgIcon>
//                   </InputAdornment>
//                 ),
//               }}
//             />
//           )}
//         />

//         {message && (
//           <Typography className="mt-16" color={message.startsWith('Error') ? 'error' : 'primary'}>
//             {message}
//           </Typography>
//         )}

//         <Divider className="my-32" />

//         <div className="flex justify-end space-x-8">
//           <Button
//             variant="outlined"
//             onClick={() => reset()}
//             disabled={!dirtyFields.newPassword}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             color="secondary"
//             type="submit"
//             disabled={!isValid}
//           >
//             Save
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default SecurityTab;
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { supabaseClient } from '@/utils/supabaseClient';
import { useSession } from 'next-auth/react';
import { useAppDispatch } from '@/store/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useState } from 'react';

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormType = z.infer<typeof schema>;

function SecurityTab() {
  const { control, handleSubmit, formState, reset } = useForm<FormType>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
    mode: 'all',
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;
  const { data: session } = useSession();
  const [failCount, setFailCount] = useState<number>(0);
  const [showForgot, setShowForgot] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const notify = (message: string, isError = false) => {
    dispatch(
      showMessage({
        message,
        variant: isError ? 'error' : 'success',
        autoHideDuration: 3000,
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
      })
    );
  };

  const onSubmit = async ({ currentPassword, newPassword }: FormType) => {
    if (!session?.user?.email) {
      notify('No user session found.', true);
      return;
    }

    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: session.user.email,
      password: currentPassword,
    });

    if (signInError) {
      const attempts = failCount + 1;
      setFailCount(attempts);
      if (attempts >= 3) setShowForgot(true);
      notify('Incorrect current password.', true);
      return;
    }

    setFailCount(0);
    setShowForgot(false);

    const { error: updateError } = await supabaseClient.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      notify(`Failed to update password: ${updateError.message}`, true);
    } else {
      notify('Password updated successfully');
      reset();
    }
  };

  const handleForgotPassword = async () => {
    const email = session?.user?.email;
    if (!email) {
      notify('No user email found for password reset.', true);
      return;
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
    if (error) {
      notify(`Error sending reset email: ${error.message}`, true);
    } else {
      notify('Password reset email sent.');
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Typography className="text-xl mb-8">Change your password</Typography>

        <Controller
          name="currentPassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Current Password"
              type="password"
              fullWidth
              error={!!errors.currentPassword}
              helperText={errors.currentPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>heroicons-solid:lock-closed</FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <div className="mt-16" />

        <Controller
          name="newPassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="New Password"
              type="password"
              fullWidth
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FuseSvgIcon size={20}>heroicons-solid:key</FuseSvgIcon>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        {showForgot && (
          <div className="mt-16">
            <Button variant="outlined" color="secondary" onClick={handleForgotPassword}>
              Forgot Password?
            </Button>
          </div>
        )}

        <Divider className="my-32" />

        <div className="flex justify-end space-x-8">
          <Button
            variant="outlined"
            onClick={() => reset()}
            disabled={!dirtyFields.newPassword && !dirtyFields.currentPassword}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            disabled={!isValid}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}

export default SecurityTab;
