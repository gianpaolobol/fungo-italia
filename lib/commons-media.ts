export function isCompatibleCommonsLicense(license: string) {
  const value = license.toLocaleLowerCase("en").replaceAll("-", " ");
  return value.includes("cc0") || value.includes("public domain") || value.includes("cc by") || value.includes("creative commons attribution");
}

export function stripHtml(value: string | undefined) {
  return (value ?? "").replace(/<[^>]*>/g, "").trim();
}
