import { useState } from "react";

export const useSurpriseAnimation = () => {
  const [animations, setAnimations] = useState<Array<{ id: number; x: number; y: number }>>([]);
  let counter = 0;

  const triggerAnimation = (event: React.MouseEvent) => {
    const id = counter++;
    setAnimations(prev => [...prev, { id, x: event.clientX, y: event.clientY }]);
    setTimeout(() => {
      setAnimations(prev => prev.filter(a => a.id !== id));
    }, 500);
  };

  return { animations, triggerAnimation };
};