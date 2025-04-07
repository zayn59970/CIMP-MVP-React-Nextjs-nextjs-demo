import { useSession, signOut } from 'next-auth/react';
import { useMemo } from 'react';
import { User } from '@auth/user';
import { authUpdateDbUser } from '@auth/authApi';
import _ from 'lodash';
import setIn from '@/utils/setIn';

type useUser = {
  data: User | null;
  isGuest: boolean;
  updateUser: (updates: Partial<User>) => Promise<User | undefined>;
  updateUserSettings: (newSettings: User['settings']) => Promise<User['settings'] | undefined>;
  signOut: typeof signOut;
};

function useUser(): useUser {
  
  const { data, update } = useSession();
    
  const user = useMemo(() => data?.db, [data]);
  const isGuest = useMemo(() => !user?.role || user?.role?.length === 0, [user]);

 async function handleUpdateUser(_data: Partial<User>): Promise<User | undefined> {
  // Ensure user exists and has an id
  if (!user?.id) {
    console.error('User ID is missing or user is not authenticated');
    throw new Error('User ID is required to update the user');
  }

  console.log('Current User:', user);
  console.log('Update Data:', _data);

  try {
    const updateFields = {
      id: user.id,  // Ensure id is being passed correctly
      email: _data.email || user.email,
      role: _data.role || user.role,
    };

    // Update the user in the database
    const updatedUser = await authUpdateDbUser(updateFields);

    console.log('Updated User:', updatedUser);

    // Refresh session data after updating
    setTimeout(() => {
      update(); // Refresh session data
    }, 300);

    return updatedUser;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw new Error('Failed to update user');
  }
}

  

  async function handleUpdateUserSettings(newSettings: User['settings']): Promise<User['settings'] | undefined> {
    const newUser = setIn(user, 'settings', newSettings) as User;

    if (_.isEqual(user, newUser)) {
      return undefined;
    }

    const updatedUser = await handleUpdateUser(newUser);

    return updatedUser?.settings;
  }

  async function handleSignOut() {
    return signOut();
  }

  return {
    data: user,
    isGuest,
    signOut: handleSignOut,
    updateUser: handleUpdateUser,
    updateUserSettings: handleUpdateUserSettings,
  };
}

export default useUser;