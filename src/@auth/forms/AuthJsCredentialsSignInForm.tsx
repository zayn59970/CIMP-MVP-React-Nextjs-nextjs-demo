import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import { Alert, FormControl } from '@mui/material';
import { supabaseClient } from '@/utils/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from '@fuse/core/Link';
import _ from 'lodash';
import { signIn } from 'next-auth/react';

const schema = z.object({
  email: z.string().email('Invalid email').nonempty('Email is required'),
  password: z.string().min(4, 'Password must be at least 4 characters long').nonempty('Password is required')
});

type FormType = {
  email: string;
  password: string;
  remember?: boolean;
};

const defaultValues = {
  email: '',
  password: '',
  remember: false
};

function AuthJsCredentialsSignInForm() {
  const { control, formState, handleSubmit, setError } = useForm<FormType>({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema)
  });
	const { isValid, dirtyFields, errors } = formState;
  const router = useRouter();

//   async function onSubmit(formData: FormType) {
//     const { email, password } = formData;

//     const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

//     const { data: { session } } = await supabaseClient.auth.getSession();
//     if (session?.expires_at && session.expires_at < Date.now() / 1000) {
//       console.log('Refreshing session');
//       await supabaseClient.auth.refreshSession();
//     }
    
//     if (error) {
//       setError('root', { type: 'manual', message: error.message || 'Failed to sign in' });
//       return;
//     }
// console.log(data)
//     // Redirect on successful login
//     router.push('/dashboards/project');
//   }
async function onSubmit(formData: FormType) {
  const { email, password } = formData;

  // Use NextAuth's signIn method with 'credentials' provider
  const res = await signIn('credentials', {
    email,
    password,
    redirect: false,  // Set to false to prevent automatic redirection
  });

  // If signIn is successful, check for the session
  if (res?.error) {
    setError('root', { type: 'manual', message: res.error || 'Failed to sign in' });
  } else {
    // Redirect on successful login
    router.push('/dashboards/project');
  }
}
  return (
		<form
			name="loginForm"
			noValidate
			className="mt-32 flex w-full flex-col justify-center"
			onSubmit={handleSubmit(onSubmit)}
		>
			{errors?.root?.message && (
				<Alert
					className="mb-32"
					severity="error"
					sx={(theme) => ({
						backgroundColor: theme.palette.error.light,
						color: theme.palette.error.dark
					})}
				>
					{errors?.root?.message}
				</Alert>
			)}
			<Controller
				name="email"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						className="mb-24"
						label="Email"
						autoFocus
						type="email"
						error={!!errors.email}
						helperText={errors?.email?.message}
						variant="outlined"
						required
						fullWidth
					/>
				)}
			/>
			<Controller
				name="password"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						className="mb-24"
						label="Password"
						type="password"
						error={!!errors.password}
						helperText={errors?.password?.message}
						variant="outlined"
						required
						fullWidth
					/>
				)}
			/>
			<div className="flex flex-col items-center justify-center sm:flex-row sm:justify-between">
				<Controller
					name="remember"
					control={control}
					render={({ field }) => (
						<FormControl>
							<FormControlLabel
								label="Remember me"
								control={
									<Checkbox
										size="small"
										{...field}
									/>
								}
							/>
						</FormControl>
					)}
				/>

				<Link
					className="text-md font-medium"
					to="/#"
				>
					Forgot password?
				</Link>
			</div>
			<Button
				variant="contained"
				color="secondary"
				className="mt-16 w-full"
				aria-label="Sign in"
				disabled={_.isEmpty(dirtyFields) || !isValid}
				type="submit"
				size="large"
			>
				Sign in
			</Button>
		</form>
	);
}

export default AuthJsCredentialsSignInForm;

