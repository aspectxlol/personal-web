const ADMIN_USER_UID = process.env.ADMIN_USER_UID ?? "";

export function isDevAuthBypassEnabled() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.DEV_AUTH_BYPASS === "true"
  );
}

export function isAuthorizedDashboardUser(userId?: string | null) {
  return Boolean(userId && userId === ADMIN_USER_UID);
}
