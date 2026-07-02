/**
 * RodLineUI — статичная удочка + леска с провисом
 */
const RodLineUI = (() => {
  let lineRipple = 0;

  function update(game) {
    lineRipple += 0.11;
  }

  function sampleLine(tip, bob, opts, time) {
    const { waiting = false, bite = false, fighting = false, tension = 0, reelIn = false } = opts;
    const dx = bob.x - tip.x;
    const dy = bob.y - tip.y;
    const dist = Math.hypot(dx, dy) || 1;
    const perpX = -dy / dist;
    const perpY = dx / dist;

    let slack = 1;
    let sagRatio = 0.26;
    let sagMin = 10;

    if (fighting) {
      slack = Math.max(0.06, 1 - tension * 0.96);
      sagRatio = 0.05 + (1 - tension) * 0.14;
      sagMin = 4 + (1 - tension) * 8;
    } else if (bite) {
      slack = 0.82;
      sagRatio = 0.3;
      sagMin = 18;
    } else if (waiting) {
      slack = 1.25;
      sagRatio = 0.42;
      sagMin = 32;
    } else if (reelIn) {
      slack = 0.7;
      sagRatio = 0.2;
      sagMin = 12;
    }

    const sagAmp = Math.min(dist * sagRatio * slack + sagMin, dist * 0.52);
    const wind = waiting ? 1.2 : bite ? 0.85 : fighting ? 0.35 : 0.55;
    const wSlow = Math.sin(time * 0.042 + lineRipple * 0.02) * sagAmp * 0.14 * wind;
    const wFast = Math.sin(time * 0.088 + 2.1) * sagAmp * 0.09 * wind;
    const wDrift = Math.cos(time * 0.035) * 5 * wind;

    const segments = 36;
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const u = i / segments;
      if (i === 0) {
        pts.push({ x: tip.x, y: tip.y });
        continue;
      }
      if (i === segments) {
        pts.push({ x: bob.x, y: bob.y });
        continue;
      }

      let x = tip.x + dx * u;
      let y = tip.y + dy * u;

      const sag = Math.sin(u * Math.PI) * sagAmp;
      y += sag;

      const ripple = Math.sin(u * Math.PI * 2.4 + time * 0.065 + lineRipple * 0.04) * wSlow
        + Math.sin(u * Math.PI * 3.8 + time * 0.11) * wFast;
      x += perpX * ripple + wDrift * (1 - u) * 0.25;
      y += perpY * ripple * 0.4;

      if (waiting && u > 0.55) {
        const dangle = Math.sin(time * 0.06 + u * 4) * 3.5 * (u - 0.5);
        y += dangle;
      }

      pts.push({ x, y });
    }
    return pts;
  }

  function traceSmoothPath(ctx, pts) {
    if (pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) * 0.5;
      const my = (pts[i].y + pts[i + 1].y) * 0.5;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  function drawLine(ctx, tip, bob, opts, time) {
    const pts = sampleLine(tip, bob, opts, time);
    const { fighting = false, tension = 0, waiting = false, bite = false } = opts;

    const baseW = fighting ? 2.2 + tension * 1.4 : waiting ? 1.35 : 1.15;
    const tight = fighting && tension > 0.4;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    traceSmoothPath(ctx, pts);
    ctx.strokeStyle = 'rgba(0,0,0,0.42)';
    ctx.lineWidth = baseW + 2.2;
    ctx.stroke();

    traceSmoothPath(ctx, pts);
    const grad = ctx.createLinearGradient(tip.x, tip.y, bob.x, bob.y);
    if (fighting) {
      if (tension > 0.72) {
        grad.addColorStop(0, 'rgba(255,120,90,0.95)');
        grad.addColorStop(1, 'rgba(255,60,50,0.98)');
      } else {
        grad.addColorStop(0, 'rgba(200,230,255,0.9)');
        grad.addColorStop(1, 'rgba(140,200,255,0.95)');
      }
    } else {
      grad.addColorStop(0, 'rgba(235,245,255,0.75)');
      grad.addColorStop(0.45, 'rgba(255,255,255,0.92)');
      grad.addColorStop(1, 'rgba(220,235,250,0.88)');
    }
    ctx.strokeStyle = grad;
    ctx.lineWidth = baseW;
    ctx.stroke();

    if (!tight) {
      traceSmoothPath(ctx, pts);
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = Math.max(0.45, baseW * 0.38);
      ctx.stroke();
    }

    if (waiting || bite) {
      const leader = pts.slice(-6);
      traceSmoothPath(ctx, leader);
      ctx.strokeStyle = bite ? 'rgba(255,200,180,0.5)' : 'rgba(200,220,240,0.35)';
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawRod(ctx, base, tip) {
    const midX = base.x - (base.x - tip.x) * 0.4;
    const midY = base.y - (base.y - tip.y) * 0.5;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(base.x, base.y);
    ctx.quadraticCurveTo(midX, midY, tip.x, tip.y);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(base.x, base.y);
    ctx.quadraticCurveTo(midX, midY, tip.x, tip.y);
    const grad = ctx.createLinearGradient(base.x, base.y, tip.x, tip.y);
    grad.addColorStop(0, '#5D4037');
    grad.addColorStop(0.45, '#A1887F');
    grad.addColorStop(1, '#EFEBE9');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();
  }

  return {
    update, drawLine, drawRod, sampleLine,
  };
})();
