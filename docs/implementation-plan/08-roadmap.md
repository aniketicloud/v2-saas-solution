# Part 8: Implementation Roadmap

**Last Updated**: October 17, 2025

---

## 🗓️ 6-Week Implementation Timeline

Complete phase-by-phase breakdown with deliverables and testing.

---

## 📅 Phase 1: Database Setup (Week 1)

**Duration**: 3-4 days

### Tasks

1. **Add Subscription Model**
   ```bash
   # Update schema.prisma
   npx prisma migrate dev --name add_subscriptions_and_modules
   ```
   - Add `OrganizationSubscription` model
   - Add `OrganizationModule` model
   - Create relations to Organization

2. **Seed Module Definitions**
   ```bash
   # Run seed script
   pnpm tsx prisma/seed-modules.ts
   ```
   - Add visitors, tickets, inventory modules
   - Set default descriptions

3. **Create Default Subscription**
   - Write migration script to add Free plan to existing orgs
   - Test rollback scenario

### Deliverables

- ✅ Migration applied successfully
- ✅ Seed data created (3 modules)
- ✅ Existing organizations have Free plan
- ✅ Foreign keys working correctly

### Testing Checklist

- [ ] Run migration on clean database
- [ ] Run migration on database with existing orgs
- [ ] Verify seed creates exactly 3 modules
- [ ] Check cascade deletes work (org deletion)
- [ ] Rollback and reapply migration

---

## 🔐 Phase 2: Permission System (Week 1-2)

**Duration**: 4-5 days

### Tasks

1. **Update Better Auth Configuration**
   ```tsx
   // lib/auth.ts
   import { createAccessControl } from "better-auth";
   
   // Add statement and roles
   ```
   - Define statement with 10 resources
   - Create owner, admin, member roles
   - Test with `ac.check()` examples

2. **Create Permission Utilities**
   - `getEffectiveRole()` helper
   - System admin override logic
   - Server-side `checkPermission()` wrapper

3. **Build Client Providers**
   ```tsx
   // components/permissions-provider.tsx
   // components/conditional-render.tsx
   ```

### Deliverables

- ✅ Access control configured in `lib/auth.ts`
- ✅ Three roles with correct permissions
- ✅ System admin override working
- ✅ Client-side permission hooks ready

### Testing Checklist

- [ ] System admin can access all orgs as "owner"
- [ ] Org owner can manage all except delete subscription
- [ ] Org admin cannot delete org or manage subscriptions
- [ ] Member has read-only access to most resources
- [ ] Permission checks return consistent results server/client

---

## 🛣️ Phase 3: Routing & Layouts (Week 2)

**Duration**: 3-4 days

### Tasks

1. **Update Root Page**
   ```tsx
   // app/page.tsx
   // Implement smart redirect logic
   ```
   - Check session
   - Determine active org
   - Redirect based on role

2. **Enhance Organization Layout**
   ```tsx
   // app/(organization)/org/[slug]/layout.tsx
   // Add system admin role override
   ```
   - Grant virtual "owner" role to system admins
   - Pass organization data to children

3. **Create Module Access Middleware**
   ```tsx
   // app/(organization)/org/[slug]/modules/[moduleKey]/_lib/check-module-access.ts
   ```
   - Verify module is enabled
   - Check user has permission
   - Return clear error messages

### Deliverables

- ✅ Smart entry point at `/`
- ✅ System admins can access all org workspaces
- ✅ Module routes protected by middleware
- ✅ Breadcrumbs and navigation working

### Testing Checklist

- [ ] System admin visits `/` → redirects to `/admin`
- [ ] User with 1 org visits `/` → redirects to `/org/[slug]`
- [ ] User with 0 orgs visits `/` → redirects to `/no-organization`
- [ ] Non-member tries to access org → 403 error
- [ ] User tries to access disabled module → error message

---

## 🧩 Phase 4: Module Management (Week 3)

**Duration**: 5-6 days

### Tasks

1. **Admin Module Toggle Page**
   ```tsx
   // app/(admin)/admin/organizations/[id]/modules/page.tsx
   ```
   - Display all 3 modules as cards
   - Add toggle switches
   - Show enabled/disabled status

2. **Module Toggle Action**
   ```tsx
   // Server action with validation
   ```
   - Check system admin permission
   - Validate against subscription limits
   - Update module status
   - Revalidate cache

3. **User-Facing Module Check**
   ```tsx
   // OrgNav component updates
   ```
   - Show/hide module links based on `isEnabled`
   - Display "coming soon" for disabled modules

### Deliverables

- ✅ System admins can enable/disable modules
- ✅ Module status persists in database
- ✅ OrgNav reflects module availability
- ✅ Access attempts to disabled modules are blocked

### Testing Checklist

- [ ] Enable module → appears in OrgNav
- [ ] Disable module → removed from OrgNav
- [ ] Try to enable 3rd module on Free plan → blocked
- [ ] Upgrade subscription → can enable more modules
- [ ] Module settings JSON stored correctly

---

## 👥 Phase 5: Member Management (Week 3-4)

**Duration**: 5-6 days

### Tasks

1. **Members List Page**
   ```tsx
   // app/(organization)/org/[slug]/members/page.tsx
   ```
   - Display members with avatars
   - Show role badges
   - Add "Invite" button (conditional)

2. **Invite Member Flow**
   ```tsx
   // Invite form + server action
   ```
   - Email validation (Zod)
   - Role selection dropdown
   - Send invitation via Better Auth
   - Check member limit

3. **Remove Member Action**
   ```tsx
   // Delete member with confirmation
   ```
   - Prevent removing self
   - Prevent removing last owner
   - Show success toast

