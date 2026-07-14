var SHEET_URL = 'https://script.google.com/macros/s/AKfycbyFWl5PJdoPTdgngM1QHbuvphl-_xjo00hqY8NHW1rI0B8MNwiVLqle-d1RnbVtf2J0/exec';
var counts = { kids: 1 };
var mins   = { kids: 1 };
var maxs   = { kids: 4 };

var acValue = true;


var shareValue = true; 

function setAC(val) {
  acValue = val;
  document.getElementById('ac-yes').classList.toggle('active', val);
  document.getElementById('ac-no').classList.toggle('active', !val);
}

function setShare(val) {
  shareValue = val;
  document.getElementById('share-private').classList.toggle('active', val);
  document.getElementById('share-shared').classList.toggle('active', !val);
}

function change(key, delta) {
  counts[key] = Math.min(maxs[key], Math.max(mins[key], counts[key] + delta));
  document.getElementById(key + '-val').textContent = counts[key];
}

// ===== تحويل الأرقام العربية/الفارسية للإنجليزية =====
function toEnglishDigits(str) {
  return str
    .replace(/[٠-٩]/g, function(d) { return d.charCodeAt(0) - 1632; })
    .replace(/[۰-۹]/g, function(d) { return d.charCodeAt(0) - 1776; });
}

// أثناء الكتابة في حقل التليفون: نحول أي أرقام عربي لإنجليزي، ونمنع أي حرف مش رقم، ونوقف عند 11 رقم
(function initPhoneField() {
  var phoneInput = document.getElementById('phone');
  if (!phoneInput) return;
  phoneInput.addEventListener('input', function(e) {
    var val = toEnglishDigits(e.target.value);
    val = val.replace(/[^\d]/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    e.target.value = val;
  });
})();

// ===== تحويل الوقت =====
function fmt(t) {
  if (!t) return 'none';
  var p = t.split(':');
  var h = parseInt(p[0]);
  var m = p[1];
  var ampm = h >= 12 ? 'م' : 'ص';
  h = h % 12 || 12;
  return h + ':' + m + ' ' + ampm;
}
// ===== إظهار الأخطاء =====
function setError(id, has) {
  var inp = document.getElementById(id);
  var err = document.getElementById('err-' + id);
  if (inp) {
    if (has) inp.classList.add('error');
    else inp.classList.remove('error');
  }
  if (err) err.style.display = has ? 'block' : 'none';
}

// ===== إرسال الفورم =====
function submitForm() {
  var name    = document.getElementById('name').value.trim();
  var phone = document.getElementById('phone').value.trim().replace(/\s/g, '');
  phone = toEnglishDigits(phone);
  var school  = document.getElementById('school').value.trim();
  var from    = document.getElementById('from').value.trim();
  var to      = document.getElementById('to').value.trim();
  var tFrom   = document.getElementById('time-from').value;
  var tTo     = document.getElementById('time-to').value;
  var notes   = document.getElementById('notes').value.trim();
  var carType = document.getElementById('car-type').value;

  // التحقق
  var valid = true;

  setError('name', !name);
  if (!name) valid = false;

  var phoneOk = /^01[0125]\d{8}$/.test(phone);
  setError('phone', !phoneOk);
  if (!phoneOk) valid = false;

  setError('school', !school);
  if (!school) valid = false;

  setError('from', !from);
  if (!from) valid = false;

  setError('to', !to);
  if (!to) valid = false;

  var timeErr = tFrom && tTo && tFrom >= tTo;
  document.getElementById('err-time').style.display = timeErr ? 'block' : 'none';
  if (timeErr) valid = false;

  if (!valid) return;

  // Loading state
  var btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'جاري الإرسال...';

  // البيانات
  var data = {
    name:     name,
    phone:    phone,
    school:   school,
    from:     from,
    to:       to,
    kids:     String(counts.kids),
    shareType: shareValue ? 'خاصة' : 'مشتركة',
    timeFrom: fmt(tFrom),
    timeTo:   fmt(tTo),
    carType:  carType,
    ac:       acValue ? 'آه' : 'لأ',
    notes:    notes || 'none'
  };

  // الإرسال للشيت
  fetch(SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  .then(function() {
    document.getElementById('form-area').style.display = 'none';
    document.getElementById('success-box').style.display = 'block';
  })
  .catch(function() {
    btn.disabled = false;
    btn.textContent = 'إرسال الطلب';
    alert('حصل خطأ، حاول تاني من فضلك');
  });
}

// ===== إعادة تعيين الفورم =====
function resetForm() {
  document.getElementById('name').value      = '';
  document.getElementById('phone').value     = '';
  document.getElementById('school').value    = '';
  document.getElementById('from').value      = '';
  document.getElementById('to').value        = '';
  document.getElementById('notes').value     = '';
  document.getElementById('time-from').value = '06:30';
  document.getElementById('time-to').value   = '07:30';
  document.getElementById('car-type').value  = 'ملاكي';

  counts.kids  = 1;
  maxs.kids    = 4;
  document.getElementById('kids-val').textContent  = '1';

  setAC(true);
  setShare(true);

  ['name', 'phone', 'school', 'from', 'to'].forEach(function(id) { setError(id, false); });
  document.getElementById('err-time').style.display = 'none';

  var btn = document.getElementById('submit-btn');
  btn.disabled    = false;
  btn.textContent = 'إرسال الطلب';

  document.getElementById('form-area').style.display  = 'block';
  document.getElementById('success-box').style.display = 'none';
}