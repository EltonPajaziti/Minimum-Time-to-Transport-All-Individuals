// =================== ICON CONFIG (update these paths if needed) ===================
const SUN_ICON_SRC    = "/Images/sun.png";
const RAIN_ICON_SRC   = "/Images/rain.png";
const SNOW_ICON_SRC   = "/Images/snoww.png";
const BOAT_ICON_SRC   = "/Images/boat1.png";
const HELI_ICON_SRC   = "/Images/helicopter.png";
const FIRE_TRUCK_SRC  = "/Images/firefighter.png";
const APARTMENT_SRC   = "/Images/apartment.png";
const SMOKE_ICON_SRC  = "/Images/smoke.png";
const FIRE_ICON_SRC   = "/Images/fire.png";

// =================== BASE SELECTORS ===================
const vizSection     = document.getElementById("vizSection");
const resultsSection = document.getElementById("resultsSection");
const stepsListEl    = document.getElementById("stepsList");
const resultsTimeEl  = document.getElementById("resultsTime");
const resultsStatusEl= document.getElementById("resultsStatus");
const resultsHeader  = document.getElementById("resultsHeader");

const solveBtn   = document.getElementById("solveBtn");
const resultPill = document.getElementById("resultSummary");
const stageIdxEl = document.getElementById("stageIdx");
const stageMulEl = document.getElementById("stageMul");
const clockEl    = document.getElementById("clock");

const btnPlay  = document.getElementById("btnPlay");

// Remember selected scenario card
let selectedScenario = "flood";
document.querySelectorAll(".scenario-card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".scenario-card").forEach(c => c.classList.remove("is-selected"));
    card.classList.add("is-selected");
    selectedScenario = card.dataset.scenario || "flood";
  });
});

// =================== D3 SCAFFOLD ===================
const svg = d3.select("#riverViz");
const W = 960, H = 320;
svg.attr("width", W).attr("height", H);

// Global coordinates
const margin = { top: 16, right: 16, bottom: 16, left: 16 };
const riverX1 = 240, riverX2 = W - 240;
const baseX = riverX1 - 60;
const destX = riverX2 + 60;
const groundY = H - 60;


const gPanel      = svg.append("g");          // panel
const gTerrain    = svg.append("g");          // terrain containers
const gRoad       = svg.append("g");          // road (fire) (under vehicle)
const gWaves      = svg.append("g");          // waves (flood)
const gTerrainFg  = svg.append("g");          // apartment, helipads (over road)
const gVehicle    = svg.append("g");          // vehicle
const gPeople     = svg.append("g");          // people
const gHud        = svg.append("g");          // weather/sun/rain/snow/smoke

// Panel
gPanel.append("rect")
  .attr("x", margin.left).attr("y", margin.top)
  .attr("width", W - margin.left - margin.right)
  .attr("height", H - margin.top - margin.bottom)
  .attr("rx", 16)
  .attr("fill", "rgba(255,255,255,0.03)")
  .attr("stroke", "rgba(255,255,255,0.06)");

// =================== FLOOD TERRAIN ===================
const gFlood = gTerrain.append("g");
const riverRect = gFlood.append("rect")
  .attr("x", riverX1).attr("y", groundY - 120)
  .attr("width", riverX2 - riverX1).attr("height", 120)
  .attr("fill", "#0f2a46")
  .attr("opacity", 0.95)
  .attr("rx", 8);
const bankLeft  = gFlood.append("rect").attr("x", baseX - 60).attr("y", groundY - 10)
  .attr("width", 120).attr("height", 12).attr("fill", "#1e2837").attr("rx",4);
const bankRight = gFlood.append("rect").attr("x", destX - 60).attr("y", groundY - 10)
  .attr("width", 120).attr("height", 12).attr("fill", "#1e2837").attr("rx",4);

// Waves
const wave = gWaves.append("path")
  .attr("fill", "none")
  .attr("stroke", "rgba(255,255,255,0.10)")
  .attr("stroke-width", 2);
function drawWave(t=0){
  const A = 6, L = 50;
  let d = "";
  for (let x=riverX1; x<=riverX2; x+=6){
    const y = groundY - 60 + A*Math.sin((x/L)+t/600);
    d += (x===riverX1?`M${x},${y}`:`L${x},${y}`);
  }
  wave.attr("d", d);
}
d3.timer(drawWave);

// =================== MOUNTAIN TERRAIN ===================
const gMountains = gTerrain.append("g").attr("display","none");
const gPads      = gTerrainFg.append("g").attr("display","none");

