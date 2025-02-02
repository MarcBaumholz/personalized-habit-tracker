import { useState, useEffect } from "react";
import { Sparkle, Smile, ThumbsUp } from "lucide-react";

type Position = {
  x: number;
  y: number;
};

export const SurpriseAnimation = ({ position }: { position: Position }) => {
  const [show, setShow] = useState(true);
  const icons = [Sparkle, Smile, ThumbsUp];
  const RandomIcon = icons[Math.floor(Math.random() * icons.length)];

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 animate-fade-out"
      style={{
        left: position.x - 10,
        top: position.y - 10,
      }}
    >
      <RandomIcon className="h-5 w-5 text-yellow-500 animate-bounce" />
    </div>
  );
};