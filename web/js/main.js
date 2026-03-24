// --- State & Namespace ---
'use strict';

var Bio = {};

var currentDate = new Date();
Bio.viewYear = currentDate.getFullYear();
Bio.viewMonth = currentDate.getMonth();
Bio._animationProgress = 0;
Bio._animationId = null;
