const names = process.argv.slice(2);
if (names.length === 0) {
  console.error("Usage: node scripts/audit-index-fungorum.mjs <name> [name...]");
  process.exit(2);
}

for (const name of names) {
  const response = await fetch(
    "https://www.indexfungorum.org/ixfwebservice/fungus.asmx/NameSearch",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        SearchText: name,
        AnywhereInText: "false",
        MaxNumber: "10",
      }),
    },
  );
  if (!response.ok) {
    throw new Error(`Index Fungorum request failed for ${name}: ${response.status}`);
  }
  const xml = await response.text();
  console.log(`===== ${name} =====`);
  console.log(xml);
}
