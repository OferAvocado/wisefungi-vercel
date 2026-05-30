import React, { useEffect, useRef } from 'react';

const CursorParticles = () => {
  const canvasRef = useRef(null);
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  useEffect(() => {
    // Detect if primary pointer is coarse (touch) or if touch events exist
    const isTouch = ('ontouchstart' in window) || 
                    (navigator.maxTouchPoints > 0) || 
                    (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    if (isTouch) {
      setIsTouchDevice(true);
    }
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let particles = [];
    let mouse = { x: -100, y: -100 };
    let lastMouse = { x: -200, y: -200 };
    
    let processedCursor = null;

    // Load the pre-processed transparent mushroom PNG directly
    const img = new Image();
    img.src = '/custom-mushroom-2.png?v=3';
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      processedCursor = img;
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      const stopAnimations = document.body.classList.contains('acc-stop-animations') ||
                             document.documentElement.classList.contains('acc-stop-animations');
      const standardCursor = document.body.classList.contains('acc-standard-cursor') ||
                             document.documentElement.classList.contains('acc-standard-cursor');

      // Spawn subtle spore particles if not disabled
      if (!stopAnimations && !standardCursor && Math.random() > 0.5) {
        particles.push({
          x: mouse.x,
          y: mouse.y + 10,
          vx: (Math.random() - 0.5) * 0.5,
          vy: Math.random() * 0.5 + 0.1,
          life: 1,
          size: Math.random() * 1.5 + 0.5,
        });
      }
    };

    let isVisible = true;
    const handleMouseLeave = () => { isVisible = false; };
    const handleMouseEnter = () => { isVisible = true; };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    const animate = () => {
      const standardCursor = document.body.classList.contains('acc-standard-cursor') ||
                             document.documentElement.classList.contains('acc-standard-cursor');
      const stopAnimations = document.body.classList.contains('acc-stop-animations') ||
                             document.documentElement.classList.contains('acc-stop-animations');

      if (standardCursor) {
        if (lastMouse.x !== -300) {
          ctx.clearRect(0, 0, width, height);
          lastMouse.x = -300; // special state
        }
        particles = [];
        requestAnimationFrame(animate);
        return;
      }

      if (stopAnimations) {
        particles = [];
      }

      // Optimization: Only clear and redraw if there are particles or mouse has moved
      const needsRedraw = particles.length > 0 || lastMouse.x !== mouse.x || lastMouse.y !== mouse.y;
      
      if (!needsRedraw && isVisible) {
        requestAnimationFrame(animate);
        return;
      }

      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;

      ctx.clearRect(0, 0, width, height);

      // Draw particles if visible and animations not stopped
      if (isVisible && !stopAnimations) {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.015;

          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.life * 0.6})`;
          ctx.fill();
        }
      }
      
      // Reset shadow for image drawing
      ctx.shadowBlur = 0;

      // Draw the custom mushroom cursor ON TOP of particles
      if (processedCursor && mouse.x !== -100 && isVisible) {
        ctx.save();
        // Disable smoothing for pixel art look
        ctx.imageSmoothingEnabled = false;
        // Move to mouse position
        ctx.translate(mouse.x, mouse.y);
        // Rotate -45 degrees so the cap points top-left like a regular cursor
        ctx.rotate(-45 * Math.PI / 180);
        
        // Draw the processed image. 
        ctx.drawImage(processedCursor, -16, 0, 32, 32);
        ctx.restore();
      }

      requestAnimationFrame(animate);
    };

    let animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 999999, // Ensure it's on top of everything
      }}
    />
  );
};

export default CursorParticles;
