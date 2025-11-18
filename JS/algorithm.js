(function(global){

  // ---- Min-Heap (PriorityQueue) per objekte me fushen 'dist' ----
  class MinHeap {
    constructor(){ this.a = []; }
    size(){ return this.a.length; }
    peek(){ return this.a[0]; }
    push(x){
      const a = this.a; a.push(x);
      let i = a.length - 1;
      while(i > 0){
        const p = (i - 1) >> 1;
        if (a[p].dist <= a[i].dist) break;
        [a[p], a[i]] = [a[i], a[p]];
        i = p;
      }
    }
    pop(){
      const a = this.a;
      if (a.length === 0) return undefined;
      const root = a[0];
      const last = a.pop();
      if (a.length){
        a[0] = last;
        // sift-down
        let i = 0;
        const n = a.length;
        while(true){
          let l = i*2+1, r = l+1, s = i;
          if (l < n && a[l].dist < a[s].dist) s = l;
          if (r < n && a[r].dist < a[s].dist) s = r;
          if (s === i) break;
          [a[i], a[s]] = [a[s], a[i]];
          i = s;
        }
      }
      return root;
    }
  }

  // ---- Bitwise helpers ----
  function bitCount(x){
    x = x - ((x >>> 1) & 0x55555555);
    x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
    return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24;
  }
  function trailingIdx(lsb){
    return Math.log2(lsb) | 0; // lsb eshte fuqi e dyshit
  }
  function maskToIds(mask, n){
    const ids = [];
    for (let i=0;i<n;i++) if (mask & (1<<i)) ids.push(i);
    return ids;
  }

  // =====================================================================
  // 1) minTime(...) — si me pare (koha totale, pa rruge)
  // =====================================================================
  function minTime(n, k, m, time, mul){
    const FULL = (1 << n) - 1;
    const INF = Number.POSITIVE_INFINITY;
    const EPS = 1e-12;

    if (k === 1 && n > 1) return -1.0;

    const maxTime = new Float64Array(1 << n);
    for (let s = 1; s < (1 << n); s++){
      const lsb = s & -s;
      const i = trailingIdx(lsb);
      maxTime[s] = Math.max(maxTime[s ^ lsb], time[i]);
    }

    const dist = Array.from({length: (1<<n)}, () =>
      [ Array(m).fill(INF), Array(m).fill(INF) ]
    );
    dist[0][0][0] = 0.0;

    const pq = new MinHeap();
    pq.push({mask:0, side:0, stage:0, dist:0.0});

    while(pq.size()){
      const s = pq.pop();
      if (Math.abs(s.dist - dist[s.mask][s.side][s.stage]) > 1e-12) continue;

      if (s.mask === FULL && s.side === 1) return s.dist;

      if (s.side === 0){
        const leftMask = (~s.mask) & FULL;
        const leftCount = bitCount(leftMask);
        if (leftCount > 0){
          const positions = [];
          for (let i=0;i<n;i++) if (leftMask & (1<<i)) positions.push(i);

          const maxSize = Math.min(k, leftCount);
          for (let size=1; size<=maxSize; size++){
            const indices = Array.from({length:size}, (_,i)=>i);
            while(true){
              let subset = 0;
              for (let i=0;i<size;i++) subset |= (1 << positions[indices[i]]);

              const cost = maxTime[subset] * mul[s.stage];
              const advance = Math.floor(cost + EPS);
              const newStage = (s.stage + advance) % m;
              const newMask  = s.mask | subset;
              const newDist  = s.dist + cost;

              if (newDist < dist[newMask][1][newStage] - EPS){
                dist[newMask][1][newStage] = newDist;
                pq.push({mask:newMask, side:1, stage:newStage, dist:newDist});
              }

              let pos = size - 1;
              while (pos >= 0 && indices[pos] === pos + leftCount - size) pos--;
              if (pos < 0) break;
              indices[pos]++;
              for (let i=pos+1;i<size;i++) indices[i] = indices[i-1] + 1;
            }
          }
        }
      } else {
        if (s.mask !== FULL){
          let current = s.mask;
          while (current){
            const lsb = current & -current;
            const person = trailingIdx(lsb);
            current ^= lsb;

            const cost = time[person] * mul[s.stage];
            const advance = Math.floor(cost + EPS);
            const newStage = (s.stage + advance) % m;
            const newMask  = s.mask ^ (1 << person);
            const newDist  = s.dist + cost;

            if (newDist < dist[newMask][0][newStage] - EPS){
              dist[newMask][0][newStage] = newDist;
              pq.push({mask:newMask, side:0, stage:newStage, dist:newDist});
            }
          }
        }
      }
    }
    return -1.0;
  }
  
  // =====================================================================
  // 2) solveWithPath(...) — kthen kohen minimale DHE hapat (step breakdown)
  // =====================================================================
  function solveWithPath(n, k, m, time, mul){
    const FULL = (1 << n) - 1;
    const INF = Number.POSITIVE_INFINITY;
    const EPS = 1e-12;

    if (k === 1 && n > 1) return { time: -1, steps: [], reason: "k == 1 and n > 1" };

    // precompute maxTime
    const maxTime = new Float64Array(1 << n);
    for (let s = 1; s < (1 << n); s++){
      const lsb = s & -s;
      const i = trailingIdx(lsb);
      maxTime[s] = Math.max(maxTime[s ^ lsb], time[i]);
    }

    // dist & parent
    const dist = Array.from({length: (1<<n)}, () =>
      [ Array(m).fill(INF), Array(m).fill(INF) ]
    );
    const parent = Array.from({length: (1<<n)}, () =>
      [ Array(m).fill(null), Array(m).fill(null) ]  // parent[mask][side][stage] = {pmask,pside,pstage, groupMask, duration}
    );
    dist[0][0][0] = 0.0;

    const pq = new MinHeap();
    pq.push({mask:0, side:0, stage:0, dist:0.0});

    let goal = null;

    while(pq.size()){
      const s = pq.pop();
      if (Math.abs(s.dist - dist[s.mask][s.side][s.stage]) > EPS) continue;

      if (s.mask === FULL && s.side === 1){
        goal = s;
        break;
      }

      if (s.side === 0){
        const leftMask = (~s.mask) & FULL;
        const leftCount = bitCount(leftMask);
        if (leftCount > 0){
          const positions = [];
          for (let i=0;i<n;i++) if (leftMask & (1<<i)) positions.push(i);

          const maxSize = Math.min(k, leftCount);
          for (let size=1; size<=maxSize; size++){
            const indices = Array.from({length:size}, (_,i)=>i);
            while(true){
              let subset = 0;
              for (let i=0;i<size;i++) subset |= (1 << positions[indices[i]]);

              const cost = maxTime[subset] * mul[s.stage];
              const advance = Math.floor(cost + EPS);
              const newStage = (s.stage + advance) % m;
              const newMask  = s.mask | subset;
              const newDist  = s.dist + cost;

              if (newDist < dist[newMask][1][newStage] - EPS){
                dist[newMask][1][newStage] = newDist;
                parent[newMask][1][newStage] = {
                  pmask: s.mask, pside: 0, pstage: s.stage,
                  groupMask: subset, duration: cost
                };
                pq.push({mask:newMask, side:1, stage:newStage, dist:newDist});
              }

              let pos = size - 1;
              while (pos >= 0 && indices[pos] === pos + leftCount - size) pos--;
              if (pos < 0) break;
              indices[pos]++;
              for (let i=pos+1;i<size;i++) indices[i] = indices[i-1] + 1;
            }
          }
        }
      } else {
        if (s.mask !== FULL){
          let current = s.mask;
          while (current){
            const lsb = current & -current;
            const person = trailingIdx(lsb);
            current ^= lsb;

            const subset = (1 << person); // nje person kthehet
            const cost = time[person] * mul[s.stage];
            const advance = Math.floor(cost + EPS);
            const newStage = (s.stage + advance) % m;
            const newMask  = s.mask ^ subset;
            const newDist  = s.dist + cost;

            if (newDist < dist[newMask][0][newStage] - EPS){
              dist[newMask][0][newStage] = newDist;
              parent[newMask][0][newStage] = {
                pmask: s.mask, pside: 1, pstage: s.stage,
                groupMask: subset, duration: cost
              };
              pq.push({mask:newMask, side:0, stage:newStage, dist:newDist});
            }
          }
        }
      }
    }

    if (!goal) return { time: -1, steps: [], reason: "No path to the final state" };

    // --- rikonstrukto rrugen ---
    const stepsRev = [];
    let {mask, side, stage} = goal;
    while(!(mask === 0 && side === 0 && stage === 0)){
      const p = parent[mask][side][stage];
      if (!p){
        // kjo s'duhet te ndodhe, por per siguri
        return { time: dist[goal.mask][goal.side][goal.stage], steps: stepsRev.reverse() };
      }
      const direction = (p.pside === 0 && side === 1) ? 'forward' : 'return';
      stepsRev.push({
        direction,
        groupMask: p.groupMask,
        groupIds: maskToIds(p.groupMask, n),
        stageFrom: p.pstage,
        stageTo: stage,
        mul: mul[p.pstage],
        duration: p.duration
      });
      mask = p.pmask; side = p.pside; stage = p.pstage;
    }

    stepsRev.reverse();
    const total = dist[goal.mask][goal.side][goal.stage];
    return { time: total, steps: stepsRev };
  }

  // === Exports ===
  global.minTime = minTime;            // koha minimale (si me pare)
  global.solveWithPath = solveWithPath; // koha + hapat per breakdown/animim

})(window);
