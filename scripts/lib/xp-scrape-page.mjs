/**
 * Função injetada na página XP (#/carteira) via page.evaluate.
 * Retorna snapshot DOM: grade XLS + collapses + fundos.
 */
export const XP_SCRAPE_PAGE_FN = `function __xpScrapeCarteira() {
  const ASSET_RE = /^(NTN-B|CDB |CRA |DEB |CRI )/;
  const FUND_RE = /FIC|FIRF|Referenciado|Occam|SVN/i;
  const mpL = ["Valor Líquido", "Rendimento Bruto", "Rendimento Líquido", "Garantia", "Quantidade"];
  const carL = ["Liquidez", "Juros", "Amortização", "Ticker/Código", "Rating", "Taxa de compra"];
  const isBRL = (s) => /^R\\$\\s*[\\d.]+,\\d{2}$/.test(s);
  const isPct = (s) => /^\\d+,\\d{2}%$/.test(s);
  const isDate = (s) => /^\\d{2}\\/\\d{2}\\/\\d{4}$/.test(s);
  const isTaxa = (s) => /^(IPC-A|CDI|\\+|DOLAR|97)/i.test(s);
  const isGrupo = (s) => /^\\d+[,.]\\d*%\\s*\\|/.test(s);

  function scrapeXlsGrid() {
    const rows = [];
    document.querySelectorAll("[role=row]").forEach((row) => {
      const cells = [...row.querySelectorAll("[role=gridcell]")].map((c) =>
        c.textContent.replace(/\\s+/g, " ").trim()
      );
      if (cells.length >= 2 && cells.some(Boolean)) rows.push(cells);
    });
    return rows;
  }

  function parsePanel(lines) {
    const iMP = lines.indexOf("Minha Posição");
    const iCAR = lines.indexOf("Características");
    const iEVO = lines.indexOf("Evolução do ativo");
    if (iMP < 0) return null;
    const mpRaw = lines
      .slice(iMP + 1, iCAR > iMP ? iCAR : iMP + 12)
      .filter((x) => x !== "Ver mais detalhes" && !mpL.includes(x));
    const carRaw = lines
      .slice(iCAR + 1, iEVO > iCAR ? iEVO : iCAR + 12)
      .filter((x) => x !== "Ver mais detalhes" && !carL.includes(x));
    const mp = {};
    mpL.forEach((l, i) => {
      if (mpRaw[i] !== undefined) mp[l] = mpRaw[i];
    });
    const car = {};
    carL.forEach((l, i) => {
      if (carRaw[i] !== undefined) car[l] = carRaw[i];
    });
    return { minhaPosicao: mp, caracteristicas: car };
  }

  function scrapeCollapses() {
    const out = {};
    const panels = [...document.querySelectorAll("div")].filter((d) => {
      const t = d.innerText || "";
      return t.includes("Minha Posição") && t.includes("Características") && t.length > 100 && t.length < 8000;
    });
    for (const panel of panels) {
      const lines = panel.innerText
        .split("\\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const nome = lines.find((l) => ASSET_RE.test(l));
      if (!nome) continue;
      const nomeIdx = lines.indexOf(nome);
      const pos = lines.slice(nomeIdx).find((l) => isBRL(l)) || "";
      const key = nome + "|" + pos;
      if (out[key]) continue;
      const det = parsePanel(lines);
      if (det) out[key] = { nome, posicaoRef: pos, ...det };
    }
    return out;
  }

  function parseListAssets() {
    const assets = [];
    let grupo = null;
    const xlsBtn = [...document.querySelectorAll("soma-button")].find((e) => (e.textContent || "").trim() === "XLS");
    if (xlsBtn) xlsBtn.click();
    const rows = scrapeXlsGrid();
    for (const cells of rows) {
      if (isGrupo(cells[0])) {
        grupo = cells[0];
        continue;
      }
      if (!ASSET_RE.test(cells[0])) continue;
      const brls = cells.filter(isBRL);
      const pcts = cells.filter(isPct);
      const taxas = cells.filter(isTaxa);
      const dates = cells.filter(isDate);
      assets.push({
        grupo,
        nome: cells[0],
        posicaoAtual: brls[0] || null,
        alocacaoPct: pcts[0] || null,
        valorAplicado: brls[1] || null,
        taxaCompra: taxas[0] || cells.find((f) => /%/.test(f)) || null,
        dataAplicacao: dates[0] || null,
        dataVencimento: dates[1] || null,
        _fonte: "xls-grid",
      });
    }
    return assets;
  }

  function scrapeFundos() {
    const items = [];
    document.querySelectorAll("a").forEach((a) => {
      const nome = a.textContent.trim();
      if (!FUND_RE.test(nome) || nome.length < 10) return;
      let el = a.parentElement;
      for (let i = 0; i < 15 && el; i++) {
        const t = el.innerText || "";
        if (t.includes("Valor aplicado") || (t.includes("Rentabilidade") && isBRL(t.split("\\n")[0]))) {
          const lines = t.split("\\n").map((x) => x.trim()).filter(Boolean);
          const brls = lines.filter(isBRL);
          const pcts = lines.filter((l) => /^\\d+,\\d{2}%$/.test(l));
          items.push({
            nome,
            posicaoAtual: brls[0],
            valorAplicado: brls[1] || brls[2],
            valorLiquido: brls[brls.length - 1],
            rentabilidadeLiquida: pcts[0],
            rentabilidadeBruta: pcts[1],
            _fonte: "collapse",
          });
          break;
        }
        el = el.parentElement;
      }
    });
    const seen = new Set();
    return items.filter((f) => {
      if (seen.has(f.nome)) return false;
      seen.add(f.nome);
      return true;
    });
  }

  const xlsBtn = [...document.querySelectorAll("soma-button")].find((e) => (e.textContent || "").trim() === "XLS");
  if (xlsBtn) xlsBtn.click();

  const xlsGrid = scrapeXlsGrid();
  const collapses = scrapeCollapses();
  const listFromXls = parseListAssets();

  const h2 = [...document.querySelectorAll("h2")];
  const saldoRF = h2.find((h) => h.textContent.trim() === "Renda Fixa")?.parentElement?.innerText?.match(/Saldo\\s*R\\$\\s*[\\d.,]+/)?.[0];
  const saldoFI = h2.find((h) => h.textContent.trim() === "Fundos de Investimentos")?.parentElement?.innerText?.match(/Saldo\\s*R\\$\\s*[\\d.,]+/)?.[0];

  return {
    scrapedAt: new Date().toISOString(),
    url: location.href,
    xls: { grid: xlsGrid, rowCount: xlsGrid.length },
    rendaFixa: { saldo: saldoRF, ativos: listFromXls, collapses },
    fundos: { saldo: saldoFI, itens: scrapeFundos() },
  };
}`;
