// app.js
const CATEGORIES = ["All", "Idle", "Tycoon", "Simulators", "Popular", "Apps"];

const ITEMS = [
  // Idle
  { id:"cookieclicker", name:"Cookie Clicker", type:"game", category:"Idle", platform:"web", tags:["idle","classic"], url:"https://orteil.dashnet.org/cookieclicker/" },
  { id:"kittens", name:"Kittens Game", type:"game", category:"Idle", platform:"web", tags:["idle","strategy"], url:"https://kittensgame.com/web/" },

  // Tycoon
  { id:"openttd", name:"OpenTTD", type:"game", category:"Tycoon", platform:"pc", tags:["tycoon","transport"], url:"https://www.openttd.org/" },
  { id:"unknown", name:"Add more tycoons here", type:"game", category:"Tycoon", platform:"web", tags:["placeholder"], url:"https://example.com" },

  // Simulators
  { id:"geoguessr", name:"GeoGuessr", type:"game", category:"Simulators", platform:"web", tags:["geo","sim"], url:"https://www.geoguessr.com/" },
  { id:"krunker", name:"Krunker", type:"game", category:"Popular", platform:"web", tags:["fps","fast"], url:"https://krunker.io/" },

  // Popular
  { id:"fortnite", name:"Fortnite", type:"game", category:"Popular", platform:"pc", tags:["popular","battle"], url:"https://www.fortnite.com/" },
  { id:"minecraft", name:"Minecraft", type:"game", category:"Popular", platform:"pc", tags:["survival","build"], url:"https://www.minecraft.net/" },

  // Apps
  { id:"chatgpt", name:"ChatGPT", type:"app", category:"Apps", platform:"web", tags:["ai","chat"], url:"https://chatgpt.com/" },
  { id:"youtube", name:"YouTube", type:"app", category:"Apps", platform:"web", tags:["video"], url:"https://www.youtube.com/" },
  { id:"spotify", name:"Spotify Web", type:"app", category:"Apps", platform:"web", tags:["music"], url:"https://open.spotify.com/" },
  { id:"discord", name:"Discord", type:"app", category:"Apps", platform:"web", tags:["community"], url:"https://discord.com/app" },
];

const el = (id) => document.getElementById(id);

const state = {
  tab: "All",
  search: "",
  platform: "all",
  sort: "featured",
  showFavs: false,
  tag: null,
};

const LS_KEY = "voidvault_favs_v1";
const favs = new Set(JSON.parse(localStorage.getItem(LS_KEY) || "[]"));

function saveFavs(){
  localStorage.setItem(LS_KEY, JSON.stringify([...favs]));
  el("countFavs").textContent = favs.size;
}

function makeTabs(){
  const wrap = el("tabs");
  wrap.innerHTML = "";
  CATEGORIES.forEach(cat=>{
    const b = document.createElement("button");
    b.className = "tab" + (state.tab===cat ? " active":"");
    b.textContent = cat;
    b.onclick = ()=>{
      state.tab = cat;
      state.showFavs = false;
      el("toggleFavs").classList.remove("active");
      render();
      makeTabs();
    };
    wrap.appendChild(b);
  });
}

function uniqueTags(items){
  const set = new Set();
  items.forEach(i => (i.tags||[]).forEach(t=>set.add(t)));
  return [...set].sort((a,b)=>a.localeCompare(b)).slice(0, 14);
}

function makeQuickTags(){
  const tags = uniqueTags(ITEMS);
  const wrap = el("quickTags");
  wrap.innerHTML = "";
  tags.forEach(t=>{
    const p = document.createElement("button");
    p.className = "pill";
    p.textContent = `#${t}`;
    p.onclick = ()=>{
      state.tag = (state.tag === t) ? null : t;
      render();
      updatePills();
    };
    wrap.appendChild(p);
  });
}

function updatePills(){
  // Hero pills active state
  const pills = document.querySelectorAll(".heroChips .pill");
  pills.forEach(p=>{
    const t = p.textContent.replace("#","");
    p.classList.toggle("active", state.tag === t);
  });

  // Pill bar (shows current filters)
  const bar = el("pillBar");
  const pillsData = [];
  if (state.showFavs) pillsData.push({label:"Favorites", clear:()=>{state.showFavs=false;}});
  if (state.tab !== "All") pillsData.push({label:`Category: ${state.tab}`, clear:()=>{state.tab="All";}});
  if (state.platform !== "all") pillsData.push({label:`Platform: ${state.platform}`, clear:()=>{state.platform="all";}});
  if (state.tag) pillsData.push({label:`Tag: #${state.tag}`, clear:()=>{state.tag=null;}});
  if (state.search.trim()) pillsData.push({label:`Search: "${state.search.trim()}"`, clear:()=>{state.search=""; el("search").value="";}});

  bar.innerHTML = "";
  pillsData.forEach(p=>{
    const btn = document.createElement("button");
    btn.className = "pill active";
    btn.textContent = `${p.label}  ✕`;
    btn.onclick = ()=>{
      p.clear();
      render();
      makeTabs();
      updatePills();
    };
    bar.appendChild(btn);
  });
}

