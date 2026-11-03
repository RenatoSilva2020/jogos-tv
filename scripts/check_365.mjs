async function run() {
  const res = await fetch("https://res.365scores.com/static/js/main.34c6a2bb.js");
  const text = await res.text();
  const chunkMapMatch = text.match(/\{(?:\d+:\"[a-f0-9]+\",?){5,}\}/);
  if (!chunkMapMatch) return;
  const mapStr = chunkMapMatch[0];
  const map = eval('(' + mapStr + ')');
  console.log("Total chunks:", Object.keys(map).length);

  for (const [id, hash] of Object.entries(map)) {
    const chunkUrl = `https://res.365scores.com/static/js/${id}.${hash}.js`;
    try {
      const cRes = await fetch(chunkUrl);
      const cText = await cRes.text();
      if (cText.includes("where-to-watch") || cText.includes("where_to_watch") || cText.includes("whereToWatch") || cText.includes("onde-assistir")) {
        console.log("MATCH FOUND in chunk:", id, chunkUrl);
        const idx = cText.indexOf("where-to-watch") !== -1 ? cText.indexOf("where-to-watch") : cText.indexOf("onde-assistir");
        console.log(cText.slice(Math.max(0, idx - 150), idx + 350));
        break;
      }
    } catch (e) {}
  }
}
run();