// Brown ridges
(function buildMountains(){
  gMountains.append("rect")
    .attr("x", margin.left).attr("y", margin.top)
    .attr("width", W - margin.left - margin.right)
    .attr("height", H - margin.top - margin.bottom)
    .attr("rx", 16)
    .attr("fill", "rgba(255,255,255,0.02)");

  const ridge1 = "M180,250 L280,150 L360,230 L440,160 L520,240 L600,180 L700,250";
  const ridge2 = "M140,260 L220,190 L300,250 L380,190 L460,260 L540,200 L620,260 L700,210 L780,260";

  const STROKE_DARK   = "#5f4a34";
  const STROKE_MEDIUM = "#7a5a3a";
  const STROKE_LIGHT  = "#b8956a";

  gMountains.append("path")
    .attr("d", ridge1).attr("fill","none")
    .attr("stroke", STROKE_MEDIUM).attr("stroke-opacity", 0.70)
    .attr("stroke-linecap","round").attr("stroke-linejoin","round").attr("stroke-width", 3.5);

  gMountains.append("path")
    .attr("d", ridge2).attr("fill","none")
    .attr("stroke", STROKE_DARK).attr("stroke-opacity", 0.55)
    .attr("stroke-linecap","round").attr("stroke-linejoin","round").attr("stroke-width", 2.6);

  gMountains.append("path")
    .attr("d", ridge1).attr("fill","none")
    .attr("stroke", STROKE_LIGHT).attr("stroke-opacity", 0.18)
    .attr("stroke-linecap","round").attr("stroke-linejoin","round").attr("stroke-width", 1.2);

  // Helipads
  gPads.append("rect")
    .attr("x", baseX - 36).attr("y", groundY - 26)
    .attr("width", 72).attr("height", 18).attr("rx", 6)
    .attr("fill", "rgba(255,255,255,0.06)")
    .attr("stroke", "rgba(255,255,255,0.12)");
  gPads.append("rect")
    .attr("x", destX - 36).attr("y", groundY - 26)
    .attr("width", 72).attr("height", 18).attr("rx", 6)
    .attr("fill", "rgba(255,255,255,0.06)")
    .attr("stroke", "rgba(255,255,255,0.12)");
})();

// =================== FIRE CITY (road + apartment) ===================
const gFireBg  = gTerrain.append("g").attr("display","none");  // nothing yet (kept for symmetry)
const gRoadLane = gRoad.append("g").attr("display","none");    // road body + dashes
const gApartment = gTerrainFg.append("g").attr("display","none"); // apartment, flames, roof smoke (over road)
const gRoadSmoke = gHud.append("g").attr("display","none");       // smoke along half road (over road)

const ROAD_Y = groundY - 36;          // centerline of road
const ROAD_W = riverX2 - riverX1 + 180;
const ROAD_X = (W - ROAD_W) / 2;

// Road body
const roadBody = gRoadLane.append("rect")
  .attr("x", ROAD_X).attr("y", ROAD_Y - 24)
  .attr("width", ROAD_W).attr("height", 48)
  .attr("rx", 24)
  .attr("fill", "#3f4a55");
// Dashes
const dashCount = 10;
for(let i=0;i<dashCount;i++){
  gRoadLane.append("rect")
    .attr("x", ROAD_X + 24 + i*((ROAD_W-48)/dashCount))
    .attr("y", ROAD_Y - 4)
    .attr("width", 56).attr("height", 8)
    .attr("rx", 4).attr("fill", "#d9dde2").attr("opacity", 0.85);
}

// Apartment sprite + flames + smoke-on-roof (over road)
const apartmentImg = gApartment.append("image")
  .attr("href", APARTMENT_SRC).attr("x", ROAD_X + 40).attr("y", ROAD_Y - 120)
  .attr("width", 120).attr("height", 120).attr("opacity", 1);

const roofFire = gApartment.append("image")
  .attr("href", FIRE_ICON_SRC).attr("x", ROAD_X + 90).attr("y", ROAD_Y - 136)
  .attr("width", 36).attr("height", 36).attr("opacity", 0);

const roofSmoke = gApartment.append("image")
  .attr("href", SMOKE_ICON_SRC).attr("x", ROAD_X + 80).attr("y", ROAD_Y - 160)
  .attr("width", 56).attr("height", 56).attr("opacity", 0);

// Pre-create smoke plumes along half the road (hidden by default)
const ROAD_SMOKE_COUNT = 8;
const roadSmokePlumes = d3.range(ROAD_SMOKE_COUNT).map(i => {
  const img = gRoadSmoke.append("image")
    .attr("href", SMOKE_ICON_SRC)
    .attr("width", 44).attr("height", 44)
    .attr("opacity", 0);
  return { img, x: 0, y: 0, phase: Math.random()*1000 };
});
function layoutRoadSmoke(){
  const half = ROAD_X + ROAD_W/2;
  const step = (half - (ROAD_X + 140)) / (ROAD_SMOKE_COUNT + 1);
  roadSmokePlumes.forEach((p,i) => {
    p.x = ROAD_X + 140 + (i+1)*step;
    p.y = ROAD_Y - 48 - (i%3)*6; // small variance
    p.img.attr("x", p.x).attr("y", p.y);
  });
}
layoutRoadSmoke();

