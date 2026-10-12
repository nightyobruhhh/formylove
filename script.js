/* ============================================================
   SITIO WEB ROMÁNTICO PARA SUMMIR & GOVIND
   Lógica interactiva completa, animaciones y música
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- AUDIO & MUSIC PLAYER ---
  const audio = document.getElementById('wedding-song');
  const musicBtn = document.getElementById('music-btn');
  const discBtn = document.getElementById('disc-btn');
  const musicPill = document.getElementById('music-player');
  let isPlaying = false;

  function toggleAudio() {
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => {
        isPlaying = true;
        musicBtn.textContent = '⏸ Pausar';
        discBtn.classList.add('playing');
      }).catch(err => {
        console.log('Audio play blocked or waiting for user gesture:', err);
      });
    } else {
      audio.pause();
      isPlaying = false;
      musicBtn.textContent = '▶ Reproducir';
      discBtn.classList.remove('playing');
    }
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAudio();
    });
  }
  if (musicPill) {
    musicPill.addEventListener('click', toggleAudio);
  }

  function playWeddingMusic() {
    if (audio && audio.paused) {
      audio.play().then(() => {
        isPlaying = true;
        if (musicBtn) musicBtn.textContent = '⏸ Pausar';
        if (discBtn) discBtn.classList.add('playing');
      }).catch(e => console.log('Autoplay request:', e));
    }
  }

  // --- SOUND EFFECTS (Web Audio API Synthesizer) ---
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function playChime(type = 'bell') {
    try {
      if (!audioCtx) audioCtx = new AudioContext();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'pop') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'bell') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.start(now);
        osc.stop(now + 0.85);
      } else if (type === 'celebration') {
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((f, idx) => {
          const o = audioCtx.createOscillator();
          const g = audioCtx.createGain();
          o.connect(g);
          g.connect(audioCtx.destination);
          o.type = 'sine';
          o.frequency.setValueAtTime(f, now + idx * 0.08);
          g.gain.setValueAtTime(0.18, now + idx * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
          o.start(now + idx * 0.08);
          o.stop(now + idx * 0.08 + 0.65);
        });
      }
    } catch(err) {
      // AudioContext fallback
    }
  }

  // --- NAVEGACIÓN ENTRE PÁGINAS ---
  function showPage(pageId) {
    playChime('pop');
    const allPages = document.querySelectorAll('.page');
    allPages.forEach(p => {
      p.classList.remove('active');
      p.classList.add('hidden');
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.classList.remove('hidden');
      setTimeout(() => {
        targetPage.classList.add('active');
      }, 50);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // P1 -> P2
  const btnP1 = document.getElementById('btn-p1-see');
  if (btnP1) {
    btnP1.addEventListener('click', () => {
      showPage('page-2');
    });
  }

  // P2 -> P3
  const btnP2 = document.getElementById('btn-p2-heart');
  if (btnP2) {
    btnP2.addEventListener('click', () => {
      showPage('page-3');
    });
  }

  // P3 -> P4
  const btnP3 = document.getElementById('btn-p3-lets-see');
  if (btnP3) {
    btnP3.addEventListener('click', () => {
      showPage('page-4');
    });
  }

  // P4 -> P5 (¡SÍ! con Party Bombers / Confetti y Música)
  const btnP4Yes = document.getElementById('btn-p4-yes');
  if (btnP4Yes) {
    btnP4Yes.addEventListener('click', () => {
      // Party bombers confetti explosion!
      fireConfetti(120);
      setTimeout(() => fireConfetti(80), 300);
      setTimeout(() => fireConfetti(100), 700);

      playChime('celebration');
      playWeddingMusic();

      setTimeout(() => {
        showPage('page-5');
        // Initial setup for canvas size
        initSignatureCanvas();
      }, 400);
    });
  }

  // P5 -> P6
  const btnP5Next = document.getElementById('btn-p5-next');
  if (btnP5Next) {
    btnP5Next.addEventListener('click', () => {
      showPage('page-6');
    });
  }

  // --- PÁGINA 5: LIENZO DE FIRMA INTERACTIVA (CURSO / DEDO) ---
  const sigCanvas = document.getElementById('signature-canvas');
  const btnClearSig = document.getElementById('btn-clear-sig');
  const btnDoneSig = document.getElementById('btn-done-sig');
  const stampSummir = document.getElementById('stamp-summir-sig');
  const marriageDocWrapper = document.getElementById('marriage-doc-wrapper');
  const p5NextBox = document.getElementById('p5-next-box');

  let sigCtx = null;
  let isDrawing = false;
  let hasSigned = false;

  function initSignatureCanvas() {
    if (!sigCanvas) return;
    sigCtx = sigCanvas.getContext('2d');

    const container = sigCanvas.parentElement;
    const rect = container ? container.getBoundingClientRect() : sigCanvas.getBoundingClientRect();
    const w = rect.width > 50 ? rect.width : 340;
    const h = 170;

    const dpr = window.devicePixelRatio || 1;
    sigCanvas.width = w * dpr;
    sigCanvas.height = h * dpr;
    sigCanvas.style.width = '100%';
    sigCanvas.style.height = h + 'px';

    sigCtx.scale(dpr, dpr);
    sigCtx.strokeStyle = '#1b263b';
    sigCtx.lineWidth = 3;
    sigCtx.lineCap = 'round';
    sigCtx.lineJoin = 'round';
  }

  function getCanvasCoords(e) {
    const rect = sigCanvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Exact scale ratio between CSS layout and internal canvas coordinates
    const scaleX = rect.width > 0 ? (sigCanvas.width / (window.devicePixelRatio || 1)) / rect.width : 1;
    const scaleY = rect.height > 0 ? (sigCanvas.height / (window.devicePixelRatio || 1)) / rect.height : 1;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function startSign(e) {
    isDrawing = true;
    hasSigned = true;
    const coords = getCanvasCoords(e);
    if (!sigCtx) initSignatureCanvas();
    sigCtx.beginPath();
    sigCtx.moveTo(coords.x, coords.y);
  }

  function drawSign(e) {
    if (!isDrawing || !sigCtx) return;
    const coords = getCanvasCoords(e);
    sigCtx.lineTo(coords.x, coords.y);
    sigCtx.stroke();
  }

  function stopSign() {
    if (!isDrawing) return;
    isDrawing = false;
  }

  if (sigCanvas) {
    // Mouse events
    sigCanvas.addEventListener('mousedown', (e) => {
      startSign(e);
    });
    window.addEventListener('mousemove', (e) => {
      if (isDrawing) drawSign(e);
    });
    window.addEventListener('mouseup', () => {
      stopSign();
    });

    // Touch events for mobile/tablet
    sigCanvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startSign(e);
    }, { passive: false });
    sigCanvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      drawSign(e);
    }, { passive: false });
    sigCanvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      stopSign();
    }, { passive: false });
  }

  // Clear signature button
  if (btnClearSig) {
    btnClearSig.addEventListener('click', () => {
      if (!sigCanvas || !sigCtx) return;
      sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
      hasSigned = false;
      playChime('pop');
    });
  }

  // Done button ("Listo") -> Transfer signature to Marriage Certificate
  if (btnDoneSig) {
    btnDoneSig.addEventListener('click', () => {
      if (!hasSigned) {
        alert('Por favor dibuja tu firma con tu dedito o el cursor antes de continuar, mi amor ❤️');
        return;
      }

      // Convert canvas drawing to PNG data URL
      const sigDataUrl = sigCanvas.toDataURL('image/png');
      if (stampSummir) {
        stampSummir.src = sigDataUrl;
      }

      // Show marriage certificate
      if (marriageDocWrapper) {
        marriageDocWrapper.classList.remove('hidden');
      }
      if (p5NextBox) {
        p5NextBox.classList.remove('hidden');
      }

      // Celebration sound and party bombers
      playChime('celebration');
      fireConfetti(100);
      playWeddingMusic();

      // Smooth scroll to certificate
      setTimeout(() => {
        marriageDocWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 250);
    });
  }

  // --- PÁGINA 6: LOVE METER (MEDIDOR DE AMOR) CON TRUCO ---
  const loveSlider = document.getElementById('love-slider');
  const lovePercentDisplay = document.getElementById('love-percent-display');
  const meterCaption = document.getElementById('meter-caption');
  let springBackTimer = null;

  if (loveSlider) {
    function enforceMaxLove() {
      if (springBackTimer) clearTimeout(springBackTimer);
      const val = parseInt(loveSlider.value, 10);
      if (val < 100) {
        // Automatic spring-back animation to 100
        let current = val;
        const interval = setInterval(() => {
          current += 4;
          if (current >= 100) {
            current = 100;
            clearInterval(interval);
            loveSlider.value = 100;
            if (lovePercentDisplay) lovePercentDisplay.textContent = '100% ❤️';
            // Cute heart shake
            if (meterCaption) {
              meterCaption.textContent = 'jeje, ya sé que me amas mucho 🥰';
              meterCaption.style.transform = 'scale(1.18)';
              setTimeout(() => {
                meterCaption.style.transform = 'scale(1)';
              }, 400);
            }
            playChime('pop');
            fireConfetti(30);
          } else {
            loveSlider.value = current;
            if (lovePercentDisplay) lovePercentDisplay.textContent = current + '%';
          }
        }, 12);
      } else {
        if (lovePercentDisplay) lovePercentDisplay.textContent = '100% ✨';
      }
    }

    loveSlider.addEventListener('input', () => {
      const val = loveSlider.value;
      if (lovePercentDisplay) lovePercentDisplay.textContent = val + '%';
      if (parseInt(val, 10) < 100) {
        if (springBackTimer) clearTimeout(springBackTimer);
        springBackTimer = setTimeout(enforceMaxLove, 500);
      }
    });

    loveSlider.addEventListener('change', enforceMaxLove);
    loveSlider.addEventListener('mouseup', enforceMaxLove);
    loveSlider.addEventListener('touchend', enforceMaxLove);
    loveSlider.addEventListener('pointerup', enforceMaxLove);
  }

  // --- INTERACTIVE SURPRISE: FRASCO MÁGICO DE ABRAZOS INFINITOS ---
  const magicJarBtn = document.getElementById('magic-jar-btn');
  const jarText = document.getElementById('jar-text');
  const hugCounter = document.getElementById('hug-counter');
  let hugsSentCount = 1;

  const loveReasons = [
    "Un abrazo bien apretadito que viaja volando para arroparte en cualquier momento. 🤗❤️",
    "Porque tu sonrisa es lo más hermoso del universo y tiene el poder de alegrar cualquier día gris. ✨",
    "No tienes que ser perfecta ni hacer nada extraordinario para que te ame; te amo tal como eres. 🌸",
    "Eres mi lugar seguro, mi paz y mi hogar en este mundo. 🏡💕",
    "Un beso tierno en tu frente para recordarte lo fuerte, valiosa e importante que eres para mí. 💋",
    "Aunque haya distancia, mi corazón está a tu lado cada segundo de cada día. 💖",
    "Amo escucharte hablar sobre tu día, tus risas, tus historias y tus ocurrencias. 🌟",
    "Prometo cuidarte siempre, celebrar tus triunfos y sostenerte en tus momentos difíciles. 🤝",
    "¡Te amo 3000! Y mucho más que eso... y más que a mi propia vida. 💍",
    "Mi linda wawita, eres mi mayor orgullo y el regalo más hermoso de mi vida. 🥰",
    "En cada vida y en cualquier universo, volvería a elegirte a ti sin dudarlo ni un segundo. 🌌",
    "Respira hondo, mi amor. Eres fuerte, eres capaz y yo creo en ti infinitamente. 💪❤️",
    "Toma este abrazo virtual: viene con cosquillitas, caricias y un beso muy dulce. 💕",
    "Tú y yo somos almas gemelas para toda la eternidad. ✨💍"
  ];

  if (magicJarBtn) {
    magicJarBtn.addEventListener('click', () => {
      hugsSentCount++;
      playChime('bell');
      fireConfetti(20);

      // Random heartfelt message
      const randomMsg = loveReasons[Math.floor(Math.random() * loveReasons.length)];
      if (jarText) {
        jarText.style.opacity = '0';
        jarText.style.transform = 'translateY(10px)';
        setTimeout(() => {
          jarText.textContent = randomMsg;
          jarText.style.opacity = '1';
          jarText.style.transform = 'translateY(0)';
        }, 150);
      }

      if (hugCounter) {
        hugCounter.textContent = `Abrazos enviados: ${hugsSentCount} ❤️`;
      }

      // Small bounce on jar
      magicJarBtn.style.transform = 'scale(1.2) rotate(5deg)';
      setTimeout(() => {
        magicJarBtn.style.transform = 'scale(1) rotate(0deg)';
      }, 250);
    });
  }

  // --- MODAL DE LA CARTA ---
  const openLetterBtn = document.getElementById('open-letter-btn');
  const closeLetterBtn = document.getElementById('close-letter-btn');
  const letterModal = document.getElementById('letter-modal');

  if (openLetterBtn) {
    openLetterBtn.addEventListener('click', () => {
      if (letterModal) {
        playChime('bell');
        fireConfetti(35);
        letterModal.classList.remove('hidden');
        setTimeout(() => {
          letterModal.classList.add('show');
        }, 20);
      }
    });
  }

  if (closeLetterBtn) {
    closeLetterBtn.addEventListener('click', () => {
      if (letterModal) {
        letterModal.classList.remove('show');
        setTimeout(() => {
          letterModal.classList.add('hidden');
        }, 400);
      }
    });
  }

  if (letterModal) {
    letterModal.addEventListener('click', (e) => {
      if (e.target === letterModal) {
        letterModal.classList.remove('show');
        setTimeout(() => {
          letterModal.classList.add('hidden');
        }, 400);
      }
    });
  }

  // --- AMBIENT FLOATING HEARTS & SAKURA PETALS ---
  const ambientCanvas = document.getElementById('ambient-canvas');
  if (ambientCanvas) {
    const actx = ambientCanvas.getContext('2d');
    let width = ambientCanvas.width = window.innerWidth;
    let height = ambientCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = ambientCanvas.width = window.innerWidth;
      height = ambientCanvas.height = window.innerHeight;
    });

    const particles = [];
    const colors = ['#ff4d6d', '#ff758f', '#ffccd5', '#ffe082', '#ffb3c1'];

    class AmbientParticle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 50;
        this.size = Math.random() * 12 + 8;
        this.speedY = Math.random() * 1.2 + 0.6;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.3;
        this.isHeart = Math.random() > 0.4;
        this.rot = Math.random() * Math.PI;
        this.rotSpeed = (Math.random() - 0.5) * 0.03;
      }
      update() {
        this.y -= this.speedY;
        this.x += this.speedX + Math.sin(this.y * 0.01) * 0.4;
        this.rot += this.rotSpeed;
        if (this.y < -20) {
          this.reset();
        }
      }
      draw() {
        actx.save();
        actx.translate(this.x, this.y);
        actx.rotate(this.rot);
        actx.globalAlpha = this.opacity;
        actx.fillStyle = this.color;

        if (this.isHeart) {
          // Draw mini heart
          const s = this.size * 0.6;
          actx.beginPath();
          actx.moveTo(0, 0);
          actx.bezierCurveTo(-s, -s, -s * 1.5, s * 0.5, 0, s * 1.5);
          actx.bezierCurveTo(s * 1.5, s * 0.5, s, -s, 0, 0);
          actx.fill();
        } else {
          // Draw soft sakura petal
          actx.beginPath();
          actx.ellipse(0, 0, this.size * 0.7, this.size * 0.35, Math.PI / 4, 0, Math.PI * 2);
          actx.fill();
        }
        actx.restore();
      }
    }

    for (let i = 0; i < 28; i++) {
      particles.push(new AmbientParticle());
    }

    function animateAmbient() {
      actx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateAmbient);
    }
    animateAmbient();
  }

  // --- SELF-CONTAINED CONFETTI ENGINE (PARTY BOMBERS) ---
  const confettiCanvas = document.getElementById('confetti-canvas');
  let confCtx = null;
  let confettiPieces = [];

  if (confettiCanvas) {
    confCtx = confettiCanvas.getContext('2d');
    function resizeConfetti() {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
    resizeConfetti();
    window.addEventListener('resize', resizeConfetti);
  }

  function fireConfetti(count = 70) {
    if (!confettiCanvas || !confCtx) return;
    const colors = ['#ff0054', '#ff5400', '#ffbd00', '#9b5de5', '#00f5d4', '#fee440', '#ffffff'];

    for (let i = 0; i < count; i++) {
      confettiPieces.push({
        x: window.innerWidth * (0.2 + Math.random() * 0.6),
        y: window.innerHeight * 0.5 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 18,
        vy: -Math.random() * 15 - 5,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.38,
        opacity: 1,
        life: 0,
        maxLife: Math.random() * 80 + 100
      });
    }

    if (!window.isConfettiRunning) {
      window.isConfettiRunning = true;
      requestAnimationFrame(renderConfettiLoop);
    }
  }

  function renderConfettiLoop() {
    if (!confCtx) return;
    confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = confettiPieces.length - 1; i >= 0; i--) {
      const p = confettiPieces[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.rotation += p.rSpeed;
      p.life++;

      if (p.life > p.maxLife * 0.7) {
        p.opacity -= 0.03;
      }

      if (p.opacity <= 0 || p.y > window.innerHeight + 50) {
        confettiPieces.splice(i, 1);
        continue;
      }

      confCtx.save();
      confCtx.translate(p.x, p.y);
      confCtx.rotate((p.rotation * Math.PI) / 180);
      confCtx.globalAlpha = Math.max(0, p.opacity);
      confCtx.fillStyle = p.color;
      confCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      confCtx.restore();
    }

    if (confettiPieces.length > 0) {
      requestAnimationFrame(renderConfettiLoop);
    } else {
      window.isConfettiRunning = false;
    }
  }

  // --- VISOR DE FOTOS EN GRANDE (LIGHTBOX) ---
  const photoLightbox = document.getElementById('photo-lightbox');
  const closeLightboxBtn = document.getElementById('close-lightbox-btn');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');

  function openPhotoLightbox(src, caption) {
    if (!photoLightbox || !lightboxImg) return;
    lightboxImg.src = src;
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    playChime('bell');
    photoLightbox.classList.remove('hidden');
    setTimeout(() => {
      photoLightbox.classList.add('show');
    }, 20);
  }

  function closePhotoLightbox() {
    if (!photoLightbox) return;
    photoLightbox.classList.remove('show');
    setTimeout(() => {
      photoLightbox.classList.add('hidden');
    }, 300);
  }

  // Polaroid photos click
  document.querySelectorAll('.polaroid-card').forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const captionEl = card.querySelector('.polaroid-caption');
      if (img) {
        openPhotoLightbox(img.src, captionEl ? captionEl.textContent : 'Recuerdo de amor 💕');
      }
    });
  });

  // Garden photo click
  const gardenImg = document.querySelector('.garden-image');
  if (gardenImg) {
    gardenImg.style.cursor = 'pointer';
    gardenImg.title = 'Toca para ver en grande';
    gardenImg.addEventListener('click', () => {
      openPhotoLightbox(gardenImg.src, 'Un jardín tan hermoso como tú 🌸');
    });
  }

  if (closeLightboxBtn) {
    closeLightboxBtn.addEventListener('click', closePhotoLightbox);
  }
  if (photoLightbox) {
    photoLightbox.addEventListener('click', (e) => {
      if (e.target === photoLightbox) {
        closePhotoLightbox();
      }
    });
  }
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePhotoLightbox();
    }
  });

});

