/* Accessible Gregorian dates for the three approved 2027 calendar editions.
   Complements the untouched artwork; never replaces or edits the original plates. */
(() => {
  "use strict";
  const title = document.getElementById("month-title");
  const side = document.querySelector(".month-side");
  const download = document.getElementById("save-page");
  if (!title || !side || !download || document.querySelector(".date-companion")) return;

  const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const panel = document.createElement("section");
  panel.className = "date-companion";
  panel.setAttribute("aria-label", "Readable 2027 calendar dates");

  const intro = document.createElement("p");
  intro.className = "date-companion-label";
  intro.textContent = "The dates / 2027";
  const table = document.createElement("table");
  table.className = "date-grid";
  const caption = document.createElement("caption");
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  weekdays.forEach((day) => {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = day.slice(0, 3);
    th.setAttribute("aria-label", day);
    headRow.appendChild(th);
  });
  head.appendChild(headRow);
  const body = document.createElement("tbody");
  table.append(caption, head, body);

  const note = document.createElement("p");
  note.className = "date-companion-note";
  note.textContent = "Monday-first Gregorian dates. Artwork is shown separately above.";
  const print = document.createElement("button");
  print.type = "button";
  print.className = "print-month";
  print.disabled = true;
  print.textContent = "Preparing artwork for print…";
  const thumbs = document.getElementById("month-thumbs");
  function syncPrintState() {
    const ready = !!thumbs && thumbs.querySelectorAll(".mini").length === 12;
    print.disabled = !ready;
    print.textContent = ready ? "Print this month's art + dates ↗" : "Preparing artwork for print…";
  }
  if (thumbs) new MutationObserver(syncPrintState).observe(thumbs, { childList: true });
  syncPrintState();
  print.addEventListener("click", () => { if (!print.disabled) window.print(); });
  panel.append(intro, table, note, print);
  side.insertBefore(panel, download);

  function render() {
    const index = months.findIndex((month) => title.textContent.trim() === month + " 2027");
    if (index === -1) return;
    caption.textContent = months[index] + " 2027";
    body.replaceChildren();
    const offset = (new Date(Date.UTC(2027, index, 1)).getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(2027, index + 1, 0)).getUTCDate();
    const weeks = Math.ceil((offset + days) / 7);
    for (let week = 0; week < weeks; week++) {
      const row = document.createElement("tr");
      for (let day = 0; day < 7; day++) {
        const date = week * 7 + day - offset + 1;
        const cell = document.createElement("td");
        if (date >= 1 && date <= days) {
          cell.textContent = String(date);
        } else {
          cell.setAttribute("aria-hidden", "true");
        }
        row.appendChild(cell);
      }
      body.appendChild(row);
    }
  }

  new MutationObserver(render).observe(title, { childList: true, characterData: true, subtree: true });
  render();
})();
