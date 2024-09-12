'use client';

import { useEffect, useState } from 'react';
import { SimpleGrid, Container, Select, Checkbox, Stack, Button } from '@mantine/core';
import { useUser } from '@auth0/nextjs-auth0/client';
import axios from 'axios';
import Negado from "@/components/acessoNegado/acessoNegado";
import classes from "./gerenciar_usuarios.module.css";

export default function GerenciarUsuarios() {
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [roles, setRoles] = useState({
    pastor: false,
    lider: false,
    liderLouvor: false, // Adicionada nova role
  });
  const [managementToken, setManagementToken] = useState('');

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.post('https://dev-uq2tner836urewcn.us.auth0.com/oauth/token', new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: '4leL4eNoN4OqOirxbVG6AP6cJmzcVQVp',
          client_secret: 'A_wrx0-VvrhTlElrY5bmmYSIvXsOPXcUOPkFnZC74oVquspR_lw3vum8OEPkLmF8',
          audience: 'https://dev-uq2tner836urewcn.us.auth0.com/api/v2/'
        }), {
          headers: { 'content-type': 'application/x-www-form-urlencoded' }
        });
        setManagementToken(response.data.access_token);
      } catch (error) {
        console.error('Erro ao obter token de gerenciamento:', error);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    if (managementToken) {
      const fetchUsers = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_AUTH0_AUDIENCE}/users`, {
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${managementToken}`,
            }
          });
          setUsers(response.data);
        } catch (error) {
          console.error('Erro ao buscar usuários:', error);
        }
      };

      fetchUsers();
    }
  }, [managementToken]);

  useEffect(() => {
    if (selectedUserId && managementToken) {
      const fetchUserRoles = async () => {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_AUTH0_AUDIENCE}/users/${selectedUserId}/roles`, {
            headers: {
              Authorization: `Bearer ${managementToken}`,
            },
          });
          const userRoles = response.data.map(role => role.name);
          setRoles({
            pastor: userRoles.includes('Pastor'),
            lider: userRoles.includes('Lider'),
            liderLouvor: userRoles.includes('Lider Louvor'), // Adicionada nova role
          });
        } catch (error) {
          console.error('Erro ao buscar roles do usuário:', error);
        }
      };

      fetchUserRoles();
    }
  }, [selectedUserId, managementToken]);

  const handleRoleChange = async (role) => {
    const newRoles = { ...roles, [role]: !roles[role] };
    setRoles(newRoles);

    let roleId;
    switch (role) {
      case 'pastor':
        roleId = process.env.NEXT_PUBLIC_ROLE_PASTOR;
        break;
      case 'lider':
        roleId = process.env.NEXT_PUBLIC_ROLE_LIDER;
        break;
      case 'liderLouvor':
        roleId = process.env.NEXT_PUBLIC_ROLE_LIDER_LOUVOR; // Adicionada nova role
        break;
      default:
        return;
    }

    const config = {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${managementToken}`,
        'Content-Type': 'application/json',
      }
    };

    if (newRoles[role]) {
      // Adicionar role
      await axios.post(`${process.env.NEXT_PUBLIC_AUTH0_AUDIENCE}/users/${selectedUserId}/roles`, { roles: [roleId] }, config)
        .then((response) => {
          console.log('Role adicionada com sucesso:', response.data);
        })
        .catch((error) => {
          console.error('Erro ao adicionar role:', error);
        });
    } else {
      // Remover role
      await axios.delete(`${process.env.NEXT_PUBLIC_AUTH0_AUDIENCE}/users/${selectedUserId}/roles`, { data: { roles: [roleId] }, ...config })
        .then((response) => {
          console.log('Role removida com sucesso:', response.data);
        })
        .catch((error) => {
          console.error('Erro ao remover role:', error);
        });
    }
  };

  const userHasAccess = user && user['https://BetelApi.com/roles'] && (
    user['https://BetelApi.com/roles'].includes('Pastor'));

  if(userHasAccess){
    return (
      <Container>
        <form className={classes.form}>
          <SimpleGrid cols={2} spacing={100}>
            <div>
              <Select
                label="Email de Usuário"
                placeholder="Selecione o Email"
                data={users.map(user => ({ value: user.user_id, label: user.name }))}
                searchable
                onChange={(value) => setSelectedUserId(value)}
                color='red'
              />
            </div>

            <div>
              <h1>Permissões</h1>
              <Stack>
                <Checkbox
                  checked={roles.pastor}
                  onChange={() => handleRoleChange('pastor')}
                  label="Pastor"
                  color="red"
                  size="sm"
                />
                <Checkbox
                  checked={roles.lider}
                  onChange={() => handleRoleChange('lider')}
                  label="Líder"
                  color="red"
                  size="sm"
                />
                <Checkbox
                  checked={roles.liderLouvor}
                  onChange={() => handleRoleChange('liderLouvor')}
                  label="Líder Louvor"
                  color="red"
                  size="sm"
                />
              </Stack>
            </div>
          </SimpleGrid>
        </form>
      </Container>
    );
  }

  return <Negado />;
}
