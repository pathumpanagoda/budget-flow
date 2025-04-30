import React, { createContext, useContext, useState } from 'react';
import { Modal, View as RNView, StyleSheet } from 'react-native';
import { Text, View } from './Themed';
import Button from './Button';

const ConfirmDialogContext = createContext();

export function useConfirmDialog() {
  return useContext(ConfirmDialogContext);
}

export function ConfirmDialogProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [dialogProps, setDialogProps] = useState({});

  const showConfirm = ({
    title = 'Confirm',
    message = '',
    confirmText = 'Yes',
    cancelText = 'Cancel',
    onConfirm = () => {},
    onCancel = () => {},
  }) => {
    setDialogProps({ title, message, confirmText, cancelText, onConfirm, onCancel });
    setVisible(true);
  };

  const handleConfirm = () => {
    setVisible(false);
    dialogProps.onConfirm && dialogProps.onConfirm();
  };

  const handleCancel = () => {
    setVisible(false);
    dialogProps.onCancel && dialogProps.onCancel();
  };

  return (
    <ConfirmDialogContext.Provider value={{ showConfirm }}>
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <RNView style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.title}>{dialogProps.title}</Text>
            <Text style={styles.message}>{dialogProps.message}</Text>
            <RNView style={styles.buttonRow}>
              <Button title={dialogProps.cancelText} onPress={handleCancel} style={styles.button} variant="outline" />
              <Button title={dialogProps.confirmText} onPress={handleConfirm} style={styles.button} />
            </RNView>
          </View>
        </RNView>
      </Modal>
    </ConfirmDialogContext.Provider>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
}); 