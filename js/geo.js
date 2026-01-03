// js/geo.js
// ===== 위치/거리 유틸 =====

// GPS 가져오기 (Promise)
function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 브라우저는 위치 기능을 지원하지 않습니다.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
      ...options
    });
  });
}

// 두 좌표 거리(m) - Haversine
function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// 거리 체크 + 결과 반환
async function checkWithinRadius({
  baseLat,
  baseLng,
  radiusM,
  options
}) {
  const pos = await getCurrentPosition(options);
  const curLat = pos.coords.latitude;
  const curLng = pos.coords.longitude;
  const accuracy = pos.coords.accuracy; // meters

  const d = distanceMeters(baseLat, baseLng, curLat, curLng);

  return {
    ok: d <= radiusM,
    distanceM: d,
    currentLat: curLat,
    currentLng: curLng,
    accuracyM: accuracy
  };
}
