import {
  Button,
  Card,
  CardActions,
  CircularProgress,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';
import { Notification, useLogin, useNotify } from 'react-admin';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const login = useLogin();
  const notify = useNotify();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    const username = form.login.value;
    const password = form.password.value;
    try {
      await login({ username, password });
    } catch (error) {
      notify('Неправильное имя пользователя или пароль', { type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        height: '100vh',
        alignItems: 'center',
      }}
    >
      <Card>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '16px 24px', width: 300 }}>
            <TextField
              name="login"
              label="Логин"
              fullWidth
              margin="normal"
              autoFocus
            />
            <TextField
              name="password"
              label="Пароль"
              type="password"
              fullWidth
              margin="normal"
            />
          </div>
          <CardActions>
            <Button type="submit" color="primary" disabled={loading} fullWidth>
              {loading ? <CircularProgress size={25} /> : 'Войти'}
            </Button>
          </CardActions>
        </form>
      </Card>
      <Notification />
    </div>
  );
};

export default LoginPage;
