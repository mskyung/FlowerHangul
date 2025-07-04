// script.js 파일 내용

// 입력 상자 (textarea)와 버튼들 가져오기
const kkotipInput = document.getElementById('kkotipInput');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');
const debugOutput = document.getElementById('debugOutput'); // 디버그 출력용

// 제스처 감지를 위한 변수
let isDragging = false;
let startX = 0;
let startY = 0;
let activeButton = null; // 현재 어떤 버튼이 눌렸는지 (leftButton 또는 rightButton)
let dragDirectionHistory = []; // 드래그 방향 변화를 기록 (왕복 드래그 감지용)
let lastDirection = ''; // 마지막으로 감지된 주된 방향
const DRAG_THRESHOLD = 3; // 드래그로 인식할 최소 거리 (픽셀)
const DIRECTION_CHANGE_THRESHOLD = 0.5; // 방향 전환으로 인식할 최소 거리
// const LONG_PRESS_DELAY = 500; // 일정 시간 누르기 (밀리초) - 필요 시 사용
// let longPressTimer = null;


// 제스처와 문자 매핑 정의 (오빠의 요청에 따라 모음 제스처 추가)
const gestureMap = {
    // ==== 모음 버튼 제스처 (rightButton) ====
    'rightButton_drag_up': 'ㅗ',
    'rightButton_drag_down': 'ㅜ',
    'rightButton_drag_left': 'ㅓ',
    'rightButton_drag_right': 'ㅏ',
    'rightButton_drag_rightup': 'ㅡ',
    'rightButton_drag_leftdown': 'ㅣ',

    'rightButton_drag_roundtrip_up': 'ㅛ', // 위로 왕복
    'rightButton_drag_roundtrip_down': 'ㅠ', // 아래로 왕복
    'rightButton_drag_roundtrip_left': 'ㅕ', // 좌로 왕복
    'rightButton_drag_roundtrip_right': 'ㅑ', // 우로 왕복
    
    // 'rightButton_longpress_drag_up': 'something', // 일정 시간 누른 후 드래그 (추후 구현)

    // ==== 자음 버튼 제스처 (leftButton) - 예시, 필요 시 추가/수정 ====
    'leftButton_drag_up': 'ㄱ',
    'leftButton_drag_down': 'ㄴ',
    'leftButton_drag_left': 'ㄷ',
    'leftButton_drag_right': 'ㄹ',
    // 'leftButton_drag_roundtrip_up': 'ㄲ', // 왕복 자음도 추가 가능
};

// ===========================================
// 드래그 시작 시 호출되는 함수
// ===========================================
function handleStart(e) {
    isDragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    activeButton = e.currentTarget.id; // 현재 눌린 버튼 ID 저장
    dragDirectionHistory = []; // 방향 기록 초기화
    lastDirection = ''; // 마지막 방향 초기화

    // 일정 시간 누르기 타이머 (필요 시 주석 해제)
    // longPressTimer = setTimeout(() => {
    //     debugOutput.textContent += ' (길게 누르기 인식)';
    // }, LONG_PRESS_DELAY);

    debugOutput.textContent = `드래그 시작: ${activeButton}`;
}

// ===========================================
// 드래그 중 호출되는 함수 (방향 변화 감지)
// ===========================================
function handleMove(e) {
    if (!isDragging) return;

    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const currentY = e.touches ? e.touches[0].clientY : e.clientY;

    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // 드래그 방향 감지 (4방향)
    let currentDirection = '';
    if (Math.abs(deltaX) > Math.abs(deltaY)) { // 좌우 드래그
        if (Math.abs(deltaX) > DIRECTION_CHANGE_THRESHOLD) {
            currentDirection = deltaX > 0 ? 'right' : 'left';
        }
    } else { // 상하 드래그
        if (Math.abs(deltaY) > DIRECTION_CHANGE_THRESHOLD) {
            currentDirection = deltaY > 0 ? 'down' : 'up';
        }
    }

    if (currentDirection && currentDirection !== lastDirection) {
        dragDirectionHistory.push(currentDirection);
        lastDirection = currentDirection;
        // 디버깅용
        // debugOutput.textContent = `방향 전환: ${currentDirection} (기록: ${dragDirectionHistory.join(',')})`;
    }
    debugOutput.textContent = `드래그 중: dx=${deltaX.toFixed(0)}, dy=${deltaY.toFixed(0)}`;
}

// ===========================================
// 드래그 종료 시 호출되는 함수 (제스처 최종 판단)
// ===========================================

