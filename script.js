var PROXY = "https://cors-anywhere.herokuapp.com/";
var API = "https://www.freetogame.com/api/games";

var gamesData = [];
var favorites = [];
var compareList = [];

var gamesContainer;
var favoritesContainer;
var compareContainer;
var searchInput;
var platformSelect;

window.onload = function () {
  gamesContainer = document.getElementById("games");
  favoritesContainer = document.getElementById("favorites");
  compareContainer = document.getElementById("compare");
  searchInput = document.getElementById("search");
  platformSelect = document.getElementById("platform");

  searchInput.onkeyup = function () {
    showFilteredGames();
  };

  platformSelect.onchange = function () {
    showFilteredGames();
  };

  loadGames();
  showFavorites();
  showCompare();
};

async function loadGames() {
  gamesContainer.innerHTML = "<p>Loading games...</p>";

  try {
    var response = await fetch(PROXY + API, {
      headers: { "X-Requested-With": "XMLHttpRequest" },
    });

    if (!response.ok) {
      gamesContainer.innerHTML =
        "<p>Something went wrong. Status: " + response.status + "</p>";
      return;
    }

    gamesData = await response.json();
    showAllGames(gamesData);
  } catch (error) {
    gamesContainer.innerHTML =
      "<p>Failed to load games. Visit <a href='https://cors-anywhere.herokuapp.com/corsdemo' target='_blank'>cors-anywhere.herokuapp.com/corsdemo</a> to enable the proxy, then refresh.</p>";
  }
}

function showAllGames(games) {
  gamesContainer.innerHTML = "";

  if (games.length === 0) {
    gamesContainer.innerHTML = "<p>No games found.</p>";
    return;
  }

  for (var i = 0; i < games.length; i++) {
    var game = games[i];

    var isFav = false;
    for (var j = 0; j < favorites.length; j++) {
      if (favorites[j].id === game.id) {
        isFav = true;
        break;
      }
    }

    var inCmp = false;
    for (var k = 0; k < compareList.length; k++) {
      if (compareList[k].id === game.id) {
        inCmp = true;
        break;
      }
    }

    var card = document.createElement("div");
    card.className = "card";

    var img = document.createElement("img");
    img.src = game.thumbnail;
    img.alt = game.title;
    img.loading = "lazy";

    var title = document.createElement("h3");
    title.innerText = game.title;

    var meta = document.createElement("p");
    meta.className = "card-meta";
    meta.innerText = game.genre + " · " + game.platform;

    var favBtn = document.createElement("button");
    favBtn.className = "btn-fav" + (isFav ? " active" : "");
    favBtn.innerText = isFav ? "★ Saved" : "☆ Favorite";
    favBtn.onclick = makeFavHandler(game.id);

    var cmpBtn = document.createElement("button");
    cmpBtn.className = "btn-cmp" + (inCmp ? " active" : "");
    cmpBtn.innerText = inCmp ? "⚖ Added" : "⚖ Compare";
    cmpBtn.onclick = makeCmpHandler(game.id);
    if (!inCmp && compareList.length >= 2) {
      cmpBtn.disabled = true;
      cmpBtn.title = "Remove a game first";
    }

    var actions = document.createElement("div");
    actions.className = "card-actions";
    actions.appendChild(favBtn);
    actions.appendChild(cmpBtn);

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(actions);

    gamesContainer.appendChild(card);
  }
}

function makeFavHandler(id) {
  return function () {
    toggleFavorite(id);
  };
}

function makeCmpHandler(id) {
  return function () {
    toggleCompare(id);
  };
}

function showFilteredGames() {
  var search = searchInput.value.toLowerCase();
  var platform = platformSelect.value.toLowerCase();
  var filtered = [];

  for (var i = 0; i < gamesData.length; i++) {
    var game = gamesData[i];
    var titleMatch = game.title.toLowerCase().indexOf(search) !== -1;
    var platformMatch =
      platform === "" || game.platform.toLowerCase().indexOf(platform) !== -1;

    if (titleMatch && platformMatch) {
      filtered.push(game);
    }
  }

  showAllGames(filtered);
}

function toggleFavorite(id) {
  var foundIndex = -1;
  for (var i = 0; i < favorites.length; i++) {
    if (favorites[i].id === id) {
      foundIndex = i;
      break;
    }
  }

  if (foundIndex >= 0) {
    favorites.splice(foundIndex, 1);
    showToast("Removed from favorites");
  } else {
    for (var j = 0; j < gamesData.length; j++) {
      if (gamesData[j].id === id) {
        favorites.push(gamesData[j]);
        showToast("Added to favorites ★");
        break;
      }
    }
  }

  showFavorites();
  showFilteredGames();
}

