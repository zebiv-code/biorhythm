// --- Canvas Drawing ---
'use strict';

var Bio = Bio || {};

Bio.drawChart = function (progress) {
  var canvas = document.getElementById('bioChart');
  var ctx = canvas.getContext('2d');
  var birthdateInput = document.getElementById('birthdate');
  var dpr = window.devicePixelRatio || 1;

  // Handle high-DPI displays
  var rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  var drawW = rect.width;
  var drawH = rect.height;

  var padLeft = 45;
  var padRight = 15;
  var padTop = 20;
  var padBottom = 35;
  var chartW = drawW - padLeft - padRight;
  var chartH = drawH - padTop - padBottom;

  ctx.clearRect(0, 0, drawW, drawH);

  // Background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, drawW, drawH);

  var daysInMonth = new Date(Bio.viewYear, Bio.viewMonth + 1, 0).getDate();

  // Grid lines
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 0.5;

  // Horizontal grid (5 lines: -1, -0.5, 0, 0.5, 1)
  for (var i = 0; i <= 4; i++) {
    var y = padTop + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(padLeft + chartW, y);
    ctx.stroke();
  }

  // Zero line (brighter)
  var zeroY = padTop + chartH / 2;
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padLeft, zeroY);
  ctx.lineTo(padLeft + chartW, zeroY);
  ctx.stroke();

  // Y-axis labels
  ctx.fillStyle = '#555';
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  var yLabels = ['+100%', '+50%', '0%', '-50%', '-100%'];
  for (var i = 0; i <= 4; i++) {
    var y = padTop + (chartH / 4) * i;
    ctx.fillText(yLabels[i], padLeft - 6, y);
  }

  // Date labels along X axis
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#555';
  var step = daysInMonth > 28 ? 2 : 1;
  for (var d = 1; d <= daysInMonth; d += step) {
    var x = padLeft + ((d - 0.5) / daysInMonth) * chartW;
    ctx.fillText(d.toString(), x, padTop + chartH + 6);

    // Vertical grid
    ctx.strokeStyle = '#151515';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, padTop);
    ctx.lineTo(x, padTop + chartH);
    ctx.stroke();
  }

  // Draw biorhythm curves
  if (birthdateInput.value) {
    Bio._drawCurve(ctx, 'physical', Bio.PHYSICAL_PERIOD, progress, padLeft, padTop, chartW, chartH, daysInMonth);
    Bio._drawCurve(ctx, 'emotional', Bio.EMOTIONAL_PERIOD, progress, padLeft, padTop, chartW, chartH, daysInMonth);
    Bio._drawCurve(ctx, 'intellectual', Bio.INTELLECTUAL_PERIOD, progress, padLeft, padTop, chartW, chartH, daysInMonth);

    // Critical day markers
    var criticals = Bio.findCriticalDays();
    criticals.forEach(function (c) {
      var x = padLeft + ((c.day - 0.5) / daysInMonth) * chartW;
      var animX = x * progress;

      // Diamond marker
      ctx.save();
      ctx.translate(animX, padTop - 8);
      var size = 3 + c.severity * 1.5;
      ctx.fillStyle = c.severity >= 3 ? '#ff4444' : c.severity >= 2 ? '#ffaa00' : '#ffdd44';
      ctx.globalAlpha = progress;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // Today line
    var today = new Date();
    if (today.getFullYear() === Bio.viewYear && today.getMonth() === Bio.viewMonth) {
      var todayX = padLeft + ((today.getDate() - 0.5) / daysInMonth) * chartW;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(todayX, padTop);
      ctx.lineTo(todayX, padTop + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '9px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Today', todayX, padTop + chartH + 22);
    }
  }
};

Bio._drawCurve = function (ctx, type, period, progress, padLeft, padTop, chartW, chartH, daysInMonth) {
  var color = Bio.COLORS[type];

  // Glow effect
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.4 * progress;
  ctx.beginPath();

  for (var px = 0; px <= chartW; px++) {
    var day = (px / chartW) * daysInMonth + 1;
    var date = new Date(Bio.viewYear, Bio.viewMonth, day);
    var vals = Bio.getBiorhythmValues(date);
    if (!vals) continue;
    var value = vals[type];
    var x = padLeft + px;
    var y = padTop + chartH / 2 - (value * chartH / 2);
    if (px === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();

  // Main line
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = progress;
  ctx.beginPath();

  var maxPx = chartW * progress;
  for (var px = 0; px <= maxPx; px++) {
    var day = (px / chartW) * daysInMonth + 1;
    var date = new Date(Bio.viewYear, Bio.viewMonth, day);
    var vals = Bio.getBiorhythmValues(date);
    if (!vals) continue;
    var value = vals[type];
    var x = padLeft + px;
    var y = padTop + chartH / 2 - (value * chartH / 2);
    if (px === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
};

// --- Animation ---

Bio.animateChart = function () {
  if (Bio._animationId) cancelAnimationFrame(Bio._animationId);
  Bio._animationProgress = 0;

  function step() {
    Bio._animationProgress += 0.03;
    if (Bio._animationProgress > 1) Bio._animationProgress = 1;
    Bio.drawChart(Bio._animationProgress);
    if (Bio._animationProgress < 1) {
      Bio._animationId = requestAnimationFrame(step);
    }
  }
  Bio._animationId = requestAnimationFrame(step);
};