// =================== WEATHER (Sun/Rain/Snow) ===================
const weatherLayer = gHud.append("g");
const sunIcon = weatherLayer.append("image")
  .attr("href", SUN_ICON_SRC).attr("width", 56).attr("height", 56)
  .attr("opacity", 0);

const SKY_AREA = { x1: riverX1 + 8, x2: riverX2 - 52, y1: margin.top + 8, y2: groundY - 140 };
const BASE_RAIN_COUNT = Math.max(8, Math.round((riverX2 - riverX1) / 140) * 4);
const rain = d3.range(BASE_RAIN_COUNT).map(() => {
  const img = weatherLayer.append("image")
    .attr("href", RAIN_ICON_SRC).attr("width", 44).attr("height", 44)
    .attr("opacity", 0);
  return { img, x: 0, y0: 0, speed: 0, phase: Math.random()*1000 };
});

const SNOW_COUNT = Math.max(10, Math.round((riverX2 - riverX1) / 120) * 6);
const snowLayer = gHud.append("g").attr("class","snow").attr("display","none");
const snow = d3.range(SNOW_COUNT).map(() => {
  const img = snowLayer.append("image")
    .attr("href", SNOW_ICON_SRC).attr("width", 36).attr("height", 36)
    .attr("opacity", 0);
  return { img, x: 0, y0: 0, speed: 0, phase: Math.random()*800 };
});

function layoutWeather(){
  sunIcon.attr("x", riverX2 - 64).attr("y", margin.top + 6);
  rain.forEach(r => {
    r.x = SKY_AREA.x1 + Math.random()*(SKY_AREA.x2 - SKY_AREA.x1);
    r.y0= SKY_AREA.y1 + Math.random()*(SKY_AREA.y2 - SKY_AREA.y1);
    r.speed = 10 + Math.random()*16;
    r.img.attr("x", r.x).attr("y", r.y0);
  });
  snow.forEach(s => {
    s.x = SKY_AREA.x1 + Math.random()*(SKY_AREA.x2 - SKY_AREA.x1);
    s.y0= SKY_AREA.y1 + Math.random()*(SKY_AREA.y2 - SKY_AREA.y1);
    s.speed = 8 + Math.random()*12;
    s.img.attr("x", s.x).attr("y", s.y0);
  });
}
layoutWeather();

let rainTimer=null, snowTimer=null, roadSmokeTimer=null;
function startRain(){ if(rainTimer) return; const t0=performance.now(); rainTimer=d3.timer(now=>{
  const dt=(now-t0)/1000;
  rain.forEach(r=>{
    const drop=(r.y0 + (dt*r.speed + r.phase)%36);
    const wobble=2*Math.sin((dt*2 + r.phase)*0.8);
    r.img.attr("transform",`translate(${wobble},${drop-r.y0})`);
  });
});}
function stopRain(){ if(rainTimer){ rainTimer.stop(); rainTimer=null; } rain.forEach(r=>r.img.attr("transform",null)); }
function startSnow(){ if(snowTimer) return; const t0=performance.now(); snowTimer=d3.timer(now=>{
  const dt=(now-t0)/1000;
  snow.forEach(s=>{
    const fall=(s.y0 + (dt*s.speed + s.phase)%42);
    const sway=4*Math.sin((dt*0.9 + s.phase)*0.8);
    s.img.attr("transform",`translate(${sway},${fall-s.y0})`);
  });
});}
function stopSnow(){ if(snowTimer){ snowTimer.stop(); snowTimer=null; } snow.forEach(s=>s.img.attr("transform",null)); }
function startRoadSmoke(){ if(roadSmokeTimer) return; const t0=performance.now(); roadSmokeTimer=d3.timer(now=>{
  const dt=(now-t0)/1000;
  roadSmokePlumes.forEach((p,i)=>{
    const bob = 4*Math.sin((dt*0.8) + (i*0.6));
    p.img.attr("transform",`translate(0,${-bob})`);
  });
});}
function stopRoadSmoke(){ if(roadSmokeTimer){ roadSmokeTimer.stop(); roadSmokeTimer=null; } gRoadSmoke.selectAll("image").attr("transform",null); }

// ===== Environment updaters per scene =====
const waterBase    = d3.rgb("#0f2a46");
const waterDarker  = d3.rgb("#081a2c");
const waterLighter = d3.rgb("#1b4c7c");

