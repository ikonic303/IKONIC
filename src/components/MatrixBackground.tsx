import { useEffect, useRef } from 'react';

// Flipped and reversed Japanese Katakana characters
const FLIPPED_KATAKANA = 'ᄀᄂᄃᄅᄆᄇᄉᄊᄋᄌᄍᄎᄏᄐᄑ하ᅢᅣᅤᅥᅦᅧᅨᅩᅪᅫᅬᅭᅮᅯᅰᅱᅲᅳᅴᅵᆨᆩᆪᆫᆬᆭᆯᆰᆱᆲᆳᆴᆵᆶᆷᆸᆹᆺᆻᆼᆽᆾᆿᇀᇁᇂ';

// Additional flipped symbols and characters
const FLIPPED_SYMBOLS = 'ƆƎƧИႱႧႰႳႵႷႸႹႺႻႼႽႾႿჀჁჂჃჄჅაბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ';

// Combine all flipped characters
const MATRIX_CHARS = FLIPPED_KATAKANA + FLIPPED_SYMBOLS;

export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const fontSize = 16;
    const columns = Math.ceil(canvas.width / fontSize);

    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -canvas.height;
    }

    const speeds: number[] = [];
    for (let i = 0; i < columns; i++) {
      speeds[i] = Math.random() * 2 + 1;
    }

    let animationId: number;
    // Mobile devices get ~15fps; desktop runs at full 60fps
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const frameInterval = isMobile ? 1000 / 15 : 0;
    let lastFrameTime = 0;

    const draw = (timestamp: number) => {
      if (document.hidden) {
        animationId = requestAnimationFrame(draw);
        return;
      }

      if (frameInterval > 0 && timestamp - lastFrameTime < frameInterval) {
        animationId = requestAnimationFrame(draw);
        return;
      }
      lastFrameTime = timestamp;

      ctx.fillStyle = 'rgba(11, 13, 16, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `bold ${fontSize}px monospace`;
      ctx.textBaseline = 'top';

      for (let i = 0; i < drops.length; i++) {
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        const x = i * fontSize;
        const y = drops[i];

        const isBright = Math.random() > 0.97;

        if (isBright) {
          ctx.fillStyle = '#ccffcc';
          ctx.shadowColor = '#00ff41';
          ctx.shadowBlur = 15;
        } else {
          const brightness = Math.random() * 0.4 + 0.6;
          ctx.fillStyle = `rgba(0, 255, 65, ${brightness})`;
          ctx.shadowBlur = 0;
        }

        ctx.save();
        ctx.translate(x + fontSize / 2, y + fontSize / 2);
        ctx.scale(-1, -1);
        ctx.translate(-(x + fontSize / 2), -(y + fontSize / 2));
        ctx.fillText(char, x, y);
        ctx.restore();

        drops[i] += speeds[i];

        if (drops[i] > canvas.height) {
          drops[i] = -fontSize;
          speeds[i] = Math.random() * 2 + 1;
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
      style={{
        opacity: 0.7,
        zIndex: 0,
        background: 'transparent'
      }}
    />
  );
}
