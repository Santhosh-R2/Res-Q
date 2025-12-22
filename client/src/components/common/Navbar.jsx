import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { useNavigate } from 'react-router-dom'; 

const pages = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact Us', path: '/contact' }
];

function ResQLinkNavBar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  
  const navigate = useNavigate();

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleNavClick = (path) => {
    navigate(path);
    handleCloseNavMenu();
  };

  const handleLoginClick = () => {
    console.log("Login Clicked");
    navigate('/login'); 
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#d32f2f' }}> 
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          
          <HealthAndSafetyIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="div"
            onClick={() => navigate('/')} 
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer'
            }}
          >
            ResQ-Link
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.name} onClick={() => handleNavClick(page.path)}>
                  <Typography textAlign="center">{page.name}</Typography>
                </MenuItem>
              ))}
              <MenuItem onClick={() => { handleCloseNavMenu(); handleLoginClick(); }}>
                  <Typography textAlign="center" color="primary" fontWeight="bold">LOGIN</Typography>
              </MenuItem>
            </Menu>
          </Box>

          <HealthAndSafetyIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="div"
            onClick={() => navigate('/')}
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer'
            }}
          >
            ResQ-Link
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                onClick={() => handleNavClick(page.path)}
                sx={{ my: 2, color: 'white', display: 'block', px: 2 }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' } }}>
            <Button 
                variant="outlined" 
                color="inherit"
                onClick={handleLoginClick}
                sx={{ 
                    fontWeight: 'bold', 
                    borderWidth: '2px',
                    '&:hover': {
                        borderWidth: '2px',
                        backgroundColor: 'rgba(255,255,255,0.1)'
                    }
                }}
            >
                Login
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResQLinkNavBar;