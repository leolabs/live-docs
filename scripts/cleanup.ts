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

  let ignoreNextLine = false;

  for (const line of lines) {
    if (ignoreNextLine) {
      ignoreNextLine = false;
      continue;
    }

    if (
      line === "" ||
      line.includes("<unnamed Boost.Python function>") ||
      line.includes(".__") ||
      line.includes("<Doc>__")
    ) {
      continue;
    }

    if (line.includes(".as_integer_ratio") || line.includes(".bit_count")) {
      ignoreNextLine = true;
      continue;
    }

    const cleanLine = line
      .replaceAll("&amp;gt;", "&gt;")
      .replaceAll("&amp;lt;", "&lt;");

    outputLines.push(cleanLine);
  }

  const finalOutputLines = outputLines.filter((l, i) => {
    if (l.includes("<Doc>")) {
      return !outputLines[i - 1]?.includes("<Doc>");
    } else {
      return true;
    }
  });

  console.log(`-> Removed ${lines.length - finalOutputLines.length} lines.`);
  console.log();

  await Deno.writeFile(file.name, encoder.encode(finalOutputLines.join("\n")));
}
