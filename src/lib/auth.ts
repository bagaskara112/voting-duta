import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    // ==========================================
    // Google Provider — untuk voter (pemilih)
    // ==========================================
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
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
          const email = profile?.email as string;
          const isAdmin = email === "tikusjalan54@gmail.com";
          const assignedRole = isAdmin ? "ADMIN" : "VOTER";

          const existingUser = await prisma.user.findUnique({
            where: { email },
          });

          if (existingUser) {
            // Update existing user info
            await prisma.user.update({
              where: { email },
              data: {
                name: profile?.name || user.name || "User",
                image: (profile as { picture?: string })?.picture || user.image,
                role: assignedRole,
              },
            });
          } else {
            // Create new voter/admin account
            await prisma.user.create({
              data: {
                name: profile?.name || user.name || "User",
                email: email,
                googleId: account.providerAccountId,
                image: (profile as { picture?: string })?.picture || user.image,
                role: assignedRole,
                hasVoted: false,
              },
            });
          }

          // Log the login
          const dbUser = await prisma.user.findUnique({
            where: { email },
          });
          if (dbUser) {
            await prisma.voteLog.create({
              data: {
                userId: dbUser.id,
                action: "login",
                description: `${dbUser.name} telah masuk ke sistem.`,
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
