import { Layout, AppBar, Button } from 'react-admin';
import { Link } from 'react-router-dom';
import { Box } from '@mui/material';

const CustomAppBar = (props) => (
  <AppBar {...props}>
    <Box flex="1" />
    <Button
      component={Link}
      to="/"
      label="На сайт"
      color="inherit"
      sx={{ marginRight: 2 }}
    />
  </AppBar>
);

const CustomLayout = (props) => <Layout {...props} appBar={CustomAppBar} />;

export default CustomLayout;
