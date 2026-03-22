export const routes = {
  auth: ["/api/auth/register", "/api/auth/login", "/api/auth/logout", "/api/auth/refresh", "/api/auth/me"],
  users: ["/api/users/:id", "/api/users/profile", "/api/users/me"],
  freelancers: ["/api/freelancers", "/api/freelancers/:id", "/api/freelancers/:id/reviews"],
  jobs: ["/api/jobs", "/api/jobs/my", "/api/jobs/:id", "/api/jobs/:id/proposals"],
  proposals: ["/api/proposals", "/api/proposals/my", "/api/proposals/:id"],
  contracts: ["/api/contracts", "/api/contracts/my", "/api/contracts/:id/complete", "/api/contracts/:id/cancel"],
  messages: ["/api/messages/:conversation", "/api/messages"],
  reviews: ["/api/reviews", "/api/reviews/:freelancerId"],
  wallet: ["/api/wallet", "/api/wallet/topup"],
  payments: ["/api/payments/my", "/api/payments/hold", "/api/payments/:id/release"],
  bookmarks: ["/api/bookmarks", "/api/bookmarks/:id"],
  support: ["/api/support", "/api/support/my"],
  admin: [
    "/api/admin/users",
    "/api/admin/users/:id/ban",
    "/api/admin/users/:id",
    "/api/admin/jobs",
    "/api/admin/jobs/:id",
    "/api/admin/reports",
    "/api/admin/reports/:id",
    "/api/admin/support",
    "/api/admin/support/:id",
  ],
  resources: [
    "/api/resources/upload",
    "/api/resources/link",
    "/api/resources/:contractId",
    "/api/resources/delete/:id"
  ],
  activities: [
    "/api/activities/:contractId"
  ]
};

