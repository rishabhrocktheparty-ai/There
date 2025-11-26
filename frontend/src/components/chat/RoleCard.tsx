import { Card, CardContent, CardMedia, Typography, Box, Chip, Button, Fade, alpha } from '@mui/material';
import { Person, School, FamilyRestroom, SportsEsports, Favorite, Psychology } from '@mui/icons-material';
import { useState } from 'react';

interface RoleCardProps {
  id: string;
  type: string;
  displayName: string;
  description?: string;
  avatarUrl?: string;
  category?: string;
  tags?: string[];
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const roleIcons: Record<string, any> = {
  father: FamilyRestroom,
  mother: FamilyRestroom,
  mentor: School,
  friend: Person,
  coach: SportsEsports,
  therapist: Psychology,
  partner: Favorite,
};

const roleGradients: Record<string, string> = {
  father: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  mother: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  mentor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  friend: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  coach: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  therapist: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  partner: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)',
  default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
};

export const RoleCard = ({ id, type, displayName, description, category, tags, onSelect, disabled }: RoleCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = roleIcons[type] || Person;
  const gradient = roleGradients[type] || roleGradients.default;

  return (
    <Fade in timeout={600}>
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
          boxShadow: isHovered ? 8 : 2,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: gradient,
            transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
            transition: 'transform 0.3s ease',
          },
        }}
      >
        <Box
          sx={{
            height: 160,
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              animation: isHovered ? 'pulse 2s ease-in-out infinite' : 'none',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
                '50%': { transform: 'scale(1.1)', opacity: 0.8 },
              },
            }}
          />
          <Icon sx={{ fontSize: 80, color: 'white', zIndex: 1 }} />
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            {displayName}
          </Typography>
          
          {category && (
            <Chip
              label={category}
              size="small"
              sx={{ mb: 1, bgcolor: alpha(gradient.split(' ')[1].split(',')[0], 0.1) }}
            />
          )}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
              minHeight: 60,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description || `Start a meaningful relationship with your AI ${type}`}
          </Typography>

          {tags && tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
              {tags.slice(0, 3).map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 24 }}
                />
              ))}
            </Box>
          )}

          <Button
            fullWidth
            variant={isHovered ? 'contained' : 'outlined'}
            size="large"
            onClick={() => onSelect(id)}
            disabled={disabled}
            sx={{
              mt: 'auto',
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              ...(isHovered && {
                background: gradient,
                border: 'none',
              }),
            }}
          >
            Start Relationship
          </Button>
        </CardContent>
      </Card>
    </Fade>
  );
};
