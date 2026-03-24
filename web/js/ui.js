// --- UI: DOM refs, event listeners, info cards, navigation, localStorage ---
'use strict';

var Bio = Bio || {};

// --- Tooltip ---

(function () {
  var canvas = document.getElementById('bioChart');
  var tooltip = document.getElementById('tooltip');

  canvas.addEventListener('mousemove', function (e) {
    var birthdateInput = document.getElementById('birthdate');
    if (!birthdateInput.value) return;

    var rect = canvas.getBoundingClientRect();
    var drawW = rect.width;
    var drawH = rect.height;
    var padLeft = 45;
    var padRight = 15;
    var padTop = 20;
    var padBottom = 35;
    var chartW = drawW - padLeft - padRight;
    var chartH = drawH - padTop - padBottom;

    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;

    if (mx < padLeft || mx > padLeft + chartW || my < padTop || my > padTop + chartH) {
      tooltip.classList.remove('visible');
      return;
    }

    var daysInMonth = new Date(Bio.viewYear, Bio.viewMonth + 1, 0).getDate();
    var dayFrac = ((mx - padLeft) / chartW) * daysInMonth + 1;
    var day = Math.round(dayFrac);
    if (day < 1 || day > daysInMonth) {
      tooltip.classList.remove('visible');
      return;
    }

    var date = new Date(Bio.viewYear, Bio.viewMonth, day);
    var vals = Bio.getBiorhythmValues(date);
    if (!vals) {
      tooltip.classList.remove('visible');
      return;
    }

    var dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    var pPct = (vals.physical * 100).toFixed(0);
    var ePct = (vals.emotional * 100).toFixed(0);
    var iPct = (vals.intellectual * 100).toFixed(0);

    tooltip.innerHTML =
      '<strong>' + dateStr + '</strong> (Day ' + vals.days + ')<br>' +
      '<span style="color:' + Bio.COLORS.physical + '">Physical: ' + pPct + '%</span><br>' +
      '<span style="color:' + Bio.COLORS.emotional + '">Emotional: ' + ePct + '%</span><br>' +
      '<span style="color:' + Bio.COLORS.intellectual + '">Intellectual: ' + iPct + '%</span>';

    tooltip.classList.add('visible');
    tooltip.style.left = (e.clientX + 14) + 'px';
    tooltip.style.top = (e.clientY - 14) + 'px';
  });

  canvas.addEventListener('mouseleave', function () {
    tooltip.classList.remove('visible');
  });
})();

// --- Info Cards ---

Bio.updateInfoCards = function () {
  var today = new Date();
  var vals = Bio.getBiorhythmValues(today);

  if (!vals) {
    document.getElementById('physicalValue').textContent = '--';
    document.getElementById('emotionalValue').textContent = '--';
    document.getElementById('intellectualValue').textContent = '--';
    document.getElementById('physicalDesc').textContent = 'Enter your birthdate';
    document.getElementById('emotionalDesc').textContent = 'Enter your birthdate';
    document.getElementById('intellectualDesc').textContent = 'Enter your birthdate';
    return;
  }

  document.getElementById('physicalValue').textContent = (vals.physical * 100).toFixed(0) + '%';
  document.getElementById('emotionalValue').textContent = (vals.emotional * 100).toFixed(0) + '%';
  document.getElementById('intellectualValue').textContent = (vals.intellectual * 100).toFixed(0) + '%';
  document.getElementById('physicalDesc').textContent = Bio.getStateDescription(vals.physical);
  document.getElementById('emotionalDesc').textContent = Bio.getStateDescription(vals.emotional);
  document.getElementById('intellectualDesc').textContent = Bio.getStateDescription(vals.intellectual);
};

// --- Month Navigation ---

Bio.updateMonthDisplay = function () {
  var monthDisplay = document.getElementById('monthDisplay');
  var date = new Date(Bio.viewYear, Bio.viewMonth, 1);
  monthDisplay.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

(function () {
  var prevBtn = document.getElementById('prevMonth');
  var currentBtn = document.getElementById('currentMonth');
  var nextBtn = document.getElementById('nextMonth');

  prevBtn.addEventListener('click', function () {
    Bio.viewMonth--;
    if (Bio.viewMonth < 0) { Bio.viewMonth = 11; Bio.viewYear--; }
    Bio.updateMonthDisplay();
    Bio.animateChart();
  });

  nextBtn.addEventListener('click', function () {
    Bio.viewMonth++;
    if (Bio.viewMonth > 11) { Bio.viewMonth = 0; Bio.viewYear++; }
    Bio.updateMonthDisplay();
    Bio.animateChart();
  });

  currentBtn.addEventListener('click', function () {
    var now = new Date();
    Bio.viewYear = now.getFullYear();
    Bio.viewMonth = now.getMonth();
    Bio.updateMonthDisplay();
    Bio.animateChart();
  });
})();

// --- localStorage Persistence ---

Bio.saveSettings = function () {
  try {
    var birthdateInput = document.getElementById('birthdate');
    var nameInput = document.getElementById('name');
    localStorage.setItem('biorhythm_birthdate', birthdateInput.value);
    localStorage.setItem('biorhythm_name', nameInput.value);
  } catch (e) { /* storage unavailable */ }
};

Bio.loadSettings = function () {
  try {
    var birthdateInput = document.getElementById('birthdate');
    var nameInput = document.getElementById('name');
    var bd = localStorage.getItem('biorhythm_birthdate');
    var nm = localStorage.getItem('biorhythm_name');
    if (bd) birthdateInput.value = bd;
    if (nm) nameInput.value = nm;
  } catch (e) { /* storage unavailable */ }
};

(function () {
  var birthdateInput = document.getElementById('birthdate');
  var nameInput = document.getElementById('name');

  birthdateInput.addEventListener('change', function () {
    Bio.saveSettings();
    Bio.updateInfoCards();
    Bio.animateChart();
  });

  nameInput.addEventListener('input', function () {
    Bio.saveSettings();
  });
})();

// --- Resize Handler ---

window.addEventListener('resize', function () {
  Bio.drawChart(Bio._animationProgress || 1);
});

// --- Init ---

(function () {
  Bio.loadSettings();
  Bio.updateMonthDisplay();
  Bio.updateInfoCards();
  Bio.animateChart();
})();
