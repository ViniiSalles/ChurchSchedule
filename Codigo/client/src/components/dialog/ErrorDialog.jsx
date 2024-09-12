import React from 'react';
import { Dialog, Button, Text } from '@mantine/core';

const ErrorDialog = ({ opened, onClose, title, children }) => {
  return (
    <Dialog
      opened={opened}
      onClose={onClose}
      withCloseButton
      size="lg"
      radius="md"
      position={{ bottom: 80, right: 20 }}
      style={{ backgroundColor: "#FCB3BA", color: "#FA392B" }}
      styles={{
        closeButton: {
          color: "#f35144", // Cor do texto do botão de fechar
          backgroundColor: "#ffcccc", // Cor de fundo do botão de fechar
          '&:hover': { // Estilos para o estado de hover
            backgroundColor: "#f35144", // Nova cor de fundo para o estado de hover
            color: "#fff", // Nova cor do texto para o estado de hover
          },
        },
      }}
    >
      <Text size="sm" mb="xs">
        {title}
      </Text>
      {children}
    </Dialog>
  );
};

export default ErrorDialog;