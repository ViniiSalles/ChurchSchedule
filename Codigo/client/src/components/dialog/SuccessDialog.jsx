import React from 'react';
import { Dialog, Button, Text } from '@mantine/core';

const SuccessDialog = ({ opened, onClose, title, children }) => {
  return (
    <Dialog
      opened={opened}
      onClose={onClose}
      withCloseButton
      size="lg"
      radius="md"
      position={{ bottom: 80, right: 20 }}
    >
      <Text size="sm" mb="xs" style={{ fontWeight: 500 }}>
        {title}
      </Text>
      {children}
      <Button onClick={onClose}>Fechar</Button>
    </Dialog>
  );
};

export default SuccessDialog;