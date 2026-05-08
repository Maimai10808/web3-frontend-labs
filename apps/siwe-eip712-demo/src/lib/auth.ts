import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
        },
        signature: {
          label: "Signature",
          type: "text",
        },
      },

      async authorize(credentials, req) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            return null;
          }

          const siwe = new SiweMessage(credentials.message);

          const nextAuthUrl = process.env.NEXTAUTH_URL;
          if (!nextAuthUrl) {
            throw new Error("NEXTAUTH_URL is not set");
          }

          const csrfToken = await getCsrfToken({
            req: {
              headers: req.headers,
            },
          });

          const result = await siwe.verify({
            signature: credentials.signature,
            domain: new URL(nextAuthUrl).host,
            nonce: csrfToken,
          });

          if (!result.success) {
            return null;
          }

          return {
            id: siwe.address,
            name: siwe.address,
          };
        } catch (error) {
          console.error("SIWE authorize error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user?.name) {
        token.sub = user.name;
      }

      return token;
    },

    async session({ session, token }) {
      if (token?.sub) {
        session.user = {
          ...session.user,
          name: token.sub,
        };
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
