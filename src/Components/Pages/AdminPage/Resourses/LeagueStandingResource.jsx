import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  ReferenceField,
  Edit,
  SimpleForm,
  NumberInput,
  ReferenceInput,
  SelectInput,
  Create,
} from 'react-admin';

export const LeagueStandingList = (props) => (
  <List {...props} title="Турнирная таблица">
    <Datagrid rowClick="edit">
      <TextField source="id" label="ID" />
      <ReferenceField source="league_id" reference="leagues" label="Лига">
        <TextField source="title" />
      </ReferenceField>
      <ReferenceField source="team_id" reference="teams" label="Команда">
        <TextField source="title" /> {/* ✅ Исправлено с name на title */}
      </ReferenceField>
      <NumberField source="played" label="Игр" />
      <NumberField source="wins" label="Побед" />
      <NumberField source="draws" label="Ничьих" />
      <NumberField source="losses" label="Поражений" />
      <NumberField source="goals_for" label="Забито" />
      <NumberField source="goals_against" label="Пропущено" />
      <NumberField source="points" label="Очки" />
    </Datagrid>
  </List>
);

export const LeagueStandingEdit = (props) => (
  <Edit {...props} title="Редактировать запись">
    <SimpleForm>
      <ReferenceInput source="league_id" reference="leagues" label="Лига">
        <SelectInput optionText="title" />
      </ReferenceInput>
      <ReferenceInput source="team_id" reference="teams" label="Команда">
        <SelectInput optionText="title" /> {/* ✅ Исправлено */}
      </ReferenceInput>
      <NumberInput source="played" label="Игр" />
      <NumberInput source="wins" label="Побед" />
      <NumberInput source="draws" label="Ничьих" />
      <NumberInput source="losses" label="Поражений" />
      <NumberInput source="goals_for" label="Забито" />
      <NumberInput source="goals_against" label="Пропущено" />
      <NumberInput source="points" label="Очки" />
    </SimpleForm>
  </Edit>
);

export const LeagueStandingCreate = (props) => (
  <Create {...props} title="Новая запись">
    <SimpleForm>
      <ReferenceInput source="league_id" reference="leagues" label="Лига">
        <SelectInput optionText="title" />
      </ReferenceInput>
      <ReferenceInput source="team_id" reference="teams" label="Команда">
        <SelectInput optionText="title" /> {/* ✅ Исправлено */}
      </ReferenceInput>
      <NumberInput source="played" label="Игр" />
      <NumberInput source="wins" label="Побед" />
      <NumberInput source="draws" label="Ничьих" />
      <NumberInput source="losses" label="Поражений" />
      <NumberInput source="goals_for" label="Забито" />
      <NumberInput source="goals_against" label="Пропущено" />
      <NumberInput source="points" label="Очки" />
    </SimpleForm>
  </Create>
);
