import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import _ from 'lodash';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import { signIn } from 'next-auth/react';
import FormHelperText from '@mui/material/FormHelperText';
import { Alert } from '@mui/material';
import signinErrors from './signinErrors';
import { useRouter } from 'next/navigation';
import { supabaseClient } from '@/utils/supabaseClient';

/**
 * Form Validation Schema
 */
const schema = z
	.object({
		displayName: z.string().nonempty('You must enter your name'),
		email: z.string().email('You must enter a valid email').nonempty('You must enter an email'),
		password: z
			.string()
			.nonempty('Please enter your password.')
			.min(8, 'Password is too short - should be 8 chars minimum.'),
		passwordConfirm: z.string().nonempty('Password confirmation is required'),
		acceptTermsConditions: z.boolean().refine((val) => val === true, 'The terms and conditions must be accepted.')
	})
	.refine((data) => data.password === data.passwordConfirm, {
		message: 'Passwords must match',
		path: ['passwordConfirm']
	});

const defaultValues = {
	displayName: '',
	email: '',
	password: '',
	passwordConfirm: '',
	acceptTermsConditions: false
};

export type FormType = {
	displayName: string;
	password: string;
	email: string;
};

function AuthJsCredentialsSignUpForm() {
	const router = useRouter();

	const { control, formState, handleSubmit, setError } = useForm({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	// async function onSubmit(formData: FormType) {
	// 	const { displayName, email, password } = formData;
	// 	const result = await signIn('credentials', {
	// 		displayName,
	// 		email,
	// 		password,
	// 		formType: 'signup',
	// 		redirect: false
	// 	});

	// 	if (result?.error) {
	// 		setError('root', { type: 'manual', message: signinErrors[result.error] });
	// 		return false;
	// 	}

	// 	return true;




	// 	const res = await signIn('credentials', {
	// 		email,
	// 		password,
	// 		redirect: false,  // Set to false to prevent automatic redirection
	// 	  });
		
	// 	  // If signIn is successful, check for the session
	// 	  if (res?.error) {
	// 		setError('root', { type: 'manual', message: res.error || 'Failed to sign in' });
	// 	  } else {
	// 		// Redirect on successful login
	// 		router.push('/dashboards/project');
	// 	  }
	// }
	async function onSubmit(formData: FormType) {
		const { displayName, email, password } = formData;
		
		try {
		  // Step 1: Sign up with Supabase
		  const { data: signupData, error: signupError } = await supabaseClient.auth.signUp({
			email,
			password,
			options: {
			  data: { full_name: displayName }, // Attach custom user metadata
			},
		  });
	  
		  if (signupError) {
			throw new Error(signupError.message);
		  }
	  
		  // Step 2: Inform the user to check their email
		  setError('root', { type: 'manual', message: 'Please check your email to confirm your account then sign in.' });
		  return false;
	  
		} catch (error) {
		  setError('root', { type: 'manual', message: (error as Error).message });
		  return false;
		}
	  }
	  
	  
	return (
		<form
			name="registerForm"
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
				name="displayName"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						className="mb-24"
						label="Display name"
						autoFocus
						type="name"
						error={!!errors.displayName}
						helperText={errors?.displayName?.message}
						variant="outlined"
						required
						fullWidth
					/>
				)}
			/>
			<Controller
				name="email"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						className="mb-24"
						label="Email"
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
			<Controller
				name="passwordConfirm"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						className="mb-24"
						label="Password (Confirm)"
						type="password"
						error={!!errors.passwordConfirm}
						helperText={errors?.passwordConfirm?.message}
						variant="outlined"
						required
						fullWidth
					/>
				)}
			/>
			<Controller
				name="acceptTermsConditions"
				control={control}
				render={({ field }) => (
					<FormControl error={!!errors.acceptTermsConditions}>
						<FormControlLabel
							label="I agree with Terms and Privacy Policy"
							control={
								<Checkbox
									size="small"
									{...field}
								/>
							}
						/>
						<FormHelperText>{errors?.acceptTermsConditions?.message}</FormHelperText>
					</FormControl>
				)}
			/>
			<Button
				variant="contained"
				color="secondary"
				className="mt-24 w-full"
				aria-label="Register"
				disabled={_.isEmpty(dirtyFields) || !isValid}
				type="submit"
				size="large"
			>
				Create your free account
			</Button>
		</form>
	);
}

export default AuthJsCredentialsSignUpForm;
