'use client'

import React from 'react';
import { AppShell } from '@mantine/core';
import Header from '@/components/header/header';
import Navbar from '@/components/navbar/navbar';
import Footer from '@/components/footer/footer';
import { useUser } from '@auth0/nextjs-auth0/client';

const Layout = ({ children }) => {
  const [open, setOpened] = React.useState(false);
  const { user } = useUser();

  return (
    <AppShell
      header={{ height: 80 }}
      navbar={{ width: 300, breakpoint: 'sm'}}
      padding="md"
      footer={{ height: 50 }}
    >
      <AppShell.Header style={{zIndex: 1010}}>
          <Header open={open} setOpened={setOpened} userpermission={user} />
      </AppShell.Header>

      {user && open && (
        <AppShell.Navbar h={500} style={{backgroundColor: "#F2F2F2", zIndex: 1010}}>
          <Navbar opened={open} />
        </AppShell.Navbar>
      )}

      <AppShell.Main pl={16}>
        <main>{children}</main>
      </AppShell.Main>

      <AppShell.Footer style={{zIndex: 1010}}>
        <Footer />
      </AppShell.Footer>
    </AppShell>
  );
};

export default Layout;
