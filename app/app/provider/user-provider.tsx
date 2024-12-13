import React from 'react';
import { UserDTO } from '~/domain/faq/entities/user';

export type UserContextProps = {
  user?: UserDTO;
};

const defaultUserContext: UserContextProps = {
  user: undefined,
};

const UserContext = React.createContext<UserContextProps>(defaultUserContext);
UserContext.displayName = 'UserContext';

export const UserProvider = ({
  user,
  children,
}: UserContextProps & { children: React.ReactNode }) => {
  const value = React.useMemo(
    () => ({
      user,
    }),
    [user]
  );
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

/**
 * Access to the user's session context.
 */
export function useUser() {
  const context = React.useContext(UserContext);

  if (typeof context === 'undefined') {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}
