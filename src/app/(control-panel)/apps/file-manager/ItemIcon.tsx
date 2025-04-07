import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { amber, blue, green, grey, red, purple, brown, deepOrange, cyan, teal, indigo, lime, pink, lightBlue, yellow, deepPurple } from '@mui/material/colors';

const TypeBadge = styled(Box)(({ ...props }) => ({
	backgroundColor: {
		PDF: red[600],
		DOC: blue[600],
		DOCX: blue[600],
		XLS: green[600],
		XLSX: green[600],
		TXT: grey[600],
		JPG: amber[600],
		JPEG: amber[600],
		PNG: amber[600],
		GIF: purple[600],
		ZIP: brown[600],
		RAR: brown[600],
		MP4: deepOrange[600],
		MP3: cyan[600],
		AVI: teal[600],
		MOV: indigo[600],
		SVG: lime[600],
		HTML: pink[600],
		CSS: lightBlue[600],
		JS: yellow[700],
		JSON: deepPurple[600],
	
	}[props.color as string]|| grey[500],
}));

type ItemIconProps = {
	type: string;
};

/**
 * The item icon component.
 */
function ItemIcon(props: ItemIconProps) {
	const { type } = props;

	if (type === 'folder') {
		return (
			<FuseSvgIcon
				size={56}
				color="disabled"
			>
				heroicons-outline:folder
			</FuseSvgIcon>
		);
	}

	return (
		<div className="relative">
			<FuseSvgIcon
				size={56}
				color="disabled"
			>
				heroicons-outline:document
			</FuseSvgIcon>
			<TypeBadge
				color={type}
				className="absolute left-0 bottom-0 px-6 rounded text-md font-semibold leading-20 text-white"
			>
				{type}
			</TypeBadge>
		</div>
	);
}

export default ItemIcon;
