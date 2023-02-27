import React, { useState } from "react";
import {
  StatusBar,
  Box,
  HStack,
  Icon,
  IconButton,
  Text,
  Modal,
  VStack,
  Spacer,
} from "native-base";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function AppBar() {
  const [modalVisible, setModalVisible] = useState(false);

  const setInfo = (label, value) => (
    <HStack space={[2, 3]} justifyContent="space-between">
      <VStack>
        <Text fontSize="md">{label}</Text>
      </VStack>
      <Spacer />
      <Text
        fontSize="md"
        _dark={{
          color: "warmGray.50",
        }}
        color="coolGray.800"
        alignSelf="flex-start"
        dir
      >
        {value}
      </Text>
    </HStack>
  );
  return (
    <>
      <StatusBar bg="#3700B3" barStyle="light-content" />
      <Box safeAreaTop bg="green.600" />
      <HStack
        bg="green.800"
        px="2"
        py="3"
        justifyContent="space-between"
        alignItems="center"
        w="100%"
      >
        <HStack alignItems="center">
          <Text color="white" fontSize="20" fontWeight="bold" pl={4}>
            Egg Checker
          </Text>
        </HStack>
        <HStack>
          <IconButton
            icon={
              <Icon as={MaterialIcons} name="info" size="sm" color="white" />
            }
            onPress={() => setModalVisible(true)}
          />
        </HStack>
      </HStack>
      <Modal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        avoidKeyboard
        justifyContent="center"
        bottom="4"
        size="lg"
      >
        <Modal.Content>
          <Modal.CloseButton />
          <Modal.Header>Tentang Aplikasi</Modal.Header>
          <Modal.Body>
            <Box
              borderBottomWidth={2}
              borderTopWidth={2}
              pl={["4", "4"]}
              pr={["4", "5"]}
              py="2"
            >
              {setInfo("Pembuat", "G3MB3L INT3RN3T")}
            </Box>
          </Modal.Body>
          <Modal.Footer>
            <Text>Versi : 1.0.0</Text>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </>
  );
}
