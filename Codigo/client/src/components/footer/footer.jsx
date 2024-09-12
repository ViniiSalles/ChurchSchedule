import { Container, Group, ActionIcon, rem, Text, Anchor } from '@mantine/core';
import { IconBrandInstagram, IconBrandFacebook } from '@tabler/icons-react'
import classes from './footer.module.css';


export default function Footer() {

  return (
    <div className={classes.footer} >
      <Container fluid className={classes.inner}>
        <div className={classes.direito}>
          <Text>Todos Os Direitos Reservados</Text>
        </div>

        <div className={classes.social} style={{ padding: '0px' }}>
          <Text>Redes Sociais:</Text>
          <Group gap="sm" className={classes.links} justify="flex-end" wrap="nowrap">
            <Anchor href="https://m.facebook.com/betel.flamengo/" target="_blank">
              <ActionIcon size="lg" color="gray" variant="subtle">
                <IconBrandFacebook style={{ width: rem(25), height: rem(25) }} stroke={1.5} color='#8C2020' />
              </ActionIcon>
            </Anchor>

            <Anchor href="https://www.instagram.com/betelflamengo?igsh=aWE5cWZxeGxuNXNn" target="_blank">
              <ActionIcon size="lg" color="gray" variant="subtle">
                <IconBrandInstagram style={{ width: rem(25), height: rem(25) }} stroke={1.5} color='#8C2020' />
              </ActionIcon>
            </Anchor>
          </Group>
        </div>
      </Container>
    </div>
  );
}