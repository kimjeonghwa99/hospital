// js/attendance.js
// ===== 근거리 출퇴근 (geo.js 필요) =====

// 설정값 (나중에 DB에서 불러오게 바꾸면 됨)
const HOSPITAL_LAT = 37.5665;   // TODO: 병원 좌표로 변경
const HOSPITAL_LNG = 126.9780;  // TODO: 병원 좌표로 변경
const ALLOW_DISTANCE_M = 300;   // 200~300m면 300으로 시작 추천

// localStorage keys (오늘 단위)
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

function updateAttendanceUI() {
  setText('checkInText', localStorage.getItem(todayKey('checkin')) || '미처리');
  setText('checkOutText', localStorage.getItem(todayKey('checkout')) || '미처리');
}

async function doAttendance(type) {
  try {
    setText('distanceNotice', '위치 확인 중입니다... (권한 허용 필요)');

    const result = await checkWithinRadius({
      baseLat: HOSPITAL_LAT,
      baseLng: HOSPITAL_LNG,
      radiusM: ALLOW_DISTANCE_M,
      options: { enableHighAccuracy: true }
    });

    // 정확도(accuracy)가 너무 나쁘면 안내 (실무에서 중요)
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
        `병원에서 약 ${Math.round(result.distanceM)}m 떨어져 있습니다. (허용 ${ALLOW_DISTANCE_M}m) 출퇴근 불가`
      );
      return;
    }

    // 처리
    const t = fmtTime();
    if (type === 'in') localStorage.setItem(todayKey('checkin'), t);
    if (type === 'out') localStorage.setItem(todayKey('checkout'), t);

    setText(
      'distanceNotice',
      `병원 근거리 확인 완료 (${Math.round(result.distanceM)}m). ${type === 'in' ? '출근' : '퇴근'} 처리되었습니다.`
    );

    updateAttendanceUI();
  } catch (err) {
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

// 페이지 로드 시 자동 바인딩
document.addEventListener('DOMContentLoaded', bindAttendanceButtons);
