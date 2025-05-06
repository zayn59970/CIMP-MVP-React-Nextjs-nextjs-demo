import Avatar from '@mui/material/Avatar';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { fromUnixTime } from 'date-fns';
import { formatDistanceToNow } from 'date-fns';
import Box from '@mui/material/Box';
import { ScrumboardComment } from '../../../../../ScrumboardApi';
import useSelectMember from '../../../../../hooks/useSelectMember';

type CardActivityProps = {
  item: ScrumboardComment;
};

/**
 * The card activity component.
 */
function CardActivity({ item }: CardActivityProps) {
  const { member: user, loading } = useSelectMember(item.idMember);

  if (loading) {
    return null; // or show a skeleton / spinner if you prefer
  }

  if (!user) {
    return ;
  }

  switch (item.type) {
    case 'comment': {
      return (
        <ListItem dense className="px-0">
          <Avatar
            alt={user?.displayName || user?.name}
            src={user?.photoURL || user?.avatar}
            className="w-32 h-32"
          />
          <Box
            className="flex flex-col mx-16 p-12"
            sx={(theme) => ({
              borderRadius: '5px 20px 20px 5px',
              border: `1px solid ${theme.palette.divider}`,
            })}
          >
            <div className="flex items-center">
              <Typography>{user?.name}</Typography>
              <Typography className="mx-8 text-md" color="text.secondary">
                {formatDistanceToNow(fromUnixTime(item.time), { addSuffix: true })}
              </Typography>
            </div>
            <Typography>{item.message}</Typography>
          </Box>
        </ListItem>
      );
    }
    case 'attachment': {
      return (
        <ListItem dense className="px-0">
          <Avatar
            alt={user?.displayName || user?.name}
            src={user?.photoURL || user?.avatar}
            className="w-32 h-32"
          />
          <div className="flex items-center mx-16">
            <Typography>{user?.name},</Typography>
            <Typography className="mx-8">{item.message}</Typography>
            <Typography className="text-md" color="text.secondary">
              {formatDistanceToNow(fromUnixTime(item.time), { addSuffix: true })}
            </Typography>
          </div>
        </ListItem>
      );
    }
    default:
      return null;
  }
}

export default CardActivity;
