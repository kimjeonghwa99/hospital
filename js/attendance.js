// js/attendance.js
// ===== 근거리 출퇴근 (geo.js 필요) =====

// localStorage keys
const SITE_KEY = 'hospital_site'; // { name, address, lat, lng, radiusM }
const DEFAULT_RADIUS_M = 300;

function todayKey(prefix) {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${prefix}_${yyyy}${mm}${dd}`;
}

function fmtTime() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mi}:${ss}`;
}

function setText(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function getSite() {
  try {
    const raw = localStorage.getItem(SITE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function updateAttendanceUI() {
  setText('checkInText', localStorage.getItem(todayKey('checkin')) || '미처리');
  setText('checkOutText', localStorage.getItem(todayKey('checkout')) || '미처리');

  // 병원 설정 상태 표시
  const site = getSite();
  if (!site) {
    setText('siteStatusText', '미설정');
    setText('distanceNotice', '병원(근무지) 설정이 필요합니다. 상단에서 먼저 설정하세요.');
  } else {
    setText('siteStatusText', `${site.name || '병원'} / 반경 ${site.radiusM || DEFAULT_RADIUS_M}m`);
  }
}

async function doAttendance(type) {
  try {
    const site = getSite();
    if (!site || site.lat == null || site.lng == null) {
      setText('distanceNotice', '병원(근무지) 좌표가 없습니다. 먼저 병원 설정을 저장하세요.');
      return;
    }

    const radiusM = Number(site.radiusM || DEFAULT_RADIUS_M);

    setText('distanceNotice', '위치 확인 중입니다... (권한 허용 필요)');

    const result = await checkWithinRadius({
      baseLat: Number(site.lat),
      baseLng: Number(site.lng),
      radiusM,
      options: { enableHighAccuracy: true }
    });

    // GPS 정확도 낮으면 안내 (실무에서 중요)
    if (result.accuracyM && result.accuracyM > 80) {
      setText(
        'distanceNotice',
        `GPS 정확도가 낮습니다(±${Math.round(result.accuracyM)}m). 실외/창가에서 다시 시도해 주세요.`
      );
      return;
    }

    if (!result.ok) {
      setText(
        'distanceNotice',
        `병원에서 약 ${Math.round(result.distanceM)}m 떨어져 있습니다. (허용 ${radiusM}m) 출퇴근 불가`
      );
      return;
    }

    const t = fmtTime();
    if (type === 'in') localStorage.setItem(todayKey('checkin'), t);
    if (type === 'out') localStorage.setItem(todayKey('checkout'), t);

    setText(
      'distanceNotice',
      `근거리 확인 완료 (${Math.round(result.distanceM)}m). ${type === 'in' ? '출근' : '퇴근'} 처리되었습니다.`
    );

    updateAttendanceUI();
  } catch {
    setText('distanceNotice', '위치 정보를 가져오지 못했습니다. 브라우저 위치 권한을 허용해주세요.');
  }
}

function bindAttendanceButtons() {
  const inBtn = document.getElementById('checkInBtn');
  const outBtn = document.getElementById('checkOutBtn');

  if (inBtn) inBtn.addEventListener('click', () => doAttendance('in'));
  if (outBtn) outBtn.addEventListener('click', () => doAttendance('out'));

  updateAttendanceUI();
}

// 다른 스크립트(대시보드)에서 설정 저장하면 UI 갱신할 수 있게 노출
window.__attendanceRefresh = updateAttendanceUI;

document.addEventListener('DOMContentLoaded', bindAttendanceButtons);