function updateEnvironmentFlood(mul){
  let fillColor = waterBase;

  if (mul > 1){
    const t = Math.min((mul - 1) / 1.5, 1);
    fillColor = d3.interpolateRgb(waterBase, waterDarker)(t);
    const visible = Math.max(4, Math.round(BASE_RAIN_COUNT * (0.5 + 0.5*t)));
    rain.forEach((r, i) => r.img.transition().duration(220).attr("opacity", i < visible ? 1 : 0));
    wave.transition().duration(300).attr("stroke","rgba(255,255,255,0.08)");
    sunIcon.transition().duration(200).attr("opacity",0);
    startRain();
    snowLayer.attr("display","none"); stopSnow();
    gRoadSmoke.attr("display","none"); stopRoadSmoke();
  } else if (mul < 1){
    const t = Math.min((1 - mul) / 0.6, 1);
    fillColor = d3.interpolateRgb(waterBase, waterLighter)(t);
    wave.transition().duration(300).attr("stroke","rgba(255,255,255,0.16)");
    stopRain(); rain.forEach(r=>r.img.transition().duration(180).attr("opacity",0));
    sunIcon.transition().duration(240).attr("opacity",1);
    snowLayer.attr("display","none"); stopSnow();
    gRoadSmoke.attr("display","none"); stopRoadSmoke();
  } else {
    wave.transition().duration(300).attr("stroke","rgba(255,255,255,0.10)");
    stopRain(); rain.forEach(r=>r.img.transition().duration(180).attr("opacity",0));
    sunIcon.transition().duration(200).attr("opacity",0);
    snowLayer.attr("display","none"); stopSnow();
    gRoadSmoke.attr("display","none"); stopRoadSmoke();
  }
  riverRect.transition().duration(350).attr("fill", fillColor);
}

function updateEnvironmentMountain(mul){
  stopRain(); rain.forEach(r=>r.img.attr("opacity",0));

  if (mul > 1){
    sunIcon.transition().duration(200).attr("opacity",0);
    snowLayer.attr("display","block");
    const visible = Math.max(6, Math.round(SNOW_COUNT * Math.min((mul-1)/1.2, 1)));
    snow.forEach((s,i) => s.img.transition().duration(220).attr("opacity", i < visible ? 1 : 0));
    startSnow();
  } else if (mul < 1){
    snow.forEach(s => s.img.transition().duration(180).attr("opacity",0));
    stopSnow();
    sunIcon.transition().duration(240).attr("opacity",1);
  } else {
    sunIcon.transition().duration(200).attr("opacity",0);
    snow.forEach(s => s.img.transition().duration(180).attr("opacity",0));
    stopSnow();
  }
  gRoadSmoke.attr("display","none"); stopRoadSmoke();
}

function updateEnvironmentFire(mul){
  // Sun shows on easy conditions, otherwise intensify fire+smoke
  stopRain(); rain.forEach(r=>r.img.attr("opacity",0));
  snowLayer.attr("display","none"); stopSnow();

  // Roof visuals
  const fireOpacity  = mul > 1 ? Math.min(1, 0.4 + (mul-1)*0.7) : (mul < 1 ? 0.5 : 0.7);
  const smokeOpacity = mul > 1 ? Math.min(1, 0.35 + (mul-1)*0.8) : (mul < 1 ? 0.4 : 0.6);
  roofFire.transition().duration(200).attr("opacity", fireOpacity);
  roofSmoke.transition().duration(200).attr("opacity", smokeOpacity);

  if (mul > 1){
    sunIcon.transition().duration(200).attr("opacity",0);
    // turn on road smoke along half of the road
    gRoadSmoke.attr("display","block");
    roadSmokePlumes.forEach((p,i)=>{
      const op = Math.min(1, 0.25 + 0.6*(i/ROAD_SMOKE_COUNT));
      p.img.transition().duration(200).attr("opacity", op);
    });
    startRoadSmoke();
  } else {
    sunIcon.transition().duration(240).attr("opacity",1);
    gRoadSmoke.attr("display","none");
    roadSmokePlumes.forEach(p => p.img.attr("opacity",0));
    stopRoadSmoke();
  }
}

function updateEnvironment(mul){
  if (currentScene === "mountain") updateEnvironmentMountain(mul);
  else if (currentScene === "fire") updateEnvironmentFire(mul);
  else updateEnvironmentFlood(mul);
}

// =================== PEOPLE ===================
const personColor = d3.scaleOrdinal()
  .domain(d3.range(0,64))
  .range(["#f1f5f9","#0f172a","#f97316","#22d3ee","#fde047","#a78bfa","#34d399","#60a5fa",
          "#fb7185","#f59e0b","#93c5fd","#fda4af","#bbf7d0","#c4b5fd","#a7f3d0","#fde68a",
          "#bae6fd","#fecaca","#e9d5ff","#d9f99d","#fef3c7","#bfdbfe","#fecdd3","#ddd6fe",
          "#6ee7b7","#fde68a","#93c5fd","#fda4af","#bbf7d0","#c4b5fd","#a7f3d0","#fde68a",
          "#f1f5f9","#0f172a"]);

