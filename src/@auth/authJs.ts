import NextAuth, { NextAuthConfig } from 'next-auth';  // Corrected import statement
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import Credentials from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import { createClient } from '@supabase/supabase-js';
import { User } from '@auth/user';
import { authGetDbUserByEmail } from './authApi';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

const config: NextAuthConfig = {
  theme: { logo: '/assets/images/logo/logo.svg' },
  adapter: SupabaseAdapter({url:supabaseUrl,secret:supabaseKey}),
	basePath: '/auth',
	trustHost: true,
  providers: [
    Credentials({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        // Log in with Supabase Auth
        const { data: session, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

		console.log('Session:', session);
		console.log('Error:', error);
        if (error || !session) {
          throw new Error(error?.message || 'Invalid credentials');
        }
        // Build the user object from Supabase session data
        const user: User = {
          id: session.user.id,
          role: session.user.role || null,
          displayName: session.user.user_metadata.full_name || session.user.email,
          email: session.user.email,
          photoURL: session.user.user_metadata.avatar_url,
          shortcuts: [], // Add default or existing settings if required
          settings: {}, // Add user settings if necessary
        };

        return user; // Return user data to be used by NextAuth
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
	
      if (account) {
        // Save access token and other tokens to JWT
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }

      if (user) {
        // Save user-specific data to JWT token
        token.id = user.id;
        token.role = (user as User).role;
        token.displayName = (user as User).displayName;
        token.email = (user as User).email;
      }
// console.log(token);
      return token;
    },
    async session({ session, token }) {
	

      // Attach user info and access token to the session
      session.user = {
        ...session.user,
      };

      // Include access token in session
      session.accessToken = token.accessToken as string;
// 	  const response = await authGetDbUserByEmail(session.user.email);

// 					const userDbData = (await response.json()) as User;
// console.log(userDbData);
const userDbData = (token) as User;

	  session.db = userDbData;

      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV !== 'production',
};

// Add authJsProviderMap logic here
export const authJsProviderMap = config.providers
  .map((provider) => {
    const providerData = typeof provider === 'function' ? provider() : provider;

    return {
      id: providerData.id,
      name: providerData.name,
      style: {
        text: (providerData as { style?: { text: string } }).style?.text,
        bg: (providerData as { style?: { bg: string } }).style?.bg
      }
    };
  })
  .filter((provider) => provider.id !== 'credentials');

// Export NextAuth config and necessary functions
export const { handlers, auth, signOut } = NextAuth(config);

