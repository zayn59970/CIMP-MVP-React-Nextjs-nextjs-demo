import { useSession } from "next-auth/react";
import { Controller, useForm } from 'react-hook-form';
import _ from 'lodash';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import CommentModel from '../../../../../models/CommentModel';
import { ScrumboardComment } from '../../../../../ScrumboardApi';
import useSelectMember from '../../../../../hooks/useSelectMember';

type FormType = {
	message: ScrumboardComment['message'];
};

/**
 * Form Validation Schema
 */
const schema = z.object({
	message: z.string().nonempty('You must enter a comment')
});

type CardCommentProps = {
	onCommentAdd: (comment: ScrumboardComment) => void;
};

/**
 * The card comment component.
 */
function CardComment(props: CardCommentProps) {

	const { onCommentAdd } = props;
 
 const { data } = useSession();
 const userId = data?.db.id;
 
 const defaultValues = {
	 idMember: userId,
	 message: '',
	 type:'comment',
	 time: Math.floor(Date.now() / 1000),
 
 };
	const user = data?.db;

	const { control, formState, handleSubmit, reset } = useForm<FormType>({
		mode: 'onChange',
		defaultValues,
		resolver: zodResolver(schema)
	});

	const { isValid, dirtyFields, errors } = formState;

	function onSubmit(data: FormType) {
		onCommentAdd(CommentModel({ ...defaultValues, ...data }));
		reset(defaultValues);
	}

	if (!user) {
		return null;
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="flex -mx-8"
		>
			<Avatar
				className="w-32 h-32 mx-8"
				alt={user.displayName}
				src={user.photoURL}
			/>
			<div className="flex flex-col items-start flex-1 mx-8">
				<Controller
					name="message"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							className="flex flex-1"
							fullWidth
							error={!!errors.message}
							helperText={errors?.message?.message}
							rows={3}
							variant="outlined"
							label="Add comment"
							placeholder="Write a comment..."
						/>
					)}
				/>

				<Button
					className="mt-16"
					aria-label="save"
					variant="contained"
					color="secondary"
					type="submit"
					size="small"
					disabled={_.isEmpty(dirtyFields) || !isValid}
				>
					Save
				</Button>
			</div>
		</form>
	);
}

export default CardComment;
