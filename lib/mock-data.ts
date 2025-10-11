// Mock data for UI demonstration
// Replace with actual API calls once backend is implemented

export const mockUser = {
  id: "user-1",
  email: "admin@company.com",
  firstName: "John",
  lastName: "Doe",
  profileImage: "/abstract-geometric-shapes.png",
  isSuperAdmin: true,
  isActive: true,
};

export const mockOrganization = {
  id: "org-1",
  name: "Acme Corporation",
  slug: "acme-corp",
  logo: "/generic-company-logo.png",
  status: "ACTIVE",
  employeeCount: 250,
  industry: "Technology",
};

export const mockOffices = [
  {
    id: "office-1",
    name: "Headquarters",
    code: "HQ",
    city: "San Francisco",
    country: "USA",
    type: "PHYSICAL",
    isActive: true,
  },
  {
    id: "office-2",
    name: "East Coast Office",
    code: "EC",
    city: "New York",
    country: "USA",
    type: "PHYSICAL",
    isActive: true,
  },
];

export const mockVisitors = [
  {
    id: "visitor-1",
    visitorNumber: "VIS-2024-001",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@example.com",
    phone: "+1-555-0123",
    company: "Tech Solutions Inc",
    purpose: "Business Meeting",
    visitType: "BUSINESS",
    status: "CHECKED_IN",
    hostName: "John Doe",
    expectedArrival: new Date("2024-01-15T09:00:00"),
    checkInTime: new Date("2024-01-15T09:15:00"),
    office: "Headquarters",
  },
  {
    id: "visitor-2",
    visitorNumber: "VIS-2024-002",
    firstName: "Michael",
    lastName: "Chen",
    email: "m.chen@example.com",
    phone: "+1-555-0124",
    company: "Design Studio",
    purpose: "Interview",
    visitType: "INTERVIEW",
    status: "PRE_REGISTERED",
    hostName: "Jane Smith",
    expectedArrival: new Date("2024-01-15T14:00:00"),
    office: "Headquarters",
  },
];

export const mockTickets = [
  {
    id: "ticket-1",
    ticketNumber: "TKT-2024-001",
    title: "Network connectivity issues in conference room",
    description: "WiFi not working properly in Conference Room A",
    type: "INCIDENT",
    severity: "HIGH",
    status: "IN_PROGRESS",
    priority: "High",
    category: "IT Support",
    reporter: "John Doe",
    assignee: "IT Team",
    createdAt: new Date("2024-01-15T08:30:00"),
    dueDate: new Date("2024-01-15T17:00:00"),
    slaStatus: "ON_TRACK",
  },
  {
    id: "ticket-2",
    ticketNumber: "TKT-2024-002",
    title: "Request for new software license",
    description: "Need Adobe Creative Cloud license for design team",
    type: "REQUEST",
    severity: "MEDIUM",
    status: "OPEN",
    priority: "Medium",
    category: "Software",
    reporter: "Jane Smith",
    assignee: null,
    createdAt: new Date("2024-01-15T10:00:00"),
    dueDate: new Date("2024-01-17T17:00:00"),
    slaStatus: "ON_TRACK",
  },
];

export const mockSubscription = {
  id: "sub-1",
  plan: "Enterprise",
  status: "ACTIVE",
  currentPeriodStart: new Date("2024-01-01"),
  currentPeriodEnd: new Date("2024-12-31"),
  usersCount: 45,
  maxUsers: 100,
  officesCount: 2,
  maxOffices: 10,
};

export const mockModules = [
  {
    id: "module-1",
    key: "visitor_management",
    name: "Visitor Management",
    description: "Complete visitor tracking and access control system",
    icon: "Users",
    isEnabled: true,
    category: "Operations",
  },
  {
    id: "module-2",
    key: "ticket_management",
    name: "Ticket Management",
    description: "Helpdesk and issue tracking system",
    icon: "Ticket",
    isEnabled: true,
    category: "Support",
  },
  {
    id: "module-3",
    key: "asset_management",
    name: "Asset Management",
    description: "Track and manage company assets",
    icon: "Package",
    isEnabled: false,
    category: "Operations",
  },
];

export const mockStats = {
  visitors: {
    today: 12,
    checkedIn: 8,
    preRegistered: 15,
    total: 1247,
  },
  tickets: {
    open: 23,
    inProgress: 15,
    resolved: 156,
    breached: 2,
  },
  users: {
    active: 45,
    total: 50,
  },
};
