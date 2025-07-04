// script.js 파일 내용
const kkotipInput = document.getElementById('kkotipInput');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');
const debugOutput = document.getElementById('debugOutput');

let isDragging = false;
let startX = 0;
let startY = 0;
let activeButton = null; // 어떤 버튼이 눌렸는지 기록

// 제스처 매핑 (예시, 오빠의 개념도에 따라 확장해야 함)
const gestureMap = {
    'left_up': 'ㄱ',
    'left_down': 'ㄴ',
    'left_left': 'ㄷ',
    'left_right': 'ㄹ',
    'right_up': 'ㅏ',
    'right_down': 'ㅓ',
    'right_left': 'ㅗ',
    'right_right': 'ㅜ',
    // 여기에 왕복 드래그, 길게 누른 후 드래그 등의 매핑 추가
};

function handleStart(e) {
    isDragging = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    activeButton = e.currentTarget.id; // 클릭된 버튼의 ID 저장

    // 길게 누르기 타이머 시작 (예시)
    // longPressTimer = setTimeout(() => {
    //     // 길게 누르기 상태로 전환
    // }, 500);

    debugOutput.textContent = `드래그 시작: ${activeButton}`;
}

function handleMove(e) {
    if (!isDragging) return;

    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const currentY = e.touches ? e.touches[0].clientY : e.clientY;

    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    // 디버깅용: 현재 드래그 정보 표시
    debugOutput.textContent = `드래그 중: dx=${deltaX.toFixed(0)}, dy=${deltaY.toFixed(0)}`;

    // 여기서 드래그 방향과 거리를 실시간으로 감지할 수 있지만,
    // 보통은 손을 뗄 때 최종적으로 판단함.
}

function handleEnd(e) {
    if (!isDragging) return;
    isDragging = false;
    // clearTimeout(longPressTimer); // 타이머 취소

    const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const endY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

    const deltaX = endX - startX;
    const deltaY = endY - startY;

    const threshold = 50; // 드래그로 인식할 최소 거리 (픽셀)

    let gesture = '';

    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
        // 드래그로 인식될 만큼 움직였을 때
        if (Math.abs(deltaX) > Math.abs(deltaY)) { // 좌우 드래그
            if (deltaX > 0) {
                gesture = `${activeButton.includes('left') ? 'left' : 'right'}_right`;
            } else {
                gesture = `${activeButton.includes('left') ? 'left' : 'right'}_left`;
            }
        } else { // 상하 드래그
            if (deltaY > 0) {
                gesture = `${activeButton.includes('left') ? 'left' : 'right'}_down`;
            } else {
                gesture = `${activeButton.includes('left') ? 'left' : 'right'}_up`;
            }
        }
    } else {
        // 짧게 터치 (탭)
        gesture = `${activeButton.includes('left') ? 'left' : 'right'}_tap`;
    }

    const charToInsert = gestureMap[gesture];
    if (charToInsert) {
        kkotipInput.value += charToInsert;
        debugOutput.textContent = `입력: ${charToInsert} (${gesture})`;
    } else {
        debugOutput.textContent = `인식된 제스처: ${gesture} (매핑 없음)`;
    }

    kkotipInput.focus();
    kkotipInput.setSelectionRange(kkotipInput.value.length, kkotipInput.value.length);
    activeButton = null;
}

// 이벤트 리스너 등록 (PC 마우스 이벤트와 모바일 터치 이벤트 모두)
[leftButton, rightButton].forEach(button => {
    button.addEventListener('mousedown', handleStart);
    button.addEventListener('mousemove', handleMove);
    button.addEventListener('mouseup', handleEnd);
    button.addEventListener('mouseleave', handleEnd); // 버튼 밖으로 마우스 벗어났을 때 종료

    button.addEventListener('touchstart', handleStart);
    button.addEventListener('touchmove', handleMove);
    button.addEventListener('touchend', handleEnd);
    button.addEventListener('touchcancel', handleEnd); // 터치 취소 시 종료
});