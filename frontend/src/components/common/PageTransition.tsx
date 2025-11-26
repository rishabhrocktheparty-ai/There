import { Box, Fade, Slide } from '@mui/material';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  type?: 'fade' | 'slide';
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const PageTransition = ({ 
  children, 
  type = 'fade',
  direction = 'up' 
}: PageTransitionProps) => {
  if (type === 'slide') {
    return (
      <Slide direction={direction} in timeout={400} mountOnEnter unmountOnExit>
        <Box>{children}</Box>
      </Slide>
    );
  }

  return (
    <Fade in timeout={600}>
      <Box>{children}</Box>
    </Fade>
  );
};

interface AnimatedContainerProps {
  children: ReactNode;
  delay?: number;
}

export const AnimatedContainer = ({ children, delay = 0 }: AnimatedContainerProps) => {
  return (
    <Fade in timeout={600} style={{ transitionDelay: `${delay}ms` }}>
      <Box>{children}</Box>
    </Fade>
  );
};

export const StaggeredList = ({ children, delay = 100 }: { children: ReactNode[], delay?: number }) => {
  return (
    <>
      {children.map((child, index) => (
        <AnimatedContainer key={index} delay={index * delay}>
          {child}
        </AnimatedContainer>
      ))}
    </>
  );
};
