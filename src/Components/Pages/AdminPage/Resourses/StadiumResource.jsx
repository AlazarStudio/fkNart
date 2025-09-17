import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  required,
} from 'react-admin';

export const StadiumList = (props) => (
  <List {...props} perPage={25}>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" label="Название" />
      <TextField source="location" label="Местоположение" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

const validateName = [required()];

export const StadiumCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput
        source="name"
        label="Название"
        fullWidth
        validate={validateName}
      />
      <TextInput source="location" label="Местоположение" fullWidth />
    </SimpleForm>
  </Create>
);

export const StadiumEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput
        source="name"
        label="Название"
        fullWidth
        validate={validateName}
      />
      <TextInput source="location" label="Местоположение" fullWidth />
    </SimpleForm>
  </Edit>
);
