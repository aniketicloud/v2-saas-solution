import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { admin, organization } from "better-auth/plugins";

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
  ],
});
