// js/settings.js
const SITE_KEY = 'hospital_site';

function setStatus(msg) {
  const el = document.getElementById('siteStatus');
  if (el) el.value = msg;
}

function setResult(msg) {
  const el = document.getElementById('resultBox');
  if (el) el.textContent = msg;
}

function loadSite() {
  try {
    const raw = localStorage.getItem(SITE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function fillForm(site) {
  document.getElementById('siteName').value = site?.name || '';
  document.getElementById('siteAddress').value = site?.address || '';
  document.getElementById('siteLat').value = site?.lat ?? '';
  document.getElementById('siteLng').value = site?.lng ?? '';
  document.getElementById('siteRadius').value = site?.radiusM ?? 300;

  if (!site) setStatus('미설정');
  else setStatus(`${site.name || '병원'} / 반경 ${site.radiusM || 300}m`);
}

document.addEventListener('DOMContentLoaded', () => {
  // 로그인 체크
  if (!localStorage.getItem('auth_token')) {
    location.href = './login.html';
    return;
  }

  // 로그아웃
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('auth_token');
    location.href = './login.html';
  });

  // 초기 로드
  fillForm(loadSite());

  // 저장
  document.getElementById('saveBtn').addEventListener('click', () => {
    const name = document.getElementById('siteName').value.trim();
    const address = document.getElementById('siteAddress').value.trim();
    const lat = Number(document.getElementById('siteLat').value);
    const lng = Number(document.getElementById('siteLng').value);
    const radiusM = Number(document.getElementById('siteRadius').value || 300);

    if (!name || !address) { setResult('병원명/주소를 입력해주세요.'); return; }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) { setResult('위도(lat), 경도(lng)는 숫자로 입력해주세요.'); return; }
    if (!Number.isFinite(radiusM) || radiusM <= 0) { setResult('허용 반경은 1 이상 숫자로 입력해주세요.'); return; }

    const site = { name, address, lat, lng, radiusM };
    localStorage.setItem(SITE_KEY, JSON.stringify(site));
    fillForm(site);
    setResult('저장 완료! 이제 대시보드 출퇴근 기준이 이 병원 좌표/반경으로 적용됩니다.');
  });

  // 삭제
  document.getElementById('clearBtn').addEventListener('click', () => {
    const ok = confirm('병원 설정을 삭제할까요?');
    if (!ok) return;
    localStorage.removeItem(SITE_KEY);
    fillForm(null);
    setResult('삭제 완료. 대시보드에서 출퇴근하려면 다시 설정이 필요합니다.');
  });

  // GPS로 채우기(테스트)
  document.getElementById('fillGpsBtn').addEventListener('click', async () => {
    try {
      const pos = await getCurrentPosition({ enableHighAccuracy: true });
      document.getElementById('siteLat').value = pos.coords.latitude;
      document.getElementById('siteLng').value = pos.coords.longitude;
      setResult('현재 위치로 lat/lng를 채웠습니다. 저장 버튼을 눌러 적용하세요.');
    } catch {
      setResult('현재 위치를 가져오지 못했습니다. 위치 권한을 허용해주세요.');
    }
  });
});
