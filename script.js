const PROXY = "https://cors-anywhere.herokuapp.com/";
const API = "https://www.freetogame.com/api/games";

let gamesData = [];
let favorites = [];
let compareList = [];

window.addEventListener("DOMContentLoaded", () => {
  try {
    favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  } catch {
    favorites = [];
  }

  const gamesContainer = document.getElementById("games");
  const favoritesContainer = document.getElementById("favorites");
  const compareContainer = document.getElementById("compare");
  const searchInput = document.getElementById("search");
  const platformSelect = document.getElementById("platform");

  async function fetchGames() {
    try {
      gamesContainer.innerHTML = "<p class='loading'>Loading games…</p>";
      const res = await fetch(PROXY + API, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      gamesData = await res.json();
      displayGames(gamesData);
    } catch (err) {
      gamesContainer.innerHTML =
        "<p>Failed to load games. Visit <a href='https://cors-anywhere.herokuapp.com/corsdemo' target='_blank'>cors-anywhere.herokuapp.com/corsdemo</a> to enable the proxy, then refresh.</p>";
    }
  }

  function getFiltered() {
    const search = searchInput.value.trim().toLowerCase();
    const platform = platformSelect.value.toLowerCase();
    return gamesData.filter((game) => {
      const matchSearch = !search || game.title.toLowerCase().includes(search);
      const matchPlatform =
        !platform || game.platform.toLowerCase().includes(platform);
      return matchSearch && matchPlatform;
    });
  }

  function displayGames(games) {
    gamesContainer.innerHTML = "";
    if (games.length === 0) {
      gamesContainer.innerHTML = "<p>No games found 😢</p>";
      return;
    }
    games.forEach((game) => {
      const isFav = favorites.some((f) => f.id === game.id);
      const inCmp = compareList.some((c) => c.id === game.id);

      const div = document.createElement("div");
      div.className = "card";
      div.dataset.id = game.id;
      div.innerHTML = `
        <img src="${game.thumbnail}" alt="${game.title}" loading="lazy" />
        <h3>${game.title}</h3>
        <p class="card-meta">${game.genre} · ${game.platform}</p>
        <div class="card-actions">
          <button class="btn-fav ${isFav ? "active" : ""}" onclick="toggleFavorite(${game.id})">
            ${isFav ? "★ Saved" : "☆ Favorite"}
          </button>
          <button class="btn-cmp ${inCmp ? "active" : ""}" onclick="toggleCompare(${game.id})" ${!inCmp && compareList.length >= 2 ? "disabled title='Remove a game first'" : ""}>
            ${inCmp ? "⚖ Added" : "⚖ Compare"}
          </button>
        </div>
      `;
      gamesContainer.appendChild(div);
    });
  }

  window.toggleFavorite = function (id) {
    const index = favorites.findIndex((f) => f.id === id);
    if (index >= 0) {
      favorites.splice(index, 1);
      showToast("Removed from favorites");
    } else {
      const game = gamesData.find((g) => g.id === id);
      if (game) {
        favorites.push(game);
        showToast("Added to favorites ★");
      }
    }
    try {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    } catch {}
    renderFavorites();
    displayGames(getFiltered());
  };

  function renderFavorites() {
    favoritesContainer.innerHTML = "";

    const header = document.createElement("div");
    header.className = "panel-header";
    header.innerHTML = `
      <span>Favorites <span class="badge">${favorites.length}</span></span>
      ${favorites.length > 0 ? `<button class="btn-clear" onclick="clearFavorites()">Clear all</button>` : ""}
    `;
    favoritesContainer.appendChild(header);

    if (favorites.length === 0) {
      favoritesContainer.insertAdjacentHTML(
        "beforeend",
        "<p class='empty-msg'>No favorites yet. Click ☆ on any game.</p>",
      );
      return;
    }

    const list = document.createElement("div");
    list.className = "fav-list";

    favorites.forEach((game) => {
      const div = document.createElement("div");
      div.className = "fav-item";
      div.innerHTML = `
        <img src="${game.thumbnail}" alt="${game.title}" />
        <div class="fav-info">
          <span class="fav-title">${game.title}</span>
          <span class="fav-meta">${game.genre} · ${game.platform}</span>
        </div>
        <button class="btn-remove" onclick="toggleFavorite(${game.id})" title="Remove">✕</button>
      `;
      list.appendChild(div);
    });

    favoritesContainer.appendChild(list);
  }

  window.clearFavorites = function () {
    if (!confirm("Clear all favorites?")) return;
    favorites = [];
    try {
      localStorage.removeItem("favorites");
    } catch {}
    renderFavorites();
    displayGames(getFiltered());
    showToast("Favorites cleared");
  };

  window.toggleCompare = function (id) {
    const index = compareList.findIndex((c) => c.id === id);
    if (index >= 0) {
      compareList.splice(index, 1);
      showToast("Removed from compare");
    } else {
      if (compareList.length >= 2) {
        showToast("Remove a game first (max 2)", "warn");
        return;
      }
      const game = gamesData.find((g) => g.id === id);
      if (game) {
        compareList.push(game);
        showToast("Added to compare ⚖");
      }
    }
    renderCompare();
    displayGames(getFiltered());
  };

  function renderCompare() {
    compareContainer.innerHTML = "";

    const header = document.createElement("div");
    header.className = "panel-header";
    header.innerHTML = `
      <span>Compare <span class="badge">${compareList.length}/2</span></span>
      ${compareList.length > 0 ? `<button class="btn-clear" onclick="clearCompare()">Clear</button>` : ""}
    `;
    compareContainer.appendChild(header);

    if (compareList.length === 0) {
      compareContainer.insertAdjacentHTML(
        "beforeend",
        "<p class='empty-msg'>Select up to 2 games to compare.</p>",
      );
      return;
    }

    const table = document.createElement("div");
    table.className = "compare-table";

    const colHeaders = document.createElement("div");
    colHeaders.className = "compare-col-headers";
    colHeaders.innerHTML = compareList
      .map(
        (g) => `
      <div class="compare-col-header">
        <img src="${g.thumbnail}" alt="${g.title}" />
        <strong>${g.title}</strong>
        <button class="btn-remove" onclick="toggleCompare(${g.id})" title="Remove">✕</button>
      </div>
    `,
      )
      .join("");
    table.appendChild(colHeaders);

    const fields = [
      { label: "Genre", key: "genre" },
      { label: "Platform", key: "platform" },
      { label: "Publisher", key: "publisher" },
      { label: "Developer", key: "developer" },
      { label: "Release Date", key: "release_date" },
    ];

    fields.forEach(({ label, key }) => {
      const row = document.createElement("div");
      row.className = "compare-row";

      const values = compareList.map((g) => g[key] || "N/A");
      const match = compareList.length === 2 && values[0] === values[1];

      row.innerHTML = `
        <div class="compare-row-label">${label}</div>
        ${compareList
          .map(
            (g) => `
          <div class="compare-cell ${compareList.length === 2 ? (match ? "match" : "diff") : ""}">
            ${g[key] || "N/A"}
          </div>
        `,
          )
          .join("")}
      `;
      table.appendChild(row);
    });

    compareContainer.appendChild(table);

    if (compareList.length === 1) {
      compareContainer.insertAdjacentHTML(
        "beforeend",
        "<p class='empty-msg hint'>Pick one more game to compare side-by-side.</p>",
      );
    }
  }

  window.clearCompare = function () {
    compareList = [];
    renderCompare();
    displayGames(getFiltered());
    showToast("Compare cleared");
  };

  function showToast(msg, type = "info") {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      document.body.appendChild(toast);

      const style = document.createElement("style");
      style.textContent = `
        #toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(40px);
          background: #1e1e2e; color: #fff; padding: 10px 20px; border-radius: 8px;
          font-size: 14px; opacity: 0; transition: opacity .3s, transform .3s;
          z-index: 9999; pointer-events: none; white-space: nowrap;
          border-left: 4px solid #7c5cfc;
        }
        #toast.warn { border-left-color: #f5a623; }
        #toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

        .panel-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; font-weight:600; }
        .badge { background:#7c5cfc; color:#fff; border-radius:999px; padding:1px 8px; font-size:12px; margin-left:6px; }
        .btn-clear { background:none; border:1px solid #ccc; border-radius:6px; padding:2px 10px; cursor:pointer; font-size:12px; }
        .btn-clear:hover { background:#fee; border-color:#e00; color:#e00; }
        .empty-msg { color:#888; font-size:14px; font-style:italic; }
        .hint { color:#7c5cfc; }

        .fav-list { display:flex; flex-direction:column; gap:8px; }
        .fav-item { display:flex; align-items:center; gap:10px; background:#f9f9f9; border-radius:8px; padding:6px 8px; }
        .fav-item img { width:48px; height:32px; object-fit:cover; border-radius:4px; flex-shrink:0; }
        .fav-info { flex:1; min-width:0; }
        .fav-title { font-size:13px; font-weight:600; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .fav-meta { font-size:11px; color:#888; }
        .btn-remove { background:none; border:none; cursor:pointer; color:#aaa; font-size:14px; padding:2px 6px; border-radius:4px; flex-shrink:0; }
        .btn-remove:hover { color:#e00; background:#fee; }

        .compare-table { font-size:13px; }
        .compare-col-headers { display:grid; grid-template-columns: repeat(2, 1fr); gap:8px; margin-bottom:12px; }
        .compare-col-header { background:#f3f0ff; border-radius:8px; padding:8px; text-align:center; position:relative; }
        .compare-col-header img { width:100%; height:70px; object-fit:cover; border-radius:6px; margin-bottom:6px; }
        .compare-col-header strong { display:block; font-size:12px; }
        .compare-col-header .btn-remove { position:absolute; top:4px; right:4px; }
        .compare-row { display:grid; grid-template-columns: 80px repeat(2, 1fr); gap:4px; margin-bottom:4px; }
        .compare-row-label { font-weight:600; color:#555; display:flex; align-items:center; font-size:12px; }
        .compare-cell { background:#f9f9f9; border-radius:6px; padding:5px 8px; text-align:center; font-size:12px; }
        .compare-cell.match { background:#eaffea; color:#1a7a1a; }
        .compare-cell.diff { background:#fff8e8; color:#7a5a00; }

        .btn-fav.active { background:#fffbe6; color:#c8a000; border-color:#f5d000; }
        .btn-cmp.active { background:#f0eeff; color:#5c3fcc; border-color:#b09dff; }
      `;
      document.head.appendChild(style);
    }

    toast.textContent = msg;
    toast.className = type === "warn" ? "warn" : "";
    void toast.offsetWidth; // reflow
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), 2500);
  }

  let searchTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => displayGames(getFiltered()), 300);
  });
  platformSelect.addEventListener("change", () => displayGames(getFiltered()));

  fetchGames();
  renderFavorites();
  renderCompare();
});