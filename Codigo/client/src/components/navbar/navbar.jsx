'use client'

import { ScrollArea, NavLink, Box } from '@mantine/core';
import { useState } from 'react';
import classes from './navbar.module.css';
import { motion } from 'framer-motion';
import { IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';

const mockdata = [
    { label: 'Home', link: '/' },
    {
        label: 'Escala',
        links: [
            { label: 'Escalar evento', link: '/escala' },
            { label: 'Lista de escalas', link: '/lista_escalas' },
        ],
    },
    {
        label: 'Listas',
        links: [
            { label: 'Eventos', link: '/lista_eventos' },
            { label: 'Obreiros', link: '/lista_obreiros' },
            { label: 'Bandas', link: '/lista_bandas' },
        ],
    },
    { label: 'Banco de horas', link: '/banco_de_horas' },
    { label: 'Gerencia de Usuarios', link: '/gerenciar_usuarios'},
    { label: 'Indisponibilidade', link: '/indisponibilidade'},
];

export default function Navbar({opened}) {
    const [active, setActive] = useState(0);

    const itemVariants = {
        open: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, type: "spring", stiffness: 300, damping: 24 }
        }),
        closed: { opacity: 0, y: 20, transition: { duration: 0.2 } }
    };

    const links = mockdata.map((item, index) => (
        <motion.div
            custom={index}
            initial="closed"
            animate="open"
            variants={itemVariants}
            key={item.label}
        >
            {item.links ? (
                <NavLink
                    label={item.label}
                    active={active === index}
                    onClick={() => setActive(index)}
                    color="#8C2020"
                    rightSection={<IconChevronRight color='red' size="1.5rem" stroke={2} className="mantine-rotate-rtl" />}
                >
                    {item.links.map((subItem) => (
                        <NavLink
                            key={subItem.label}
                            label={subItem.label}
                            component={Link}
                            href={subItem.link}
                            active={active === subItem.link}
                            color="#8C2020"
                            onClick={() => setActive(subItem.link)}
                        />
                    ))}
                </NavLink>
            ) : (
                <NavLink
                    label={item.label}
                    component={Link}
                    href={item.link}
                    active={active === index}
                    onClick={() => setActive(index)}
                    color="#8C2020"
                />
            )}
        </motion.div>
    ));

    if (!opened) {
        return null;
      } 
      
    return (
        <nav className={classes.navbar}>
            <ScrollArea className={classes.links}>
                <div className={classes.linksInner}>{links}</div>
            </ScrollArea>
        </nav>
    );
}
