// --- Biorhythm Calculations ---
'use strict';

var Bio = Bio || {};

Bio.PHYSICAL_PERIOD = 23;
Bio.EMOTIONAL_PERIOD = 28;
Bio.INTELLECTUAL_PERIOD = 33;

Bio.COLORS = {
  physical: '#00ff88',
  emotional: '#ff00ff',
  intellectual: '#00ccff'
};

Bio.calculateBiorhythm = function (days, period) {
  return Math.sin((2 * Math.PI * days) / period);
};

Bio.getDaysSinceBirth = function (targetDate) {
  var birthdateInput = document.getElementById('birthdate');
  var birth = new Date(birthdateInput.value);
  if (isNaN(birth.getTime())) return null;
  var diffMs = targetDate.getTime() - birth.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

Bio.getBiorhythmValues = function (date) {
  var days = Bio.getDaysSinceBirth(date);
  if (days === null || days < 0) return null;
  return {
    physical: Bio.calculateBiorhythm(days, Bio.PHYSICAL_PERIOD),
    emotional: Bio.calculateBiorhythm(days, Bio.EMOTIONAL_PERIOD),
    intellectual: Bio.calculateBiorhythm(days, Bio.INTELLECTUAL_PERIOD),
    days: days
  };
};

Bio.getStateDescription = function (value) {
  var abs = Math.abs(value);
  if (abs < 0.05) return 'Critical (crossing zero)';
  if (value > 0.7) return 'Peak performance';
  if (value > 0.3) return 'Above average';
  if (value > 0) return 'Slightly positive';
  if (value > -0.3) return 'Slightly negative';
  if (value > -0.7) return 'Below average';
  return 'Low point';
};

// --- Critical Day Detection ---

Bio.findCriticalDays = function () {
  var birthdateInput = document.getElementById('birthdate');
  var birth = new Date(birthdateInput.value);
  if (isNaN(birth.getTime())) return [];

  var year = Bio.viewYear;
  var month = Bio.viewMonth;
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var criticals = [];

  for (var d = 1; d <= daysInMonth; d++) {
    var date = new Date(year, month, d);
    var vals = Bio.getBiorhythmValues(date);
    if (!vals) continue;

    var p = Math.abs(vals.physical);
    var e = Math.abs(vals.emotional);
    var i = Math.abs(vals.intellectual);

    var severity = 0;
    if (p < 0.05) severity++;
    if (e < 0.05) severity++;
    if (i < 0.05) severity++;

    // Check convergence within 5%
    var range = Math.max(vals.physical, vals.emotional, vals.intellectual) -
                Math.min(vals.physical, vals.emotional, vals.intellectual);
    if (range < 0.05) severity = Math.max(severity, 2);

    if (severity > 0) {
      criticals.push({ day: d, severity: severity, values: vals });
    }
  }
  return criticals;
};

Bio.getCriticalMarker = function (severity) {
  if (severity >= 3) return '!!!';
  if (severity >= 2) return '!!';
  return '!';
};

Bio.getCriticalDescription = function (severity) {
  if (severity >= 3) return 'Triple critical day - all cycles crossing zero';
  if (severity >= 2) return 'Double critical day - exercise caution';
  return 'Critical day - one cycle crossing zero';
};
