import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { styled } from '@mui/material/styles';

// Inline LinkedIn SVG to avoid external icon libs
const LinkedInSvg = styled('svg')(() => ({
  width: 20,
  height: 20,
  fill: 'currentColor'
}));

export function Footer() {
  const linkedInUrl = import.meta.env.VITE_LINKEDIN_URL as string | undefined;
  if (!linkedInUrl && import.meta.env.DEV) {
    console.warn('[Footer] VITE_LINKEDIN_URL not set. Set it in .env to activate link.');
  }
  return (
    <Box component="footer" sx={{ mt: 'auto', py: 2, textAlign: 'center', opacity: 0.9 }}>
      <Typography variant="body2" component="div" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        Developed by<strong style={{ fontWeight: 600 }}>Amir Rahimi</strong>
        <Tooltip title={linkedInUrl ? 'LinkedIn Profile' : 'Set VITE_LINKEDIN_URL to enable link'}>
          <span>
            <IconButton
              size="small"
              component={linkedInUrl ? 'a' : 'button'}
              href={linkedInUrl || undefined}
              target={linkedInUrl ? '_blank' : undefined}
              rel={linkedInUrl ? 'noopener noreferrer' : undefined}
              color="primary"
              aria-label="LinkedIn profile"
              disabled={!linkedInUrl}
            >
              <LinkedInSvg viewBox="0 0 24 24" role="img" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.064 2.062 2.062 0 112.063 2.064zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </LinkedInSvg>
              {linkedInUrl && <OpenInNewIcon sx={{ fontSize: 14, ml: 0.5 }} />}
            </IconButton>
          </span>
        </Tooltip>
      </Typography>
    </Box>
  );
}