let activeIds = new Set();
const positions   = new Map(); // id -> {x,y,side}
const baseAssigned= new Map();
const destAssigned= new Map();
let baseSlots = [], destSlots = [];
let baseCount = 0, destCount = 0;

function buildSlots(count){
  const perRow = 5, rows = Math.ceil(count / perRow), slots = [];
  for(let r=0;r<rows;r++){
    for(let c=0;c<perRow && slots.length<count;c++){
      slots.push({ x:(baseX-30)+c*15, y: groundY-30 - r*22 });
    }
  }
  return slots;
}
function buildSlotsRight(count){
  const perRow = 5, rows = Math.ceil(count / perRow), slots = [];
  for(let r=0;r<rows;r++){
    for(let c=0;c<perRow && slots.length<count;c++){
      slots.push({ x:(destX-30)+c*15, y: groundY-30 - r*22 });
    }
  }
  return slots;
}
function placeInitial(n){
  positions.clear(); baseAssigned.clear(); destAssigned.clear();
  activeIds = new Set(d3.range(0,n));
  baseSlots = buildSlots(n); destSlots = buildSlotsRight(n);
  baseCount = n; destCount = 0;
  let idx=0; activeIds.forEach(id=>{
    const p=baseSlots[idx]; baseAssigned.set(id, idx);
    positions.set(id, {x:p.x, y:p.y, side:"base"}); idx++;
  });
}
function drawPerson(g, color){
  const icon = g.append("g").attr("class","sprite-person").attr("transform","translate(-12,-18)");
  icon.append("rect").attr("x",3).attr("y",10).attr("width",18).attr("height",22)
    .attr("rx",6).attr("ry",6).attr("fill",color).attr("stroke","rgba(0,0,0,0.45)").attr("stroke-width",2);
  icon.append("circle").attr("cx",12).attr("cy",5).attr("r",5.5)
    .attr("fill",color).attr("stroke","rgba(0,0,0,0.45)").attr("stroke-width",2);
}
function renderPeople(){
  const data = Array.from(activeIds).map(id => ({id, ...positions.get(id)}));
  const sel = gPeople.selectAll("g.person").data(data, d=>d.id);
  const enter = sel.enter().append("g").attr("class","person")
    .attr("transform", d=>`translate(${d.x},${d.y})`);
  enter.each(function(d){ drawPerson(d3.select(this), personColor(d.id)); });
  enter.append("text").text(d=>d.id).attr("dy","0.35em").attr("text-anchor","middle")
    .attr("fill","#0b1220").attr("font-size","10px").attr("font-weight","800");
  sel.transition().duration(200).attr("transform", d=>`translate(${d.x},${d.y})`);
  sel.exit().remove();
}

// =================== VEHICLE (boat/helicopter/truck) ===================
let vehicleY = groundY - 50;
const vehicle = gVehicle.append("g").attr("class","vehicle")
  .attr("transform", `translate(${baseX},${vehicleY})`);

