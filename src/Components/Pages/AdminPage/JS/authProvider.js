// authProvider.js
import axios from 'axios';
import Cookies from 'js-cookie';

import serverConfig from '../../../../serverConfig';

const authProvider = {
  // Метод входа в систему
  login: async ({ username, password }) => {
    console.log(username, password);
    try {
      const response = await axios.post(
        `${serverConfig}/auth/login`,
        { login: username, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { token } = response.data;
      Cookies.set('token', token, { expires: 10 }); // Сохраняем токен в cookies

      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },

  // Метод выхода из системы
  logout: () => {
    Cookies.remove('token');
    return Promise.resolve();
  },

  // Метод проверки аутентификации
  checkAuth: () => {
    const token = Cookies.get('token');
    return token ? Promise.resolve() : Promise.reject();
  },

  // Метод проверки ошибок (например, истекший токен)
  checkError: (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      Cookies.remove('token');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  // Метод получения прав пользователя (например, роль)
  getPermissions: () => {
    return Promise.resolve(); // Здесь можно передать роли пользователя, если это нужно
  },
};

export default authProvider;
