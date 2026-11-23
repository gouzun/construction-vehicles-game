// Lightweight, zero-dependency particle confetti for kids celebration

export function triggerConfetti(containerElement, count = 40) {
  if (!containerElement) return;
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#ec4899', '#8b5cf6', '#fbbf24'];
  
  const rect = containerElement.getBoundingClientRect();
  const wrapper = document.createElement('div');
  wrapper.className = 'absolute inset-0 pointer-events-none overflow-hidden z-50';
  containerElement.appendChild(wrapper);
  
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 10 + 6;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const startX = Math.random() * 100;
    const endX = startX + (Math.random() * 40 - 20);
    const duration = Math.random() * 1.5 + 1.2;
    const delay = Math.random() * 0.3;
    
    p.style.position = 'absolute';
    p.style.width = `${size}px`;
    p.style.height = `${size * 0.7}px`;
    p.style.backgroundColor = color;
    p.style.borderRadius = Math.random() > 0.5 ? '2px' : '50%';
    p.style.left = `${startX}%`;
    p.style.top = '-20px';
    p.style.opacity = '1';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    p.style.transition = `transform ${duration}s ease-out, top ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${duration * 0.8}s ease-in ${duration * 0.2}s`;
    
    wrapper.appendChild(p);
    
    setTimeout(() => {
      p.style.top = `${Math.random() * 40 + 70}%`;
      p.style.left = `${endX}%`;
      p.style.transform = `rotate(${Math.random() * 720}deg) scale(0.6)`;
      p.style.opacity = '0';
    }, 20 + delay * 1000);
  }
  
  setTimeout(() => {
    if (wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
  }, 3200);
}
