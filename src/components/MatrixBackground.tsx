import { useEffect, useRef } from 'react';

const FLIPPED_KATAKANA = 'ᄀᄂᄃᄅᄆᄇᄉᄊᄋᄌᄍᄎᄏᄐᄑ하ᅢᅣᅤᅥᅦᅧᅨᅩᅪᅫᅬᅭᅮᅯᅰᅱᅲᅳᅴᅵᆨᆩᆪᆫᆬᆭᆯᆰᆱᆲᆳᆴᆵᆶᆷᆸᆹᆺᆻᆼᆽᆾᆿᇀᇁᇂ';
const FLIPPED_SYMBOLS = 'ƆƎƧИႱႧႰႳႵႷႸႹႺႻႼႽႾႿჀჁჂჃჄჅაბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ';
const MATRIX_CHARS = FLIPPED_KATAKANA + FLIPPED_SYMBOLS;

export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mobile = window.innerWidth <= 768;
    const dpr = window.devicePixelRatio || 1;
    const fontSize = mobile ? 14 : 16;
    const colStep = mobile ? 2 : 1;
    const frameMs = mobile ? 66 : 33;

    let logicalW = 0;
    let logicalH = 0;

    const resizeCanvas = () => {
      logicalW = window.innerWidth;
      logicalH = window.innerHeight;
      // Scale canvas to device pixel ratio for sharp rendering on HiDPI/retina screens
      canvas.width = logicalW * dpr;
      canvas.height = logicalH * dpr;
      canvas.style.width = logicalW + 'px';
      canvas.style.height = logicalH + 'px';
      // Setting canvas.width resets the context, so reapply scale after every resize
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const totalCols = Math.ceil(window.innerWidth / fontSize);
    const activeCols = Math.ceil(totalCols / colStep);

    const drops: number[] = Array.from({ length: activeCols }, () =>
      Math.random() * -logicalH
    );
    // Mobile runs at 15fps vs 30fps desktop — double per-frame distance to match visual speed
    const speeds: number[] = Array.from({ length: activeCols }, () =>
      mobile ? Math.random() * 4 + 2.5 : Math.random() * 1.5 + 0.8
    );

    let animationId: number;
    let lastFrameTime = 0;

    const draw = (timestamp: number) => {
      if (document.hidden) {
        animationId = requestAnimationFrame(draw);
        return;
      }
      if (timestamp - lastFrameTime < frameMs) {
        animationId = requestAnimationFrame(draw);
        return;
      }
      lastFrameTime = timestamp;

      // Slow fade so trails persist — 0.06 keeps characters visible for ~1s at 15fps
      ctx.fillStyle = 'rgba(11,13,16,0.06)';
      ctx.fillRect(0, 0, logicalW, logicalH);

      ctx.font = `bold ${fontSize}px monospace`;
      ctx.textBaseline = 'top';

      for (let i = 0; i < drops.length; i++) {
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        const x = i * fontSize * colStep;
        const y = drops[i];

        const isBright = Math.random() > 0.97;
        if (isBright) {
          ctx.fillStyle = '#ccffcc';
          ctx.shadowColor = '#00ff41';
          ctx.shadowBlur = 14;
        } else {
          ctx.fillStyle = `rgba(0,255,65,${Math.random() * 0.25 + 0.75})`;
          ctx.shadowBlur = 0;
        }

        ctx.save();
        ctx.translate(x + fontSize / 2, y + fontSize / 2);
        ctx.scale(-1, -1);
        ctx.translate(-(x + fontSize / 2), -(y + fontSize / 2));
        ctx.fillText(char, x, y);
        ctx.restore();

        drops[i] += speeds[i];
        if (drops[i] > logicalH) {
          drops[i] = -fontSize;
          speeds[i] = Math.random() * 1.5 + 0.8;
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ opacity: 0.9, zIndex: 0, background: '#0B0D10' }}
    />
  );
}
