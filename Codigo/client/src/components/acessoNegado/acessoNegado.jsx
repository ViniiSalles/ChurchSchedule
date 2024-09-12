import Layout from "@/components/appLayout/layout";
import { Title, Text, Button, Container, Group } from '@mantine/core';
import classes from './acessoNegado.module.css';

export default function Negado() {

    return (
        <Container className={classes.root}>
            <Title className={classes.title}>ACESSO NEGADO</Title>
            <Text c="dimmed" size="lg" ta="center" className={classes.description}>
                Infelizmente você não possui a permissão necessária para acessar esta pagina.
            </Text>
        </Container>
    );
}