function showFavorites() {
  favoritesContainer.innerHTML = "";

  var header = document.createElement("div");
  header.className = "panel-header";
  header.innerText = "Favorites (" + favorites.length + ")";

  if (favorites.length > 0) {
    var clearBtn = document.createElement("button");
    clearBtn.className = "btn-clear";
    clearBtn.innerText = "Clear all";
    clearBtn.onclick = clearFavorites;
    header.appendChild(clearBtn);
  }

  favoritesContainer.appendChild(header);

  if (favorites.length === 0) {
    var msg = document.createElement("p");
    msg.className = "empty-msg";
    msg.innerText = "No favorites yet. Click ☆ on any game.";
    favoritesContainer.appendChild(msg);
    return;
  }

  for (var i = 0; i < favorites.length; i++) {
    var game = favorites[i];

    var item = document.createElement("div");
    item.className = "fav-item";

    var img = document.createElement("img");
    img.src = game.thumbnail;
    img.alt = game.title;

    var info = document.createElement("div");
    info.className = "fav-info";

    var name = document.createElement("span");
    name.className = "fav-title";
    name.innerText = game.title;

    var meta = document.createElement("span");
    meta.className = "fav-meta";
    meta.innerText = game.genre + " · " + game.platform;

    var removeBtn = document.createElement("button");
    removeBtn.className = "btn-remove";
    removeBtn.innerText = "✕";
    removeBtn.title = "Remove";
    removeBtn.onclick = makeFavHandler(game.id);

    info.appendChild(name);
    info.appendChild(meta);
    item.appendChild(img);
    item.appendChild(info);
    item.appendChild(removeBtn);
    favoritesContainer.appendChild(item);
  }
}

function clearFavorites() {
  var sure = confirm("Clear all favorites?");
  if (!sure) return;
  favorites = [];
  showFavorites();
  showFilteredGames();
  showToast("Favorites cleared");
}

function toggleCompare(id) {
  var foundIndex = -1;
  for (var i = 0; i < compareList.length; i++) {
    if (compareList[i].id === id) {
      foundIndex = i;
      break;
    }
  }

  if (foundIndex >= 0) {
    compareList.splice(foundIndex, 1);
    showToast("Removed from compare");
  } else {
    if (compareList.length >= 2) {
      showToast("Remove a game first (max 2)");
      return;
    }
    for (var j = 0; j < gamesData.length; j++) {
      if (gamesData[j].id === id) {
        compareList.push(gamesData[j]);
        showToast("Added to compare ⚖");
        break;
      }
    }
  }

  showCompare();
  showFilteredGames();
}

function showCompare() {
  compareContainer.innerHTML = "";

  var header = document.createElement("div");
  header.className = "panel-header";
  header.innerText = "Compare (" + compareList.length + "/2)";

  if (compareList.length > 0) {
    var clearBtn = document.createElement("button");
    clearBtn.className = "btn-clear";
    clearBtn.innerText = "Clear";
    clearBtn.onclick = clearCompare;
    header.appendChild(clearBtn);
  }

  compareContainer.appendChild(header);

  if (compareList.length === 0) {
    var msg = document.createElement("p");
    msg.className = "empty-msg";
    msg.innerText = "Select up to 2 games to compare.";
    compareContainer.appendChild(msg);
    return;
  }

  var table = document.createElement("div");
  table.className = "compare-table";

  var colHeaders = document.createElement("div");
  colHeaders.className = "compare-col-headers";

  for (var i = 0; i < compareList.length; i++) {
    var g = compareList[i];

    var col = document.createElement("div");
    col.className = "compare-col-header";

    var img = document.createElement("img");
    img.src = g.thumbnail;
    img.alt = g.title;

    var name = document.createElement("strong");
    name.innerText = g.title;

    var removeBtn = document.createElement("button");
    removeBtn.className = "btn-remove";
    removeBtn.innerText = "✕";
    removeBtn.title = "Remove";
    removeBtn.onclick = makeCmpHandler(g.id);

    col.appendChild(img);
    col.appendChild(name);
    col.appendChild(removeBtn);
    colHeaders.appendChild(col);
  }

  table.appendChild(colHeaders);

  var fields = ["genre", "platform", "publisher", "developer", "release_date"];
  var labels = ["Genre", "Platform", "Publisher", "Developer", "Release Date"];

  for (var f = 0; f < fields.length; f++) {
    var row = document.createElement("div");
    row.className = "compare-row";

    var label = document.createElement("div");
    label.className = "compare-row-label";
    label.innerText = labels[f];
    row.appendChild(label);

    var val1 = compareList[0][fields[f]] || "N/A";
    var val2 =
      compareList.length === 2 ? compareList[1][fields[f]] || "N/A" : null;
    var isMatch = compareList.length === 2 && val1 === val2;

    for (var c = 0; c < compareList.length; c++) {
      var cell = document.createElement("div");
      cell.className = "compare-cell";
      if (compareList.length === 2) {
        cell.className += isMatch ? " match" : " diff";
      }
      cell.innerText = compareList[c][fields[f]] || "N/A";
      row.appendChild(cell);
    }

    table.appendChild(row);
  }

  compareContainer.appendChild(table);

  if (compareList.length === 1) {
    var hint = document.createElement("p");
    hint.className = "empty-msg hint";
    hint.innerText = "Pick one more game to compare side-by-side.";
    compareContainer.appendChild(hint);
  }
}

function clearCompare() {
  compareList = [];
  showCompare();
  showFilteredGames();
  showToast("Compare cleared");
}

function showToast(msg) {
  var toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }

  toast.innerText = msg;
  toast.classList.add("show");

  clearTimeout(toast._timer);
  toast._timer = setTimeout(function () {
    toast.classList.remove("show");
  }, 2500);
}
