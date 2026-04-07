import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  mobileDirection?: 'column' | 'row';
}

export function ResponsiveContainer({ 
  children, 
  className = '',
  mobileDirection = 'column'
}: ResponsiveContainerProps) {
  const baseClasses = 'grid gap-8';
  const responsiveClasses = mobileDirection === 'column' 
    ? 'grid-cols-1 lg:grid-cols-2' 
    : 'grid-cols-1 md:grid-cols-2';

  return (
    <div className={`${baseClasses} ${responsiveClasses} ${className}`}>
      {children}
    </div>
  );
}

interface MobileOptimizedCardProps {
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  title?: string;
  defaultCollapsed?: boolean;
}

export function MobileOptimizedCard({ 
  children, 
  className = '',
  collapsible = false,
  title,
  defaultCollapsed = false
}: MobileOptimizedCardProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <motion.div
      className={`glass-card ${className}`}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {collapsible && title && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full p-4 flex items-center justify-between border-b border-white/10 md:hidden"
        >
          <span className="font-semibold">{title}</span>
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>
      )}
      
      <motion.div
        initial={false}
        animate={{ 
          height: isCollapsed ? 0 : 'auto',
          opacity: isCollapsed ? 0 : 1 
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden md:!h-auto md:!opacity-100"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Hook for responsive behavior
export function useResponsive() {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isTablet, setIsTablet] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet };
}