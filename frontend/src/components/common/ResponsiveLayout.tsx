import { Box, Container, ContainerProps } from '@mui/material';
import { ReactNode } from 'react';

interface ResponsiveContainerProps extends Omit<ContainerProps, 'children'> {
  children: ReactNode;
  noPadding?: boolean;
}

export const ResponsiveContainer = ({ 
  children, 
  noPadding = false,
  maxWidth = 'lg',
  ...props 
}: ResponsiveContainerProps) => {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        py: noPadding ? 0 : { xs: 2, sm: 3, md: 4 },
        px: noPadding ? 0 : { xs: 2, sm: 3 },
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Container>
  );
};

interface ResponsiveGridProps {
  children: ReactNode;
  spacing?: number;
  columns?: { xs?: number; sm?: number; md?: number; lg?: number };
}

export const ResponsiveGrid = ({ 
  children, 
  spacing = 3,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 }
}: ResponsiveGridProps) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: `repeat(${columns.xs || 1}, 1fr)`,
          sm: `repeat(${columns.sm || 2}, 1fr)`,
          md: `repeat(${columns.md || 3}, 1fr)`,
          lg: `repeat(${columns.lg || 4}, 1fr)`,
        },
        gap: spacing,
      }}
    >
      {children}
    </Box>
  );
};

interface StackProps {
  children: ReactNode;
  spacing?: number;
  direction?: 'row' | 'column';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  wrap?: boolean;
}

export const Stack = ({ 
  children, 
  spacing = 2, 
  direction = 'column',
  align = 'stretch',
  justify = 'flex-start',
  wrap = false
}: StackProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? 'wrap' : 'nowrap',
        gap: spacing,
      }}
    >
      {children}
    </Box>
  );
};
