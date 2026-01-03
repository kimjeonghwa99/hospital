// ===== 유틸 =====
const $ = (id) => document.getElementById(id);

function setText(id, msg) {
  const el = $(id);
  if (el) el.textContent = msg || '';
}

function setGroupError(inputId, isError) {
  const input = $(inputId);
  if (!input) return;
  const group = input.closest('.input-group');
  if (!group) return;
  group.classList.toggle('error', !!isError);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===== 회원가입(데모) =====
function handleSignup() {
  const name = $('name')?.value.trim();
  const email = $('email')?.value.trim();
  const role = $('role')?.value;
  const pw = $('password')?.value;
  const pw2 = $('password2')?.value;

  // 초기화
  ['nameError','emailError','roleError','pwError','pw2Error'].forEach(id => setText(id,''));
  ['name','email','role','password','password2'].forEach(id => setGroupError(id,false));

  let ok = true;

  if (!name) { setText('nameError','이름을 입력해주세요.'); setGroupError('name',true); ok = false; }
  if (!email) { setText('emailError','이메일을 입력해주세요.'); setGroupError('email',true); ok = false; }
  else if (!validateEmail(email)) { setText('emailError','올바른 이메일 형식이 아닙니다.'); setGroupError('email',true); ok = false; }

  if (!role) { setText('roleError','직군을 선택해주세요.'); setGroupError('role',true); ok = false; }

  if (!pw) { setText('pwError','비밀번호를 입력해주세요.'); setGroupError('password',true); ok = false; }
  else if (pw.length < 6) { setText('pwError','비밀번호는 6자 이상이어야 합니다.'); setGroupError('password',true); ok = false; }

  if (!pw2) { setText('pw2Error','비밀번호 확인을 입력해주세요.'); setGroupError('password2',true); ok = false; }
  else if (pw !== pw2) { setText('pw2Error','비밀번호가 일치하지 않습니다.'); setGroupError('password2',true); ok = false; }

  if (!ok) return;

  // 데모 저장 (실서비스에서는 비밀번호 저장 금지)
  localStorage.setItem('demo_user_name', name);
  localStorage.setItem('demo_user_email', email);
  localStorage.setItem('demo_user_role', role);

  alert('계정 생성(데모) 완료! 로그인 페이지로 이동합니다.');
  window.location.href = './login.html';
}

// ===== 로그인(데모) =====
function handleLogin() {
  const email = $('email')?.value.trim();
  const pw = $('password')?.value;

  // 초기화
  ['emailError','pwError'].forEach(id => setText(id,''));
  ['email','password'].forEach(id => setGroupError(id,false));

  let ok = true;

  if (!email) { setText('emailError','이메일을 입력해주세요.'); setGroupError('email',true); ok = false; }
  else if (!validateEmail(email)) { setText('emailError','올바른 이메일 형식이 아닙니다.'); setGroupError('email',true); ok = false; }

  if (!pw) { setText('pwError','패스워드를 작성해주세요!'); setGroupError('password',true); ok = false; }

  if (!ok) return;

  // 데모: 가입한 이메일이 있으면 그 이메일로만 로그인 허용(간단)
  const demoEmail = localStorage.getItem('demo_user_email');
  if (demoEmail && demoEmail !== email) {
    setText('emailError', '등록된 이메일과 일치하지 않습니다(데모).');
    setGroupError('email', true);
    return;
  }

  // 데모 토큰 저장
  localStorage.setItem('auth_token', 'demo_token');
  window.location.href = './index.html';
}

// ===== 페이지별로 자동 바인딩 =====
document.addEventListener('DOMContentLoaded', () => {
  // signup.html
  const signupBtn = $('signupBtn');
  if (signupBtn) signupBtn.addEventListener('click', handleSignup);

  // login.html
  const loginBtn = $('loginBtn');
  if (loginBtn) loginBtn.addEventListener('click', handleLogin);
});
