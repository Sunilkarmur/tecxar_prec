import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const Navigate = useNavigate()
  return (
    <AppBar position="static" sx={{ marginTop: '5px', marginBottom: '10px' }}>
      <Toolbar>
        <Button color="inherit" onClick={()=>Navigate('/dashboard')}>Home</Button>
        <Button color="inherit" onClick={()=>Navigate('/category')}>Category</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
