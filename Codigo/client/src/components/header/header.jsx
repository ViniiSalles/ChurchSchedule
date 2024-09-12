'use client';

import { Container, Image, Burger} from '@mantine/core';
import classes from './header.module.css';
import NextImage from 'next/image';
import Link from 'next/link';

import logo from '../../../public/NewLogo.png';
import userImage from '../../../public/usericon.png';

import { useUser } from '@auth0/nextjs-auth0/client';
import { UserProvider } from '@auth0/nextjs-auth0/client';

export default function Header({ open, setOpened, userpermission }) {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  return (
    <UserProvider>
      <header className={classes.header}>
        <Container fluid className={classes.inner}>
        {user && (
          <Burger
            opened={open}
            onClick={() => setOpened((o) => !o)}
            title={open ? 'Close navigation' : 'Open navigation'}
            color='white'
            w={200}
          />)}
          <Image component={NextImage} src={logo} alt='Logo' h={65} />
          {/* <h2>ChurchSchedule</h2> */}
          {user ? (
            <div className={classes.userDetails}>
              <div className={classes.usertextDetails}>
                <p className={classes.userEmail} style={{ color: 'white' }}>{user.email}</p>
                <a href="/api/auth/logout" className="logoutLink" style={{ color: 'white' }}>Logout</a>
              </div>
              <img src={user.picture} alt={user.name} className={classes.userImage} />
            </div>
          ) : (
            <Link href="/api/auth/login" passHref>
              <Image component={NextImage} src={userImage} alt="User Image" h={45} />
            </Link>
          )}
        </Container>
      </header>
    </UserProvider>
  );
}