import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // ==========================================
    // Google Provider — untuk voter (pemilih)
    // ==========================================
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),

    // ==========================================
    // Credentials Provider — untuk admin
    // ==========================================
    Credentials({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const admin = await prisma.admin.findUnique({
          where: { username: credentials.username as string },
        });

        if (!admin) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          admin.password
        );

        if (!isValid) {
          return null;
        }

        // Return admin data as user object
        return {
          id: admin.id,
          name: admin.name,
          email: `${admin.username}@admin.local`,
          role: "ADMIN" as const,
          hasVoted: false,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  
  trustHost: true,

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    // ==========================================
    // signIn: Handle Google login — create/update user in DB
    // ==========================================
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: profile?.email as string },
          });

          if (existingUser) {
            // Update existing user info
            await prisma.user.update({
              where: { email: profile?.email as string },
              data: {
                name: profile?.name || user.name || "User",
                image: (profile as { picture?: string })?.picture || user.image,
              },
            });
          } else {
            // Create new voter account
            await prisma.user.create({
              data: {
                name: profile?.name || user.name || "User",
                email: profile?.email as string,
                googleId: account.providerAccountId,
                image: (profile as { picture?: string })?.picture || user.image,
                role: "VOTER",
                hasVoted: false,
              },
            });
          }

          // Log the login
          const dbUser = await prisma.user.findUnique({
            where: { email: profile?.email as string },
          });
          if (dbUser) {
            await prisma.voteLog.create({
              data: {
                userId: dbUser.id,
                action: "login",
                description: `User logged in via Google: ${profile?.email}`,
              },
            });
          }

          return true;
        } catch (error) {
          console.error("Error during Google sign in:", error);
          return false;
        }
      }

      // Admin login via credentials — always allow (already authorized)
      return true;
    },

    // ==========================================
    // jwt: Attach user data to JWT token
    // ==========================================
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          // Fetch user from database
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.hasVoted = dbUser.hasVoted;
          }
        } else {
          // Admin login
          token.id = user.id as string;
          token.role = "ADMIN";
          token.hasVoted = false;
        }
      }

      // Refresh hasVoted status on every request for voters
      if (token.role === "VOTER" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { hasVoted: true },
        });
        if (dbUser) {
          token.hasVoted = dbUser.hasVoted;
        }
      }

      return token;
    },

    // ==========================================
    // session: Expose user data to client
    // ==========================================
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.hasVoted = token.hasVoted;
      }
      return session;
    },
  },
});
