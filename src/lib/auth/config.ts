import type { NextAuthOptions } from "next-auth";
import AzureAD from "next-auth/providers/azure-ad";
import Google from "next-auth/providers/google";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    AzureAD({
      clientId: process.env.AUTH_AZURE_AD_ID ?? "",
      clientSecret: process.env.AUTH_AZURE_AD_SECRET ?? "",
      tenantId: process.env.AUTH_AZURE_AD_TENANT_ID ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider) {
        (token as { provider?: string }).provider = account.provider;
      }

      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          provider: ((token as { provider?: string }).provider as string | undefined) ?? null,
        },
      };
    },
  },
} satisfies NextAuthOptions;
