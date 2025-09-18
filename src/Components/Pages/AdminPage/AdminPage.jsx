import React from 'react';
import { Admin, Resource, Layout, Menu } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import russianMessages from 'ra-language-russian';

import serverConfig from '../../../serverConfig';
import authProvider from './JS/authProvider';
import { fetchJsonWithToken } from './JS/fetchJsonWithToken';

import LoginPage from './LoginPage';

import {
  LeagueCreate,
  LeagueEdit,
  LeagueList,
} from './Resourses/LeagueResource';
import {
  LeagueStandingCreate,
  LeagueStandingEdit,
  LeagueStandingList,
} from './Resourses/LeagueStandingResource';
import { TeamCreate, TeamEdit, TeamList } from './Resourses/TeamResource';
import {
  PlayerCreate,
  PlayerEdit,
  PlayerList,
} from './Resourses/PlayerResource';
import { MatchCreate, MatchEdit, MatchList } from './Resourses/MatchResource';
import {
  MatchEventCreate,
  MatchEventEdit,
  MatchEventList,
} from './Resourses/MatchEventResource';
import {
  PlayerStatCreate,
  PlayerStatEdit,
  PlayerStatList,
} from './Resourses/PlayerStatResource';
import { NewsCreate, NewsEdit, NewsList } from './Resourses/NewsResource';

// MUI для пункта меню-ссылки
import LaunchIcon from '@mui/icons-material/Launch';
import {
  Divider,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  StadiumCreate,
  StadiumEdit,
  StadiumList,
} from './Resourses/StadiumResource';
import {
  RefereeCreate,
  RefereeEdit,
  RefereeList,
} from './Resourses/RefereeResource';

// ===== i18n прямо здесь =====
const ru = {
  ...russianMessages,
  auth: {
    ...russianMessages.auth,
    invalid_credentials: 'Неправильное имя пользователя или пароль',
    user_exists: 'Пользователь уже существует',
  },
  custom: { saved: 'Сохранено' },
};

const dataProvider = simpleRestProvider(`${serverConfig}`, fetchJsonWithToken);
const i18nProvider = polyglotI18nProvider(() => ru, 'ru', {
  allowMissing: true,
});

// URL публичного сайта
const PUBLIC_SITE_URL = '/';

// Кастомное меню: сначала все ресурсы, ниже — кнопка-ссылка
const CustomMenu = () => (
  <Menu>
    {/* автоматический список всех ресурсов */}
    <Menu.ResourceItems />
    <Divider sx={{ my: 1 }} />
    <ListItemButton
      component="a"
      href={PUBLIC_SITE_URL}
      target="_blank"
      rel="noopener"
    >
      <ListItemIcon>
        <LaunchIcon />
      </ListItemIcon>
      <ListItemText primary="Вернуться на сайт" />
    </ListItemButton>
  </Menu>
);

// Прокидываем меню в базовый Layout RA
const LayoutWithMenu = (props) => <Layout {...props} menu={CustomMenu} />;

const AdminPage = () => (
  <Admin
    basename="/admin"
    dataProvider={dataProvider}
    i18nProvider={i18nProvider}
    authProvider={authProvider}
    layout={LayoutWithMenu}
    loginPage={<LoginPage />}
  >
    <Resource
      name="leagues"
      options={{ label: 'Лиги' }}
      list={LeagueList}
      create={LeagueCreate}
      edit={LeagueEdit}
    />
    <Resource
      name="stadiums"
      options={{ label: 'Стадионы' }}
      list={StadiumList}
      create={StadiumCreate}
      edit={StadiumEdit}
    />
    <Resource
      name="referees"
      options={{ label: 'Судьи' }}
      list={RefereeList}
      create={RefereeCreate}
      edit={RefereeEdit}
    />
    <Resource
      name="leagueStandings"
      options={{ label: 'Турнирная таблица' }}
      list={LeagueStandingList}
      edit={LeagueStandingEdit}
      create={LeagueStandingCreate}
    />
    <Resource
      name="teams"
      options={{ label: 'Команды' }}
      list={TeamList}
      create={TeamCreate}
      edit={TeamEdit}
    />
    <Resource
      name="players"
      options={{ label: 'Игроки' }}
      list={PlayerList}
      create={PlayerCreate}
      edit={PlayerEdit}
    />
    <Resource
      name="matches"
      options={{ label: 'Матчи' }}
      list={MatchList}
      create={MatchCreate}
      edit={MatchEdit}
    />
    {/* <Resource
      name="matchEvents"
      options={{ label: 'События матча' }}
      list={MatchEventList}
      create={MatchEventCreate}
      edit={MatchEventEdit}
    /> */}
    <Resource
      name="playerStats"
      options={{ label: 'Статистика игроков' }}
      list={PlayerStatList}
      create={PlayerStatCreate}
      edit={PlayerStatEdit}
    />
    <Resource
      name="news"
      options={{ label: 'Новости' }}
      list={NewsList}
      create={NewsCreate}
      edit={NewsEdit}
    />
  </Admin>
);

export default AdminPage;
