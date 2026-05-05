import { Card, CardContent, Typography } from "@mui/material";

export default function StatCard({ title, value }) {
  return (
    <Card 
      sx={{ 
        borderRadius: 2,
        bgcolor: '#000000', 
        border: '1px solid #1e293b',
        height: '100%',
        width: 300,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        py: 1
      }}
    >
      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 }, textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: '#00E5FF', 
            fontWeight: 700, 
            mb: 0.5 
          }}
        >
          {value}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#94a3b8', 
            letterSpacing: 1, 
            textTransform: 'uppercase',
            fontWeight: 600
          }}
        >
          {title}
        </Typography>
      </CardContent>
    </Card>
  );
}