function getFiltered(){
  let list = [...ITEMS];

  if (state.showFavs){
    list = list.filter(i => favs.has(i.id));
  }
  if (state.tab !== "All"){
    list = list.filter(i => i.category === state.tab);
  }
  if (state.platform !== "all"){
    list = list.filter(i => i.platform === state.platform);
  }
  const q = state.search.trim().toLowerCase();
  if (q){
    list = list.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.category||"").toLowerCase().includes(q) ||
      (i.tags||[]).some(t=>t.toLowerCase().includes(q))
    );
  }
  if (state.tag){
    list = list.filter(i => (i.tags||[]).includes(state.tag));
  }

  if (state.sort === "az") list.sort((a,b)=>a.name.localeCompare(b.name));
  if (state.sort === "za") list.sort((a,b)=>b.name.localeCompare(a.name));
  // "featured" keeps original order

  return list;
}

function card(item){
  const c = document.createElement("div");
  c.className = "card";

  const head = document.createElement("div");
  head.className = "cardHead";

  const left = document.createElement("div");
  left.innerHTML = `
    <div class="cardTitle">${item.name}</div>
    <div class="cardMeta">${item.category} • ${item.type.toUpperCase()} • ${item.platform.toUpperCase()}</div>
  `;

  const favBtn = document.createElement("button");
  favBtn.className = "iconBtn" + (favs.has(item.id) ? " faved":"");
  favBtn.title = favs.has(item.id) ? "Unfavorite" : "Favorite";
  favBtn.textContent = favs.has(item.id) ? "★" : "☆";
  favBtn.onclick = ()=>{
    if (favs.has(item.id)) favs.delete(item.id);
    else favs.add(item.id);
    saveFavs();
    render();
  };

  head.appendChild(left);
  head.appendChild(favBtn);

  const badges = document.createElement("div");
  badges.className = "badges";
  (item.tags||[]).slice(0,4).forEach(t=>{
    const b = document.createElement("span");
    b.className = "badge";
    b.textContent = `#${t}`;
    badges.appendChild(b);
  });

  const actions = document.createElement("div");
  actions.className = "cardActions";

  const a = document.createElement("a");
  a.className = "btn primary";
  a.href = item.url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.textContent = "Open";

  const copy = document.createElement("button");
  copy.className = "btn";
  copy.textContent = "Copy Link";
  copy.onclick = async ()=>{
    try{
      await navigator.clipboard.writeText(item.url);
      copy.textContent = "Copied";
      setTimeout(()=>copy.textContent="Copy Link", 900);
    }catch{
      copy.textContent = "No Clipboard";
      setTimeout(()=>copy.textContent="Copy Link", 900);
    }
  };

  actions.appendChild(a);
  actions.appendChild(copy);

  c.appendChild(head);
  c.appendChild(badges);
  c.appendChild(actions);

  return c;
}

function render(){
  const list = getFiltered();
  const wrap = el("cards");
  wrap.innerHTML = "";
  list.forEach(i => wrap.appendChild(card(i)));

  el("countItems").textContent = ITEMS.length;
  el("countFavs").textContent = favs.size;

  el("empty").classList.toggle("hidden", list.length !== 0);
  updatePills();
}

function wire(){
  el("search").addEventListener("input", (e)=>{
    state.search = e.target.value;
    render();
  });

  el("clearSearch").onclick = ()=>{
    state.search = "";
    el("search").value = "";
    render();
  };

  el("toggleFavs").onclick = ()=>{
    state.showFavs = !state.showFavs;
    render();
  };

  el("sort").addEventListener("change", (e)=>{
    state.sort = e.target.value;
    render();
  });

  el("platform").addEventListener("change", (e)=>{
    state.platform = e.target.value;
    render();
  });
}

makeTabs();
makeQuickTags();
wire();
saveFavs();
render();
