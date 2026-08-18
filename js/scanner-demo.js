/**
 * Medisore AI 욕창 예방 & 자세 분석 및 체위 관리 시뮬레이터
 */

(function () {
  'use strict';

  // Patient Care Case Data
  const CASES = {
    case1: {
      id: 'case1',
      title: '우측 30° 측위',
      category: '체위 분석 & 천골부 보호',
      stage: '정상 정렬 (30° 측위)',
      stageDesc: '어깨-골반 30° 기울기 유지, 천골부 압력 85% 분산',
      confidence: '99.4%',
      postureStatus: '정상 정렬 (AI 검증 완료)',
      nextSchedule: '01:43:50 후 [바로 누움] 추천',
      metrics: {
        angle: '29.5°',
        pressureOffload: '85%',
        interval: '2시간 설정'
      },
      ratios: { granulation: 85, slough: 15, eschar: 0 },
      drawingType: 'posture_lateral_right',
      careLog: `[08:10 체위 변경 및 상처 관리 기록]
- 현재 체위: 우측 30° 측위 (Right Lateral Tilt)
- AI 자세 검증: 어깨-골반 신체선열 정상 정렬 완료 (기울기 29.5°)
- 천골부 상처: Stage 2 (면적 6.4㎠), 하이드로콜로이드 드레싱 유지
- 다음 변경 예정: 10:10 (2시간 후 '바로 누움' 알림 설정)
- 특이사항: 지지 필로우 위치 양호, 환자 불편감 없음`
    },
    case2: {
      id: 'case2',
      title: '바로 누움 (앙와위)',
      category: '자세 불균형 감지',
      stage: '골반 틀어짐 주의',
      stageDesc: '골반 좌측 쏠림 감지, 베개 지지 필요',
      confidence: '97.8%',
      postureStatus: '주의 상태 (신체선열 보정 필요)',
      nextSchedule: '즉시 [우측으로 누움] 체위 변경 권장',
      metrics: {
        angle: '12.0°',
        pressureOffload: '35%',
        interval: '시간 초과'
      },
      ratios: { granulation: 55, slough: 35, eschar: 10 },
      drawingType: 'posture_supine_tilt',
      careLog: `[14:52 체위 변경 및 간병 인수인계]
- 현재 체위: 바로 누움 (Supine)
- AI 자세 검증: [주의 상태] 좌측 골반 틀어짐 감지 (비대칭 압력 집중)
- 코칭 가이드: 무릎 아래 및 좌측 둔부 밑에 지지 패드 삽입 권장
- 상처 관리: 대전자부 드레싱 부위 청결 유지 상태 확인
- 인수인계 메모: 2시간 경과로 우측 누움으로 즉시 체위 변경 완료`
    },
    case3: {
      id: 'case3',
      title: '좌측 측위 & 드레싱',
      category: '체위 교대 및 상처 드레싱',
      stage: '드레싱 교체 완료',
      stageDesc: '좌측 30° 측위, 우측 어깨 Stage 4 드레싱 완료',
      confidence: '98.9%',
      postureStatus: '체위 변경 완료 (2시간 타이머 작동)',
      nextSchedule: '02:00:00 후 [바로 누움]',
      metrics: {
        angle: '30.8°',
        pressureOffload: '90%',
        interval: '2시간 설정'
      },
      ratios: { granulation: 30, slough: 45, eschar: 25 },
      drawingType: 'posture_lateral_left',
      careLog: `[20:26 드레싱 및 야간 체위 교대 기록]
- 현재 체위: 좌측으로 누움 (Left Lateral Tilt)
- AI 자세 검증: 신체선열 정상, 우측 돌출부 압박 완전 분산
- 상처 처치: 우측 어깨 Stage 4 환부 폼 드레싱 교체 완료
- 인수인계 사항: 야간 2시간 간격 순환 알림 ON (가족 보호자 확인 완료)
- 7일 기록지: 금일 총 8회 체위 변경 100% 달성 기록 자동 저장`
    },
    case4: {
      id: 'case4',
      title: '발뒤꿈치 부유 (DTI 예방)',
      category: '하지 감압 및 자세 코칭',
      stage: '하지 부유 장치 적용',
      stageDesc: '발뒤꿈치 공중 부유(Off-loading) 확인',
      confidence: '96.5%',
      postureStatus: '발뒤꿈치 압력 완전 제거 (정상)',
      nextSchedule: '01:50:00 후 체위 점검',
      metrics: {
        angle: '18.0°',
        pressureOffload: '100%',
        interval: '2시간 설정'
      },
      ratios: { granulation: 0, slough: 20, eschar: 80 },
      drawingType: 'posture_heel_offload',
      careLog: `[10:30 발뒤꿈치 감압 관리 기록]
- 부위: 좌측 발뒤꿈치 (Heel)
- 사정 결과: 피부 온전하나 자주색 변색 관찰 (DTI 주의)
- AI 자세 코칭: 종아리 하부 베개 지지로 발뒤꿈치 공중 부유 유지
- 주의 사항: 직접적인 마사지 금기, 실리콘 보호 패치 적용
- 주간 보호자 알림: 체위 변경 시 발뒤꿈치 바닥 접촉 여부 재확인`
    }
  };

  // State
  let currentCaseKey = 'case1';
  let activeLayers = {
    skeleton: true,
    angle: true,
    pressure: true,
    wound: true,
    grid: true
  };
  let isScanning = false;

  // DOM Elements
  const canvas = document.getElementById('scanner-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const laserLine = document.getElementById('scanner-laser');
  const scanBtn = document.getElementById('run-scan-btn');
  const caseButtons = document.querySelectorAll('.case-btn');
  const toggleChips = document.querySelectorAll('.toggle-chip');

  // Value Display Elements
  const stageBadge = document.getElementById('res-stage-badge');
  const stageDesc = document.getElementById('res-stage-desc');
  const confidenceBadge = document.getElementById('res-confidence');
  const angleVal = document.getElementById('res-angle');
  const pressureVal = document.getElementById('res-pressure');
  const scheduleVal = document.getElementById('res-schedule');
  const coachingStatus = document.getElementById('res-coaching-status');
  const coachingDesc = document.getElementById('res-coaching-desc');
  const soapContent = document.getElementById('res-soap-content');
  const copySoapBtn = document.getElementById('copy-soap-btn');

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    renderCanvas();
  }

  // Draw Realistic Body Pose & Alignment Canvas
  function renderCanvas() {
    const w = canvas.width / window.devicePixelRatio;
    const h = canvas.height / window.devicePixelRatio;
    const cData = CASES[currentCaseKey];

    ctx.clearRect(0, 0, w, h);

    // Background Medical Bed Surface
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#131D38');
    bgGrad.addColorStop(1, '#0B132B');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Grid Overlay
    if (activeLayers.grid) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 25;
      for (let x = 0; x <= w; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y <= h; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText('MediaPipe Pose 33 Landmarks Grid', 14, h - 14);
      ctx.restore();
    }

    // Coordinates definition for body joints
    const cx = w * 0.5;
    const cy = h * 0.5;

    // Body silhouette & posture rendering based on case
    let head = { x: cx - 130, y: cy - 20 };
    let neck = { x: cx - 90, y: cy - 10 };
    let shoulderL = { x: cx - 80, y: cy - 45 };
    let shoulderR = { x: cx - 75, y: cy + 25 };
    let elbowR = { x: cx - 40, y: cy + 45 };
    let wristR = { x: cx - 10, y: cy + 35 };
    let spineMid = { x: cx - 10, y: cy - 5 };
    let hipL = { x: cx + 50, y: cy - 40 };
    let hipR = { x: cx + 60, y: cy + 20 };
    let kneeL = { x: cx + 110, y: cy - 30 };
    let kneeR = { x: cx + 125, y: cy + 25 };
    let ankleL = { x: cx + 160, y: cy - 20 };
    let ankleR = { x: cx + 175, y: cy + 20 };

    if (cData.drawingType === 'posture_supine_tilt') {
      shoulderL = { x: cx - 80, y: cy - 40 };
      shoulderR = { x: cx - 80, y: cy + 40 };
      hipL = { x: cx + 45, y: cy - 45 };
      hipR = { x: cx + 65, y: cy + 30 }; // tilted hip
    } else if (cData.drawingType === 'posture_heel_offload') {
      ankleL.y -= 25;
      ankleR.y -= 20;
    }

    // 1. Bed Cushion / Support Pillow Indicator
    ctx.save();
    ctx.fillStyle = 'rgba(56, 152, 255, 0.15)';
    ctx.strokeStyle = 'rgba(56, 152, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 100, cy + 35, 140, 45, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3898FF';
    ctx.font = '10px "Pretendard", sans-serif';
    ctx.fillText('30° 지지 필로우 (Pillow)', cx - 90, cy + 62);
    ctx.restore();

    // 2. Pressure Offload Heatmap Zones
    if (activeLayers.pressure) {
      ctx.save();
      // Sacrum / Trochanter pressure dispersion halo
      const pGrad = ctx.createRadialGradient(cx + 50, cy - 10, 10, cx + 50, cy - 10, 60);
      if (cData.drawingType === 'posture_supine_tilt') {
        pGrad.addColorStop(0, 'rgba(239, 68, 68, 0.6)'); // Warning Red (high pressure)
        pGrad.addColorStop(0.8, 'rgba(245, 158, 11, 0.2)');
        pGrad.addColorStop(1, 'transparent');
      } else {
        pGrad.addColorStop(0, 'rgba(16, 185, 129, 0.5)'); // Safe Green (dispersed)
        pGrad.addColorStop(0.8, 'rgba(56, 152, 255, 0.2)');
        pGrad.addColorStop(1, 'transparent');
      }
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.ellipse(cx + 50, cy - 10, 65, 45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. MediaPipe Skeleton Joints & Alignment Lines
    if (activeLayers.skeleton) {
      ctx.save();
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Connect Spine
      ctx.beginPath();
      ctx.moveTo(neck.x, neck.y);
      ctx.lineTo(spineMid.x, spineMid.y);
      ctx.lineTo((hipL.x + hipR.x) / 2, (hipL.y + hipR.y) / 2);
      ctx.stroke();

      // Shoulders line
      ctx.beginPath();
      ctx.moveTo(shoulderL.x, shoulderL.y);
      ctx.lineTo(shoulderR.x, shoulderR.y);
      ctx.stroke();

      // Hips line
      ctx.beginPath();
      ctx.moveTo(hipL.x, hipL.y);
      ctx.lineTo(hipR.x, hipR.y);
      ctx.stroke();

      // Limbs
      ctx.beginPath();
      ctx.moveTo(shoulderR.x, shoulderR.y);
      ctx.lineTo(elbowR.x, elbowR.y);
      ctx.lineTo(wristR.x, wristR.y);

      ctx.moveTo(hipL.x, hipL.y);
      ctx.lineTo(kneeL.x, kneeL.y);
      ctx.lineTo(ankleL.x, ankleL.y);

      ctx.moveTo(hipR.x, hipR.y);
      ctx.lineTo(kneeR.x, kneeR.y);
      ctx.lineTo(ankleR.x, ankleR.y);
      ctx.stroke();

      // Draw Keypoint Nodes
      const joints = [head, neck, shoulderL, shoulderR, elbowR, wristR, spineMid, hipL, hipR, kneeL, kneeR, ankleL, ankleR];
      joints.forEach((j, i) => {
        ctx.beginPath();
        ctx.arc(j.x, j.y, i === 0 ? 14 : 5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#3898FF';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      });
      ctx.restore();
    }

    // 4. Posture Alignment Tilt Angle Indicator
    if (activeLayers.angle) {
      ctx.save();
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);

      // Horizontal baseline from hip
      ctx.beginPath();
      ctx.moveTo(hipL.x, hipL.y);
      ctx.lineTo(hipL.x + 80, hipL.y);
      ctx.stroke();

      // Angle label badge
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(hipL.x + 10, hipL.y - 32, 110, 24);
      ctx.strokeStyle = '#10B981';
      ctx.setLineDash([]);
      ctx.strokeRect(hipL.x + 10, hipL.y - 32, 110, 24);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(`측위 각도: ${cData.metrics.angle}`, hipL.x + 16, hipL.y - 16);
      ctx.restore();
    }

    // 5. Target Wound Inspection Marker
    if (activeLayers.wound) {
      ctx.save();
      const wx = cx + 55;
      const wy = cy + 18;

      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(wx, wy, 16, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.fill();

      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 10px "Pretendard", sans-serif';
      ctx.fillText('관찰 환부', wx - 18, wy + 28);
      ctx.restore();
    }
  }

  // Update Data Panel UI
  function updateDataPanel() {
    const c = CASES[currentCaseKey];

    stageBadge.innerHTML = `<span class="chip-dot green"></span> ${c.stage}`;
    stageDesc.textContent = c.stageDesc;
    confidenceBadge.textContent = `AI 판독 신뢰도 ${c.confidence}`;

    angleVal.textContent = c.metrics.angle;
    pressureVal.textContent = c.metrics.pressureOffload;
    scheduleVal.textContent = c.metrics.interval;

    coachingStatus.textContent = c.postureStatus;
    coachingDesc.textContent = c.nextSchedule;

    soapContent.textContent = c.careLog;
  }

  // Trigger AI Scan Simulation
  function triggerScan() {
    if (isScanning) return;
    isScanning = true;
    scanBtn.disabled = true;
    scanBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
        <path d="M12 2a10 10 0 0 1 10 10" />
      </svg>
      MediaPipe 신체선열 분석 중...
    `;

    laserLine.classList.add('scanning');

    setTimeout(() => {
      laserLine.classList.remove('scanning');
      scanBtn.disabled = false;
      scanBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
          <path d="M16 21h5v-5"/>
        </svg>
        AI 자세 & 체위 재분석
      `;
      isScanning = false;
      renderCanvas();
      updateDataPanel();
      if (window.showToast) {
        window.showToast('MediaPipe 자세 분석 및 체위 가이드 갱신 완료!', 'success');
      }
    }, 1400);
  }

  // Event Listeners
  caseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCase = btn.dataset.case;
      if (targetCase && CASES[targetCase]) {
        caseButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCaseKey = targetCase;
        triggerScan();
      }
    });
  });

  toggleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const layer = chip.dataset.layer;
      if (layer && activeLayers.hasOwnProperty(layer)) {
        activeLayers[layer] = !activeLayers[layer];
        chip.classList.toggle('active', activeLayers[layer]);
        renderCanvas();
      }
    });
  });

  if (scanBtn) {
    scanBtn.addEventListener('click', triggerScan);
  }

  if (copySoapBtn) {
    copySoapBtn.addEventListener('click', () => {
      const text = soapContent.textContent;
      navigator.clipboard.writeText(text).then(() => {
        const origHtml = copySoapBtn.innerHTML;
        copySoapBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          복사 완료!
        `;
        if (window.showToast) {
          window.showToast('간병 인수인계 및 자세 기록이 클립보드에 복사되었습니다.', 'success');
        }
        setTimeout(() => {
          copySoapBtn.innerHTML = origHtml;
        }, 2000);
      });
    });
  }

  window.addEventListener('resize', resizeCanvas);

  window.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    updateDataPanel();
  });
})();
