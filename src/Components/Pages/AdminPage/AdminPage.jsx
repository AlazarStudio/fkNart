import React from 'react';
import { Admin, Resource } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import russianMessages from 'ra-language-russian';

import serverConfig from '../../../serverConfig';
import authProvider from './JS/authProvider';
import { fetchJsonWithToken } from './JS/fetchJsonWithToken';

import LoginPage from './LoginPage';
import CustomLayout from './CustomLayout';

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

const dataProvider = simpleRestProvider(`${serverConfig}`, fetchJsonWithToken);
const i18nProvider = polyglotI18nProvider(() => russianMessages, 'ru');

const AdminPage = () => (
  <Admin
    basename="/admin"
    dataProvider={dataProvider}
    i18nProvider={i18nProvider}
    authProvider={authProvider}
    layout={CustomLayout}
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
    <Resource
      name="matchEvents"
      options={{ label: 'События матча' }}
      list={MatchEventList}
      create={MatchEventCreate}
      edit={MatchEventEdit}
    />
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