/*
function handleEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    // clearTimeout(longPressTimer); // 타이머 취소 (필요 시 주석 해제)

    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const endY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

    const deltaX = endX - startX;
    const deltaY = endY - startY;

    // 드래그로 인식할 최소 이동 거리 (이 거리 이하면 단순 탭으로 간주)
    const DRAG_THRESHOLD = 30; 
    if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) < DRAG_THRESHOLD) {
        debugOutput.textContent = `너무 짧은 움직임 (${activeButton})`;
        activeButton = null;
        return;
    }

    // ==== 각도 계산 ====
    let angleRad = Math.atan2(deltaY, deltaX); // 라디안 각도 (-PI ~ PI)
    let angleDeg = angleRad * (180 / Math.PI); // 도 단위 각도 (-180 ~ 180)

    // 각도를 0 ~ 360도로 정규화 (선택 사항, 구간 나누기 편의상)
    if (angleDeg < 0) {
        angleDeg += 360;
    }

    let direction = '';

    // ==== 8방향 구간 나누기 ====
    if (angleDeg >= 337.5 || angleDeg < 22.5) {
        direction = 'right'; // 오
    } else if (angleDeg >= 22.5 && angleDeg < 67.5) {
        direction = 'bottom-right'; // 오아
    } else if (angleDeg >= 67.5 && angleDeg < 112.5) {
        direction = 'down'; // 아
    } else if (angleDeg >= 112.5 && angleDeg < 157.5) {
        direction = 'bottom-left'; // 아왼
    } else if (angleDeg >= 157.5 && angleDeg < 202.5) {
        direction = 'left'; // 왼
    } else if (angleDeg >= 202.5 && angleDeg < 247.5) {
        direction = 'top-left'; // 왼위
    } else if (angleDeg >= 247.5 && angleDeg < 292.5) {
        direction = 'up'; // 위
    } else if (angleDeg >= 292.5 && angleDeg < 337.5) {
        direction = 'top-right'; // 오위
    }

    // 디버그 출력
    debugOutput.textContent = `각도: ${angleDeg.toFixed(1)}°, 방향: ${direction}`;
    
    // ... (이후 왕복 드래그 감지 및 문자 매핑 로직) ...
}

*/
================================================================================================================================================================================================================
function handleEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    // clearTimeout(longPressTimer); // 타이머 취소 (필요 시 주석 해제)

    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const endY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

    const totalDeltaX = endX - startX;
    const totalDeltaY = endY - startY;

    let recognizedGesture = '';

    // 드래그 거리 임계값 확인
    if (Math.sqrt(totalDeltaX * totalDeltaX + totalDeltaY * totalDeltaY) < DRAG_THRESHOLD) {
        // 드래그로 인식하기엔 너무 짧은 움직임 (탭으로 간주할 수도 있음)
        debugOutput.textContent = `너무 짧은 움직임 (${activeButton})`;
        activeButton = null;
        return; 
    }

    // ==== 왕복 드래그 감지 로직 ====
    // 방향 기록에서 처음과 끝 방향이 반대이고, 중간에 한 번만 방향 전환이 있었는지 확인
    if (dragDirectionHistory.length >= 2) {
        const firstDir = dragDirectionHistory[0];
        const lastDir = dragDirectionHistory[dragDirectionHistory.length - 1];
        
        let isRoundTrip = false;
        if (firstDir === 'up' && lastDir === 'down') isRoundTrip = true;
        if (firstDir === 'down' && lastDir === 'up') isRoundTrip = true;
        if (firstDir === 'left' && lastDir === 'right') isRoundTrip = true;
        if (firstDir === 'right' && lastDir === 'left') isRoundTrip = true;

        if (isRoundTrip) {
            recognizedGesture = `${activeButton}_drag_roundtrip_${firstDir}`;
        }
    }
    
    // 왕복 드래그가 아니면 일반 드래그 감지
    if (!recognizedGesture) {
        if (Math.abs(totalDeltaX) > Math.abs(totalDeltaY)) { // 좌우 드래그
            recognizedGesture = `${activeButton}_drag_${totalDeltaX > 0 ? 'right' : 'left'}`;
        } else { // 상하 드래그
            recognizedGesture = `${activeButton}_drag_${totalDeltaY > 0 ? 'down' : 'up'}`;
        }
    }

    // 디버그 출력
    debugOutput.textContent = `인식된 제스처: ${recognizedGesture}`;

    // 제스처에 해당하는 문자 입력
    const charToInsert = gestureMap[recognizedGesture];
    if (charToInsert) {
        kkotipInput.value += charToInsert;
        debugOutput.textContent += ` (입력: ${charToInsert})`;
    } else {
        debugOutput.textContent += ` (매핑 없음)`;
    }

    kkotipInput.focus();
    kkotipInput.setSelectionRange(kkotipInput.value.length, kkotipInput.value.length);
    activeButton = null;
}


// ===========================================
// 이벤트 리스너 등록 (PC 마우스 이벤트와 모바일 터치 이벤트 모두)
// ===========================================
[leftButton, rightButton].forEach(button => {
    // 마우스 이벤트
    button.addEventListener('mousedown', handleStart);
    button.addEventListener('mousemove', handleMove);
    button.addEventListener('mouseup', handleEnd);
    button.addEventListener('mouseleave', handleEnd); // 버튼 밖으로 벗어날 경우 종료

    // 터치 이벤트
    button.addEventListener('touchstart', handleStart);
    button.addEventListener('touchmove', handleMove);
    button.addEventListener('touchend', handleEnd);
    button.addEventListener('touchcancel', handleEnd); // 터치 중단 시 (예: 전화 옴)
});


// Refresh 버튼 기능 (이전과 동일)
const refreshButton = document.getElementById('refreshButton');
if (refreshButton) { // refreshButton이 있을 경우에만 이벤트 리스너 추가
    refreshButton.addEventListener('click', () => {
        kkotipInput.value = ''; // 입력 상자의 내용을 비움
        kkotipInput.focus(); // 초기화 후 다시 입력 상자에 커서 포커스
        debugOutput.textContent = ''; // 디버그 메시지도 초기화
    });
}