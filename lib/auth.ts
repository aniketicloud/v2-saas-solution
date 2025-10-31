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
      organizationHooks: {
        // Before creating a team - only global admin users can create
        beforeCreateTeam: async ({ team, organization, user }) => {
          // Only global admin users can create offices
          if (!user || user.role !== "admin") {
            throw new Error("Only admin users can create offices");
          }

          // Check if team name already exists in this organization
          const existingTeam = await prisma.team.findFirst({
            where: {
              organizationId: organization.id,
              name: team.name,
            },
          });

          if (existingTeam) {
            throw new Error(
              `An office named "${team.name}" already exists in this organization`
            );
          }

          return { data: team };
        },

        // Before updating a team - admin users and org admins can update
        beforeUpdateTeam: async ({ team, updates, organization, user }) => {
          // Get the member making the request
          const member = await prisma.member.findFirst({
            where: {
              organizationId: organization.id,
              userId: user.id,
            },
          });

          // Check permissions: global admin OR organization admin/owner
          const canUpdate =
            user.role === "admin" ||
            member?.role === "admin" ||
            member?.role === "owner";

          if (!canUpdate) {
            throw new Error(
              "Only admin users and organization admins can update offices"
            );
          }

          // Only check name uniqueness if name is being updated
          if (updates.name && updates.name !== team.name) {
            const existingTeam = await prisma.team.findFirst({
              where: {
                organizationId: organization.id,
                name: updates.name,
                NOT: {
                  id: team.id, // Exclude current team from check
                },
              },
            });

            if (existingTeam) {
              throw new Error(
                `An office named "${updates.name}" already exists in this organization`
              );
            }
          }

          return { data: updates };
        },

        // Before deleting a team - only global admin users can delete
        beforeDeleteTeam: async ({ team, organization, user }) => {
          // Only global admin users can delete offices
          if (!user || user.role !== "admin") {
            throw new Error("Only admin users can delete offices");
          }
        },

        // Before adding team member - admin users and org admins can add
        beforeAddTeamMember: async ({
          teamMember,
          team,
          user,
          organization,
        }) => {
          // Get the member making the request
          const member = await prisma.member.findFirst({
            where: {
              organizationId: organization.id,
              userId: user.id,
            },
          });

          // Check permissions: global admin OR organization admin/owner
          const canManage =
            user.role === "admin" ||
            member?.role === "admin" ||
            member?.role === "owner";

          if (!canManage) {
            throw new Error(
              "Only admin users and organization admins can add members to offices"
            );
          }
        },

        // Before removing team member - admin users and org admins can remove
        beforeRemoveTeamMember: async ({
          teamMember,
          team,
          user,
          organization,
        }) => {
          // Get the member making the request
          const member = await prisma.member.findFirst({
            where: {
              organizationId: organization.id,
              userId: user.id,
            },
          });

          // Check permissions: global admin OR organization admin/owner
          const canManage =
            user.role === "admin" ||
            member?.role === "admin" ||
            member?.role === "owner";

          if (!canManage) {
            throw new Error(
              "Only admin users and organization admins can remove members from offices"
            );
          }
        },
      },
    }),

    nextCookies(), // make sure this is the last plugin in the array
  ],
});
