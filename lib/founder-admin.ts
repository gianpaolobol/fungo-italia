export function isFounderAdmin(email: string | null | undefined, configuredEmails: string | null | undefined) {
  if (!email || !configuredEmails) return false;
  const normalized = email.trim().toLocaleLowerCase("it");
  return configuredEmails
    .split(",")
    .map((candidate) => candidate.trim().toLocaleLowerCase("it"))
    .filter(Boolean)
    .includes(normalized);
}
