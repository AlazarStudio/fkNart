// src/admin/Resourses/RefereeResource.jsx
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

const validateName = [required()];

export const RefereeList = (props) => (
  <List {...props} perPage={25} sort={{ field: 'id', order: 'ASC' }}>
    <Datagrid rowClick="edit">
      <TextField source="id" label="ID" />
      <TextField source="name" label="Имя" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const RefereeCreate = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" label="Имя" fullWidth validate={validateName} />
    </SimpleForm>
  </Create>
);

export const RefereeEdit = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="name" label="Имя" fullWidth validate={validateName} />
    </SimpleForm>
  </Edit>
);
