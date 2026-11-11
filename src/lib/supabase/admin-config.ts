const ADMIN_USER_UID = process.env.ADMIN_USER_UID ?? "";

export function isAuthorizedDashboardUser(userId?: string | null) {
  return Boolean(userId && userId === ADMIN_USER_UID);
}
