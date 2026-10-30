/* The Impossible Studio — 2027 calendars.
   Shared by the three edition pages (data-view="detail") and their
   print-ready A4 sets (data-view="print").

   The twelve original artwork pages are never redrawn: they are cropped
   read-only out of the 3 x 4 sprite at full resolution. The date grid is a
   second, machine-readable copy of the same 2027 month so the calendar is
   selectable, printable and reachable with a screen reader. */

const months = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const YEAR = 2027;

const editions = {
  "roots-2027": { title: "ROOTS", subtitle: "Africa / 2027", edition: "People · Place · Living culture", lead: "A powerful visual journey through twelve countries, pairing cinematic image-making with stories of craft, landscape and living cultural practice.", colors: "#b18a5c", countries: ["Kenya", "Morocco", "Ghana", "Ethiopia", "Nigeria", "South Africa", "Tanzania", "Rwanda", "Senegal", "Namibia", "Uganda", "Egypt"], traditions: ["Maasai beadwork", "Zellij tilework", "Drum traditions", "Coffee ceremony", "Gele headwrap", "Fynbos and land", "Swahili coastal sailing", "Basket weaving", "Painted pirogues", "Desert landscapes", "Crowned crane", "Ancient stone carving"] },
  "atlas-africa-2027": { title: "ATLAS OF AFRICA", subtitle: "Traditions / 2027", edition: "Traditions · Materials · Memory", lead: "A contemporary exploration of materials, meaningful making and artistic traditions across twelve distinct African places.", colors: "#a87b50", countries: ["Kenya", "Morocco", "Ethiopia", "Ghana", "Senegal", "Tanzania", "Egypt", "Namibia", "Nigeria", "Rwanda", "South Africa", "Zimbabwe"], traditions: ["Adornment and identity", "Architecture and craft", "Coffee and community", "Kente and heritage", "Rhythm and movement", "Landscapes and life", "Stone and memory", "People and landscape", "Benin bronze art", "Basket artistry", "Table Mountain and craft", "Great Zimbabwe"] },
  "heritage-africa-2027": { title: "ATLAS OF AFRICA", subtitle: "The editorial edition / 2027", edition: "Twelve places · Twelve stories", lead: "An immersive editorial celebration of image, place and living heritage, composed like a collectible art magazine that happens to be a calendar.", colors: "#b57a55", countries: ["Kenya", "Morocco", "Ethiopia", "Ghana", "Senegal", "Namibia", "Tanzania", "Nigeria", "Egypt", "South Africa", "Uganda", "Rwanda"], traditions: ["Beadwork and identity", "Architecture and ornament", "Coffee culture", "Kente weaving", "Music and rhythm", "Desert and living heritage", "Mountain and community", "Edo court arts", "The Nile and the felucca", "Protea and botanical heritage", "Barkcloth making", "Architecture and material"] }
};

const el = (id) => document.getElementById(id);
const edition = document.body.dataset.edition;

/* Real 2027 month shape, computed rather than copied from the artwork. */
function monthShape(monthIndex) {
  const first = new Date(Date.UTC(YEAR, monthIndex, 1));
  const leading = (first.getUTCDay() + 6) % 7;                 // Monday-first offset
  const days = new Date(Date.UTC(YEAR, monthIndex + 1, 0)).getUTCDate();
  const rows = Math.ceil((leading + days) / 7);
  return { leading: leading, days: days, rows: rows };
}

