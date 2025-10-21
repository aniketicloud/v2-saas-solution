import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { admin, organization } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 1 * 60 * 60, // 1 hour
    },
  },
  plugins: [
    admin(),
    organization({
      allowUserToCreateOrganization: async (user) => {
        return user.role === "admin"; // Only admins can create orgs. The create org UI is hidden for non-admins.
      },
      teams: {
        enabled: true,
        allowRemovingAllTeams: false,
      },
    }),

    nextCookies(), // make sure this is the last plugin in the array
  ],
});
