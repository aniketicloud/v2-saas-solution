# Documentation Index

Welcome to the v2-saas-solution documentation. This directory contains all architectural decisions, guides, and historical documentation.

## 📁 Directory Structure

```
docs/
├── README.md                    ← You are here
├── ORGANIZATION_SUMMARY.md      ← How docs were organized
├── adr/                         ← Architecture Decision Records
│   ├── README.md
│   ├── ADR-001-admin-organizations-restructuring.md
│   ├── ADR-002-admin-portal-home-navigation.md
│   ├── ADR-003-organization-edit-detail-implementation.md
│   └── ADR-004-next-js-15-params-and-ux-fixes.md
├── guides/                      ← Implementation guides
│   ├── admin-sidebar.md
│   ├── admin-components.md
│   └── ORGANIZATIONS_MIGRATION_GUIDE.md
└── archive/                     ← Superseded documentation
    ├── ADMIN_REFACTORING_PROPOSAL.md
    ├── NAVIGATION_ISSUE_RESOLUTION.md
    ├── ORGANIZATIONS_DOCUMENTATION_INDEX.md
    ├── ORGANIZATIONS_REFACTORING_CHECKLIST.md
    └── ORGANIZATIONS_REFACTORING_SUMMARY.md
```

> 📝 See [ORGANIZATION_SUMMARY.md](./ORGANIZATION_SUMMARY.md) for details on how the documentation was organized.

---

## 📚 Architecture Decision Records (ADRs)

ADRs document significant architectural and implementation decisions. Read these to understand **why** the codebase is structured the way it is.

### Current ADRs

| ADR | Title | Date | Status |
|-----|-------|------|--------|
| [ADR-001](./adr/ADR-001-admin-organizations-restructuring.md) | Admin Organizations Restructuring | Oct 15, 2025 | ✅ Implemented |
| [ADR-002](./adr/ADR-002-admin-portal-home-navigation.md) | Admin Portal Home Navigation | Oct 15, 2025 | ✅ Implemented |
| [ADR-003](./adr/ADR-003-organization-edit-detail-implementation.md) | Organization Edit and Detail Implementation | Oct 16, 2025 | ✅ Implemented |
| [ADR-004](./adr/ADR-004-next-js-15-params-and-ux-fixes.md) | Next.js 15 Async Params and UX Improvements | Oct 16, 2025 | ✅ Implemented |

### Quick Navigation by Topic

- **Organizations Module**: ADR-001, ADR-003
- **Navigation & UX**: ADR-002, ADR-004
- **Next.js 15**: ADR-004
- **Better Auth**: ADR-003

---

## 📖 Guides

Practical implementation guides for developers working on the project.

### Component Guides

- **[Admin Sidebar](./guides/admin-sidebar.md)** - Collapsible sidebar implementation using shadcn/ui
- **[Admin Components](./guides/admin-components.md)** - Overview of reusable admin components

### Feature Guides

- **[Organizations Migration Guide](./guides/ORGANIZATIONS_MIGRATION_GUIDE.md)** - How to work with the organizations module

---

## 🗄️ Archive

Historical documentation that has been superseded by ADRs or is no longer relevant. Kept for reference.

- `ADMIN_REFACTORING_PROPOSAL.md` - Initial proposal (superseded by ADR-001)
- `NAVIGATION_ISSUE_RESOLUTION.md` - Old navigation fix (superseded by ADR-002)
- `ORGANIZATIONS_DOCUMENTATION_INDEX.md` - Old index (superseded by ADR-001)
- `ORGANIZATIONS_REFACTORING_CHECKLIST.md` - Implementation checklist (completed)
- `ORGANIZATIONS_REFACTORING_SUMMARY.md` - Old summary (superseded by ADRs)

---

## 🎯 Getting Started

### For New Developers

1. **Start with the main [README](../README.md)** - Project overview and setup
2. **Read [ADR-001](./adr/ADR-001-admin-organizations-restructuring.md)** - Understand the folder structure
3. **Check [Copilot Instructions](../.github/copilot-instructions.md)** - Project conventions and patterns

### For Feature Work

1. **Check existing ADRs** for related decisions
2. **Follow patterns** documented in ADRs
3. **Update ADRs** if making significant architectural changes

### Creating New ADRs

When making significant architectural decisions:

1. Copy the template from existing ADRs
2. Number sequentially (ADR-005, ADR-006, etc.)
3. Include: Context, Decision, Consequences, Alternatives
4. Update this index with the new ADR

---

## 📊 Documentation Status

### Coverage by Feature

| Feature | ADRs | Guides | Status |
|---------|------|--------|--------|
| **Organizations Module** | 3 | 1 | ✅ Complete |
| **Admin Portal** | 2 | 2 | ✅ Complete |
| **Authentication** | Partial | 0 | ⚠️ Needs ADR |
| **User Dashboard** | 0 | 0 | ❌ Not documented |
| **Multi-tenancy** | 0 | 0 | ❌ Not documented |

### Upcoming Documentation

- [ ] ADR-005: Organization Member Management
- [ ] ADR-006: Soft Delete Pattern
- [ ] Guide: Authentication Flow with Better Auth
- [ ] Guide: Multi-tenant Architecture

---

## 🔗 External Resources

### Project Dependencies

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

### Related Files

- [Copilot Instructions](../.github/copilot-instructions.md) - AI coding assistant rules
- [Project README](../README.md) - Main project documentation
- [Prisma Schema](../prisma/schema.prisma) - Database schema

---

## 📝 Contributing to Documentation

### Documentation Standards

1. **ADRs** - For architectural decisions with long-term impact
2. **Guides** - For implementation patterns and how-tos
3. **Code Comments** - For inline explanations
4. **README files** - For component-specific documentation

### Writing Guidelines

- ✅ **Be specific** - Include code examples and file paths
- ✅ **Explain why** - Not just what, but why this approach
- ✅ **Show alternatives** - What was considered and rejected
- ✅ **Keep updated** - Archive superseded docs, don't delete
- ✅ **Cross-reference** - Link to related ADRs and guides

### Review Process

All documentation changes should:
1. Be reviewed like code
2. Update this index if adding new files
3. Move old docs to archive, don't delete
4. Follow the established format

---

## 📅 Last Updated

**Date:** October 16, 2025  
**Maintainer:** Development Team  
**Status:** Active and maintained

---

## 🆘 Need Help?

- **Can't find documentation?** Check the archive or search ADRs
- **Found outdated info?** Create an issue or update directly
- **Need clarification?** Reference the ADR number in discussions
- **Unsure about a decision?** Check ADR "Alternatives Considered" section

---

*This documentation index is actively maintained. If you find missing or outdated information, please update it!*