4. **Update Role Action**
   ```tsx
   // Edit role with validation
   ```
   - Prevent downgrading self
   - Check permissions

### Deliverables

- ✅ Members page with full CRUD
- ✅ Invitation system working
- ✅ Role updates persist correctly
- ✅ Member limits enforced

### Testing Checklist

- [ ] Owner can invite admin/member
- [ ] Admin can invite member (not owner)
- [ ] Member cannot invite anyone
- [ ] Cannot exceed plan's member limit
- [ ] Remove member → disappears from list
- [ ] Update role → badge changes immediately

---

## 💳 Phase 6: Subscription Management (Week 4-5)

**Duration**: 4-5 days

### Tasks

1. **Subscription Settings Page**
   ```tsx
   // app/(organization)/org/[slug]/settings/subscription/page.tsx
   ```
   - Display current plan
   - Show usage stats (modules, members)
   - Add upgrade/downgrade buttons

2. **Plan Comparison Component**
   ```tsx
   // Show feature differences
   ```
   - Free: 2 modules, 10 members
   - Monthly: 5 modules, 50 members, $49/mo
   - Yearly: Unlimited, $490/yr

3. **Update Subscription Action**
   ```tsx
   // Stripe integration placeholder
   ```
   - Validate plan transition
   - Update database
   - Handle downgrades (disable excess modules)

4. **Subscription Enforcement**
   ```tsx
   // Add checks to invite/module actions
   ```
   - Block invites if at member limit
   - Block module enable if at module limit

### Deliverables

- ✅ Subscription page shows current plan
- ✅ Upgrade/downgrade flow works
- ✅ Limits enforced throughout app
- ✅ Downgrade disables excess features gracefully

### Testing Checklist

- [ ] Free plan shows 2/2 modules enabled
- [ ] Try to enable 3rd module → error
- [ ] Upgrade to Monthly → can enable 5 modules
- [ ] Try to invite 51st member on Monthly → blocked
- [ ] Downgrade disables extra modules automatically

---

## ⚙️ Phase 7: Settings & Polish (Week 5)

**Duration**: 4-5 days

### Tasks

1. **Organization Settings Pages**
   ```tsx
   // General settings (name, slug)
   // Security settings (future: 2FA)
   ```

2. **User Profile Settings**
   ```tsx
   // Update name, email, password
   // Avatar upload (future)
   ```

3. **Navigation Enhancements**
   - Add breadcrumbs to all pages
   - Mobile menu improvements
   - Active state indicators

4. **Empty States**
   - No organizations
   - No members
   - Module disabled messages

### Deliverables

- ✅ Settings pages functional
- ✅ Navigation polished
- ✅ Empty states informative
- ✅ Mobile responsive

### Testing Checklist

- [ ] Update org name → reflects in all places
- [ ] Update user profile → avatar shows correctly
- [ ] Mobile menu opens/closes smoothly
- [ ] Empty states show correct CTAs

---

## 🧪 Phase 8: Testing & Launch (Week 6)

**Duration**: 5-7 days

### Tasks

1. **End-to-End Testing**
   - Create test scenarios for each persona
   - Test all permission combinations
   - Verify subscription transitions

2. **Security Audit**
   - Review all server actions
   - Check permission bypasses
   - Test SQL injection points

3. **Performance Optimization**
   - Add database indexes
   - Optimize queries (N+1 issues)
   - Cache organization data

4. **Documentation**
   - User guides for each role
   - Admin manual
   - API documentation

### Deliverables

- ✅ All tests passing
- ✅ Security vulnerabilities fixed
- ✅ Performance benchmarks met
- ✅ Documentation complete

### Testing Checklist

**System Admin Tests**
- [ ] Can create organizations
- [ ] Can enable/disable modules
- [ ] Can access all org workspaces
- [ ] Can view subscription details

**Organization Owner Tests**
- [ ] Can invite all roles
- [ ] Can update org settings
- [ ] Can manage subscriptions
- [ ] Cannot delete own org if only owner

**Organization Admin Tests**
- [ ] Can invite members only
- [ ] Cannot manage subscriptions
- [ ] Cannot delete organization
- [ ] Can use all enabled modules

**Organization Member Tests**
- [ ] Cannot invite anyone
- [ ] Can view members list
- [ ] Can use enabled modules (if permissions allow)
- [ ] Cannot access settings

**Permission Enforcement**
- [ ] Non-member blocked from org workspace
- [ ] Module access blocked if disabled
- [ ] Feature limits enforced (members, modules)
- [ ] System admin override works everywhere

---

## 📊 Timeline Summary

| Phase | Week | Focus | Days |
|-------|------|-------|------|
| 1 | 1 | Database Setup | 3-4 |
| 2 | 1-2 | Permission System | 4-5 |
| 3 | 2 | Routing & Layouts | 3-4 |
| 4 | 3 | Module Management | 5-6 |
| 5 | 3-4 | Member Management | 5-6 |
| 6 | 4-5 | Subscriptions | 4-5 |
| 7 | 5 | Settings & Polish | 4-5 |
| 8 | 6 | Testing & Launch | 5-7 |

**Total**: 6 weeks (33-42 working days)

---

## 🚀 Launch Readiness Criteria

Before going to production:

1. ✅ All 8 phases complete
2. ✅ Database migrations tested on staging
3. ✅ All 4 personas tested with real users
4. ✅ Security audit passed
5. ✅ Performance benchmarks met (< 500ms page loads)
6. ✅ Error monitoring configured (Sentry)
7. ✅ Backup strategy in place
8. ✅ Rollback plan documented

---

**Next**: [Part 9: Key Decisions & FAQ →](./09-decisions.md)