function setVehicleSprite(src, w=72, h=72, offsetX=-36, offsetY=-36){
  vehicle.selectAll("*").remove();
  vehicle.append("image").attr("href", src).attr("width", w).attr("height", h)
    .attr("x", offsetX).attr("y", offsetY);
}
function setVehiclePos(x,y){ vehicleY = y; vehicle.attr("transform", `translate(${x},${y})`); }
function setVehicleX(x){ vehicle.attr("transform", `translate(${x},${vehicleY})`); }
function getVehicleX(){
  const m = d3.select(vehicle.node()).attr("transform");
  const match = /translate\(([-\d.]+),/.exec(m);
  return match ? parseFloat(match[1]) : baseX;
}

// Helicopter flight levels
const HELI_CRUISE_Y = groundY - 120;
const HELI_LAND_Y   = groundY - 32;
// Fire truck lane center
const TRUCK_Y = ROAD_Y;

// =================== HUD / STATE ===================
let tClock = 0, playing = false, legIdx = 0, trips = [];
let current = { n:0, k:0, m:0, time:[], mul:[] };
let currentScene = "flood";

function updateHUD(stage, mulVal, clock){
  stageIdxEl.textContent = String(stage);
  stageMulEl.textContent = mulVal.toFixed(2);
  clockEl.textContent    = clock.toFixed(2);
  updateEnvironment(mulVal);
}
function updateHUDNeutral(){ updateHUD(0, 1.00, 0.00); }

// =================== SCENE SWITCHING ===================
function setScene(scene){
  // normalize aliases
  const s = String(scene||"").toLowerCase();
  if (s === "emergency" || s === "fire-evacuation") scene = "fire";
  else if (s === "mountain") scene = "mountain";
  else if (s === "fire") scene = "fire";
  else scene = "flood";
  currentScene = scene;

  // Hide all
  gFlood.attr("display","none"); gWaves.attr("display","none");
  gMountains.attr("display","none"); gPads.attr("display","none");
  gRoadLane.attr("display","none"); gApartment.attr("display","none");
  gRoadSmoke.attr("display","none"); stopRoadSmoke();

  if (scene === "mountain"){
    // Show mountain
    gMountains.attr("display","block"); gPads.attr("display","block");

    // Helicopter
    setVehicleSprite(HELI_ICON_SRC, 84, 84, -42, -42);
    setVehiclePos(baseX, HELI_CRUISE_Y);

    // Reset weather
    stopRain(); rain.forEach(r=>r.img.attr("opacity",0));
    sunIcon.attr("opacity",0); snowLayer.attr("display","none"); stopSnow();

  } else if (scene === "fire"){
    // Show fire city
    gRoadLane.attr("display","block");
    gApartment.attr("display","block");
    roofFire.attr("opacity", 0.7);
    roofSmoke.attr("opacity", 0.6);

    // Fire truck on the road
    setVehicleSprite(FIRE_TRUCK_SRC, 80, 80, -40, -40);
    setVehiclePos(baseX, TRUCK_Y);

    // Weather reset
    stopRain(); rain.forEach(r=>r.img.attr("opacity",0));
    snowLayer.attr("display","none"); stopSnow();
    sunIcon.attr("opacity",0);

  } else {
    // Flood (default)
    gFlood.attr("display","block"); gWaves.attr("display","block");
    setVehicleSprite(BOAT_ICON_SRC, 72, 72, -36, -36);
    setVehiclePos(baseX, groundY - 50);

    snowLayer.attr("display","none"); stopSnow();
    rain.forEach(r=>r.img.attr("opacity",0));
    sunIcon.attr("opacity",0);
  }
}

// =================== ANIMATION ENGINE ===================
const MS_PER_MIN = 800;
const LOAD_UNLOAD_MS = 350;
const LANDING_MS = 450;
const TAKEOFF_MS = 450;

function allocateSlotsAfterForward(ids){
  ids.forEach((id,i)=>{
    const slotIndex = destCount + i;
    const p = destSlots[slotIndex];
    destAssigned.set(id, slotIndex);
    positions.set(id, {x:p.x, y:p.y, side:"dest"});
  });
  destCount += ids.length;
  ids.forEach(id => baseAssigned.delete(id));
}
function allocateSlotsAfterReturn(id){
  const slotIndex = baseCount, p = baseSlots[slotIndex];
  baseAssigned.set(id, slotIndex);
  positions.set(id, {x:p.x, y:p.y, side:"base"});
  baseCount += 1; destAssigned.delete(id);
}

function loadToVehicle(ids, fromX){
  const offsets = ids.map((_,i)=>({dx:-18 + i*18, dy:-8}));
  ids.forEach((id,i)=>{
    gPeople.selectAll("g.person").filter(d=>d.id===id)
      .transition().duration(LOAD_UNLOAD_MS)
      .attr("transform", `translate(${fromX+offsets[i].dx},${vehicleY+offsets[i].dy})`);
  });
}
function unloadForward(ids){
  allocateSlotsAfterForward(ids);
  ids.forEach(id=>{
    const p=positions.get(id);
    gPeople.selectAll("g.person").filter(d=>d.id===id)
      .transition().duration(LOAD_UNLOAD_MS)
      .attr("transform",`translate(${p.x},${p.y})`);
  });
}
function unloadReturn(id){
  allocateSlotsAfterReturn(id);
  const p=positions.get(id);
  gPeople.selectAll("g.person").filter(d=>d.id===id)
    .transition().duration(LOAD_UNLOAD_MS)
    .attr("transform",`translate(${p.x},${p.y})`);
}

// Straight travel (boat/truck)
function travelStraight(ids, fromX, toX, durationMin, onTick){
  const dur = Math.max(60, durationMin * MS_PER_MIN);
  d3.select(vehicle.node()).transition().duration(dur).ease(d3.easeCubicInOut)
    .attrTween("transform", function(){
      const x0=fromX, x1=toX, ix=d3.interpolateNumber(x0,x1);
      const iy=d3.interpolateNumber(vehicleY, vehicleY);
      return t=>`translate(${ix(t)},${iy(t)})`;
    })
    .on("start", ()=>{
      ids.forEach((id,i)=>{
        const x0=fromX+(-18+i*18), x1=toX+(-18+i*18);
        gPeople.selectAll("g.person").filter(d=>d.id===id)
          .transition().duration(dur).ease(d3.easeCubicInOut)
          .attrTween("transform",()=>{
            const ix=d3.interpolateNumber(x0,x1);
            const iy=d3.interpolateNumber(vehicleY-8, vehicleY-8);
            const c0=tClock, c1=tClock+durationMin;
            return t=>{
              clockEl.textContent=(c0+(c1-c0)*t).toFixed(2);
              return `translate(${ix(t)},${iy(t)})`;
            };
          });
      });
    })
    .on("end", ()=>{ tClock += durationMin; onTick && onTick(); });
}

// Helicopter travel with land/takeoff
function travelHeli(ids, fromX, toX, durationMin, isForward, onTick){
  const cruiseDur = Math.max(60, durationMin * MS_PER_MIN);
  const offsets = ids.map((_,i)=>({dx:-18 + i*18, dy:-8}));

  d3.select(vehicle.node())
    .transition().duration(LANDING_MS).ease(d3.easeCubicOut)
    .tween("y", ()=>{ const y0=vehicleY, y1=HELI_LAND_Y; return t=>setVehiclePos(fromX, y0+(y1-y0)*t); })
    .on("end", ()=>{
      ids.forEach((id,i)=>{
        gPeople.selectAll("g.person").filter(d=>d.id===id)
          .transition().duration(LOAD_UNLOAD_MS)
          .attr("transform", `translate(${fromX+offsets[i].dx},${HELI_LAND_Y+offsets[i].dy})`);
      });
      setTimeout(()=>{
        d3.select(vehicle.node())
          .transition().duration(TAKEOFF_MS).ease(d3.easeCubicIn)
          .tween("y", ()=>{ const y0=vehicleY, y1=HELI_CRUISE_Y; return t=>setVehiclePos(fromX, y0+(y1-y0)*t); })
          .transition().duration(cruiseDur).ease(d3.easeCubicInOut)
          .attrTween("transform", function(){
            const x0=fromX, x1=toX, ix=d3.interpolateNumber(x0,x1);
            const iy=d3.interpolateNumber(HELI_CRUISE_Y, HELI_CRUISE_Y);
            return t=>{
              ids.forEach((id,i)=>{
                const px=(x0+(x1-x0)*t)+offsets[i].dx, py=HELI_CRUISE_Y+offsets[i].dy;
                gPeople.selectAll("g.person").filter(d=>d.id===id).attr("transform",`translate(${px},${py})`);
              });
              const c0=tClock, c1=tClock+durationMin;
              clockEl.textContent=(c0+(c1-c0)*t).toFixed(2);
              return `translate(${ix(t)},${iy(t)})`;
            };
          })
          .transition().duration(LANDING_MS).ease(d3.easeCubicOut)
          .tween("y", ()=>{ const y0=HELI_CRUISE_Y, y1=HELI_LAND_Y; return t=>setVehiclePos(toX, y0+(y1-y0)*t); })
          .on("end", ()=>{
            if(isForward){
              allocateSlotsAfterForward(ids);
              ids.forEach(id=>{
                const p=positions.get(id);
                gPeople.selectAll("g.person").filter(d=>d.id===id)
                  .transition().duration(LOAD_UNLOAD_MS)
                  .attr("transform",`translate(${p.x},${p.y})`);
              });
            } else {
              const id=ids[0];
              allocateSlotsAfterReturn(id);
              const p=positions.get(id);
              gPeople.selectAll("g.person").filter(d=>d.id===id)
                .transition().duration(LOAD_UNLOAD_MS)
                .attr("transform",`translate(${p.x},${p.y})`);
            }
            tClock += durationMin;
            onTick && onTick();
          });
      }, LOAD_UNLOAD_MS);
    });
}

function runLeg(leg, done){
  updateHUD(leg.stageFrom, current.mul[leg.stageFrom], tClock);

  const dir = leg.direction;
  const fromX = (dir === "forward") ? baseX : destX;
  const toX   = (dir === "forward") ? destX  : baseX;

  if (dir === "forward"){
    baseCount -= leg.groupIds.length;
    if (currentScene === "mountain"){
      travelHeli(leg.groupIds, fromX, toX, leg.duration, true, ()=>{ updateHUD(leg.stageTo, current.mul[leg.stageTo], tClock); done&&done(); });
    } else {
      loadToVehicle(leg.groupIds, fromX);
      travelStraight(leg.groupIds, fromX, toX, leg.duration, ()=>{
        updateHUD(leg.stageTo, current.mul[leg.stageTo], tClock);
        unloadForward(leg.groupIds);
        done&&done();
      });
    }
  } else {
    destCount -= 1;
    if (currentScene === "mountain"){
      travelHeli(leg.groupIds, fromX, toX, leg.duration, false, ()=>{ updateHUD(leg.stageTo, current.mul[leg.stageTo], tClock); done&&done(); });
    } else {
      loadToVehicle(leg.groupIds, fromX);
      travelStraight(leg.groupIds, fromX, toX, leg.duration, ()=>{
        updateHUD(leg.stageTo, current.mul[leg.stageTo], tClock);
        unloadReturn(leg.groupIds[0]);
        done&&done();
      });
    }
  }
}
function runNextLeg(){
  if (legIdx >= trips.length){
    playing=false;
    btnPlay.disabled=true;
    return;
  }
  const leg = trips[legIdx];
  runLeg(leg, ()=>{ legIdx++; if(playing) setTimeout(runNextLeg, 150); });
}
function interruptAllTransitions(){
  d3.select(vehicle.node()).interrupt();
  gPeople.selectAll("g.person").interrupt();
}

// =================== RESULTS PANE ===================
function parseNumberList(str){
  return str.split(",").map(s=>s.trim()).filter(s=>s.length>0).map(Number);
}
function renderResultsUI(res){
  resultsSection.classList.remove("hidden");
  if (res.time < 0){
    resultsHeader.classList.add("error");
    resultsStatusEl.textContent="No feasible solution";
    resultsTimeEl.textContent="—";
    stepsListEl.innerHTML=""; return;
  }
  resultsHeader.classList.remove("error");
  resultsStatusEl.textContent="✔ Solution Found";
  resultsTimeEl.textContent=`${res.time.toFixed(2)} min`;

  stepsListEl.innerHTML="";
  res.steps.forEach((s,i)=>{
    const badgeClass = s.direction === "forward" ? "badge-forward" : "badge-return";
    const badgeText  = s.direction === "forward" ? "forward" : "return";
    const people = s.groupIds.map(id=>`#${id}`).join(", ");
    const step=document.createElement("div");
    step.className="step-card";
    step.innerHTML=`
      <div class="step-head">
        <div><strong>Step ${i+1}</strong></div>
        <span class="step-badge ${badgeClass}">${badgeText}</span>
      </div>
      <div class="step-lines">
        <div><strong>Individuals:</strong> ${people}</div>
        <div><strong>Stage:</strong> ${s.stageFrom} → ${s.stageTo} · mul=${current.mul[s.stageFrom].toFixed(2)}</div>
        <div><strong>Duration:</strong> ${s.duration.toFixed(2)} min</div>
      </div>`;
    stepsListEl.appendChild(step);
  });
}

// =================== CONTROLS ===================
btnPlay.addEventListener("click", ()=>{
  if(trips.length===0 || legIdx>=trips.length) return;
  playing=true;
  btnPlay.disabled=true;
  runNextLeg();
});

updateHUDNeutral();

// =================== SOLVE & WIRE VIZ ===================
solveBtn.addEventListener("click", ()=>{
  // Inputs
  const n = Number(document.getElementById("n").value);
  const k = Number(document.getElementById("k").value);
  const m = Number(document.getElementById("m").value);
  const time = parseNumberList(document.getElementById("times").value);
  const mul  = parseNumberList(document.getElementById("mult").value);

  // Scenario (normalize aliases)
  const selCard = document.querySelector(".scenario-card.is-selected");
  const raw = (selCard && selCard.dataset.scenario ? selCard.dataset.scenario : "flood").toLowerCase();
  const scenario = (raw==="fire" || raw==="emergency" || raw==="fire-evacuation") ? "fire"
                   : (raw==="mountain") ? "mountain" : "flood";

  // Validate
  if (!Number.isInteger(n) || n<=0){ alert("n must be a positive integer."); return; }
  if (!Number.isInteger(k) || k<=0){ alert("k must be a positive integer."); return; }
  if (!Number.isInteger(m) || m<=0){ alert("m must be a positive integer."); return; }
  if (time.length !== n || time.some(x=>!(x>0))){ alert("‘Individual Times’ must contain exactly n positive values."); return; }
  if (mul.length !== m || mul.some(x=>!(x>0))){ alert("‘Stage Multipliers’ must contain exactly m positive values."); return; }

  // Solve
  const res = (window.solveWithPath ? window.solveWithPath(n,k,m,time,mul)
                                    : { time: window.minTime(n,k,m,time,mul), steps: [] });

  // Switch scene first
  setScene(scenario);

  // Show panel
  vizSection.classList.remove("hidden");

  // Reset visuals
  current = { n,k,m,time,mul };
  tClock=0; legIdx=0; trips=[];
  playing=false;
  updateHUDNeutral();
  placeInitial(n); renderPeople();
  setVehicleX(baseX);
  updateEnvironment(1.0);

  // Result pill
  if(res.time < 0){
    clockEl.textContent="-";
    resultPill.textContent="Impossible with these parameters (k=1 and n>1)";
    resultPill.classList.remove("hidden");
  } else {
    clockEl.textContent="0.00";
    resultPill.textContent=`Minimum Time = ${res.time.toFixed(2)} min (solver: exact)`;
    resultPill.classList.remove("hidden");
  }

  // Results UI
  renderResultsUI(res);

  // Trips
  if(res.steps && res.steps.length){
    trips = res.steps.map(s=>({
      direction: s.direction,
      groupIds : s.groupIds.slice(),
      stageFrom: s.stageFrom,
      stageTo  : s.stageTo,
      duration : s.duration
    }));
    btnPlay.disabled=false;
  } else {
    btnPlay.disabled=true;
  }
});