function buildDateGrid(monthIndex, config) {
  const shape = monthShape(monthIndex);
  const table = document.createElement("table");
  table.className = "dategrid";

  const caption = document.createElement("caption");
  caption.textContent = months[monthIndex] + " " + YEAR + " · " + config.countries[monthIndex];
  table.appendChild(caption);

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  weekdays.forEach((name) => {
    const th = document.createElement("th");
    th.scope = "col";
    th.innerHTML = "<span>" + name.slice(0, 3) + "</span><span class=\"long\">" + name + "</span>";
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  let day = 1;
  for (let row = 0; row < shape.rows; row++) {
    const tr = document.createElement("tr");
    for (let col = 0; col < 7; col++) {
      const cell = document.createElement("td");
      const inMonth = row * 7 + col >= shape.leading && day <= shape.days;
      if (inMonth) {
        cell.textContent = String(day);
        if (col > 4) cell.className = "weekend";
        cell.setAttribute("aria-label", weekdays[col] + " " + day + " " + months[monthIndex] + " " + YEAR);
        day++;
      } else {
        cell.className = "empty";
        cell.setAttribute("aria-hidden", "true");
      }
      tr.appendChild(cell);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  return table;
}

if (edition && editions[edition]) {
  const config = editions[edition];
  const view = document.body.dataset.view || "detail";
  /* Print sets live one directory deeper (/<edition>/print/). */
  const base = (view === "print" ? "../../media/" : "../media/") + edition + "/";
  const sprite = new Image();
  sprite.decoding = "async";
  sprite.src = base + "month-sprite-highres.webp";
  let current = 0;

  function crop(ctx, i, w, h) {
    if (!sprite.complete || !sprite.naturalWidth) return false;
    const cw = sprite.naturalWidth / 3, ch = sprite.naturalHeight / 4;
    ctx.drawImage(sprite, (i % 3) * cw, Math.floor(i / 3) * ch, cw, ch, 0, 0, w, h);
    return true;
  }

  if (view === "detail") {
    document.title = config.title + " · " + config.subtitle + " | The Impossible Studio";
    el("category").textContent = config.edition;
    el("name").textContent = config.title;
    el("subtitle").textContent = config.subtitle;
    el("lead").textContent = config.lead;
    el("presentation").src = base + "presentation.webp";
    el("full-sheet").src = base + "all-12-months.jpg";
    el("presentation").alt = config.title + " complete 2027 calendar presentation";
    el("full-sheet").alt = "All twelve 2027 monthly pages for " + config.title + " on one sheet";
    const pageNum = el("page-num"), monthTitle = el("month-title");
    const monthCountry = el("month-country"), monthTradition = el("month-tradition");
    const gridHost = el("date-grid"), gridTitle = el("grid-title");

    function monthFromHash() {
      const hash = decodeURIComponent(window.location.hash.replace("#", "")).toLowerCase();
      if (!hash) return -1;
      let index = months.findIndex((m) => hash === m.toLowerCase() + "-" + YEAR || hash === m.toLowerCase());
      if (index === -1 && /^\d{1,2}$/.test(hash)) index = Number(hash) - 1;
      return index >= 0 && index <= 11 ? index : -1;
    }

    function show(i, push) {
      if (i < 0 || i > 11) return;
      current = i;
      monthTitle.textContent = months[i] + " " + YEAR;
      monthCountry.textContent = config.countries[i];
      monthTradition.textContent = config.traditions[i];
      pageNum.textContent = String(i + 1).padStart(2, "0") + " / 12";
      const canvas = el("month-canvas");
      const pageWidth = Math.round(sprite.naturalWidth / 3), pageHeight = Math.round(sprite.naturalHeight / 4);
      canvas.width = pageWidth;
      canvas.height = pageHeight;
      const context = canvas.getContext("2d");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      crop(context, i, pageWidth, pageHeight);
      canvas.setAttribute("aria-label", months[i] + " " + YEAR + " calendar page for " + config.title + ": " + config.countries[i] + ", " + config.traditions[i]);
      if (gridHost) {
        gridHost.textContent = "";
        gridHost.appendChild(buildDateGrid(i, config));
        if (gridTitle) gridTitle.textContent = months[i] + " " + YEAR;
      }
      el("prev").disabled = i === 0;
      el("next").disabled = i === 11;
      document.querySelectorAll(".mini").forEach((button, n) => {
        button.classList.toggle("active", n === i);
        button.setAttribute("aria-pressed", n === i ? "true" : "false");
      });
      const slug = months[i].toLowerCase() + "-" + YEAR;
      if (push && window.location.hash !== "#" + slug && window.history.replaceState) {
        window.history.replaceState(null, "", "#" + slug);
      }
    }

    sprite.onload = () => {
      const thumbs = el("month-thumbs");
      for (let i = 0; i < 12; i++) {
        const button = document.createElement("button");
        button.className = "mini";
        button.type = "button";
        button.title = months[i] + " · " + config.countries[i];
        button.setAttribute("aria-label", "Show " + months[i] + " " + YEAR + ", " + config.countries[i]);
        const thumb = document.createElement("canvas");
        thumb.width = 112;
        thumb.height = 159;
        crop(thumb.getContext("2d"), i, 112, 159);
        button.appendChild(thumb);
        button.onclick = () => show(i, true);
        thumbs.appendChild(button);
      }
      const fromHash = monthFromHash();
      show(fromHash === -1 ? 0 : fromHash, false);
    };
    sprite.onerror = () => {
      monthTradition.textContent = "The monthly artwork could not be loaded. Please refresh.";
      if (gridHost) {
        gridHost.textContent = "";
        gridHost.appendChild(buildDateGrid(current, config));
      }
    };
    el("prev").onclick = () => show(current - 1, true);
    el("next").onclick = () => show(current + 1, true);
    window.addEventListener("hashchange", () => {
      const index = monthFromHash();
      if (index !== -1 && index !== current) show(index, false);
    });
    // Arrow keys belong to the month controls, not to the entire document.
    // This preserves normal page scrolling and editing shortcuts elsewhere.
    document.addEventListener("keydown", (event) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      const target = event.target;
      if (!target || typeof target.closest !== "function") return;
      if (!target.closest(".navmonths, .month-mini")) return;
      if (target.closest("input, textarea, select, [contenteditable]")) return;
      if (!sprite.complete || !sprite.naturalWidth) return;
      const nextMonth = current + (event.key === "ArrowLeft" ? -1 : 1);
      if (nextMonth < 0 || nextMonth > 11) return;
      event.preventDefault();
      show(nextMonth, true);
    });
    el("save-page").onclick = () => {
      if (!sprite.complete || !sprite.naturalWidth) return;
      const link = document.createElement("a");
      link.href = el("month-canvas").toDataURL("image/png");
      link.download = edition + "-" + String(current + 1).padStart(2, "0") + "-" + months[current].toLowerCase() + "-" + YEAR + ".png";
      link.click();
    };
    const other = Object.keys(editions).filter((slug) => slug !== edition);
    el("other").innerHTML = other.map((slug) => '<a href="../' + slug + '/"><img src="../media/' + slug + '/presentation.webp" alt="' + editions[slug].title + ' presentation"><span><b>' + editions[slug].title + '</b><small>' + editions[slug].subtitle + ' ↗</small></span></a>').join("");
  }

  if (view === "print") {
    document.title = config.title + " 2027 print-ready set (A4, 12 pages) | The Impossible Studio";
    const deck = el("print-deck");
    const heading = el("print-name");
    if (heading) heading.textContent = config.title + " · " + config.subtitle;
    const intro = el("print-lead");
    if (intro) intro.textContent = config.lead;
    const sheetLink = el("print-full-sheet");
    if (sheetLink) sheetLink.href = base + "all-12-months.jpg";
    const sheetPresentation = el("print-presentation");
    if (sheetPresentation) sheetPresentation.href = base + "presentation.webp";

    sprite.onload = () => {
      for (let i = 0; i < 12; i++) {
        const page = document.createElement("section");
        page.className = "print-page";
        page.setAttribute("aria-label", months[i] + " " + YEAR + " calendar page");
        const image = document.createElement("img");
        image.src = base + "month-sprite-highres.webp";
        image.alt = months[i] + " " + YEAR + " calendar page: " + config.countries[i] + ", " + config.traditions[i];
        image.loading = i < 2 ? "eager" : "lazy";
        image.decoding = "async";
        image.style.left = "-" + (i % 3) * 100 + "%";
        image.style.top = "-" + Math.floor(i / 3) * 100 + "%";
        const note = document.createElement("span");
        note.className = "sr-only";
        note.textContent = "Page " + (i + 1) + " of 12 · " + months[i] + " " + YEAR + " · " + config.countries[i] + " · " + config.traditions[i];
        page.appendChild(image);
        page.appendChild(note);
        deck.appendChild(page);
      }
    };
  }

  document.querySelectorAll("[data-print]").forEach((button) => {
    if (view === "print") {
      /* Make sure every sheet is decoded before the print dialog opens. */
      button.addEventListener("click", async () => {
        const sheets = Array.from(document.querySelectorAll("#print-deck img"));
        sheets.forEach((image) => { image.loading = "eager"; });
        await Promise.all(sheets.map((image) => (image.decode ? image.decode().catch(() => {}) : Promise.resolve())));
        window.print();
      });
    } else {
      button.addEventListener("click", () => window.print());
    }
  });
}
