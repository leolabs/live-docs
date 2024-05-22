const decoder = new TextDecoder();
const encoder = new TextEncoder();

for await (const file of Deno.readDir(".")) {
  if (!file.name.startsWith("Live") || !file.name.endsWith(".xml")) {
    continue;
  }

  const content = decoder.decode(await Deno.readFile(file.name));

  const lines = content.split("\n");
  const outputLines: string[] = [];

  console.log(`Cleaning up ${file.name}...`);

  for (const line of lines) {
    if (
      line === "" ||
      line.includes("<unnamed Boost.Python function>") ||
      line.includes(".__") ||
      line.includes("<Doc>__")
    ) {
      continue;
    }

    outputLines.push(line);
  }

  const finalOutputLines = outputLines.filter((l, i) => {
    if (l.includes("<Doc>")) {
      return !outputLines[i - 1]?.includes("<Doc>");
    } else {
      return true;
    }
  });

  console.log(`-> Removed ${lines.length - finalOutputLines.length} lines.`);

  await Deno.writeFile(file.name, encoder.encode(finalOutputLines.join("\n")));
}
