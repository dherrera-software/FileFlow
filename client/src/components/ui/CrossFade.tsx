import { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

export function CrossFade({ show, children, className, fallback }: { 
  show: boolean; 
  children: React.ReactNode; 
  fallback: React.ReactNode;
  className?: string;
}) {
  const [visible, setVisible] = useState(show);
  useEffect(() => {
    if (show) setVisible(true);
    else {
      const t = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(t);
    }
  }, [show]);
  return (
    <div className={cn('relative', className)}>
      {visible && <div className="transition-opacity duration-200 ease-out opacity-100">{children}</div>}
      {!show && <div className="absolute inset-0">{fallback}</div>}
    </div>
  );
}
