import { View, Image, TouchableWithoutFeedback } from "react-native";
import {
  Alert,
  Box,
  Button,
  Modal,
  VStack,
  HStack,
  useToast,
  IconButton,
  CloseIcon,
  Text,
  FormControl,
  Input,
} from "native-base";
import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import FormData from "form-data";
import AppBar from "../components/AppBar";
import UINSULogo from "../assets/logo.png";

const API = axios.create({
  baseURL: "http://192.168.43.76:8080",
});

export default function HomeScreen({ navigation, route }) {
  const [headerMessage, setHeaderMessage] = useState({
    show: true,
    varian: "outline",
    status: "info",
    title: "Selamat Datang!",
    text: "Aplikasi ini menggunakan GLCM sebagai ekstraksi fitur dan KNN sebagai metode klasifikasi",
  });
  const [upload, setUpload] = useState({
    isUploading: false,
    result: {},
    file: null,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [trainingModeActive, setTrainingModeActive] = useState(false);
  const [trainingModeClick, settrainingModeClick] = useState(0);
  const [trainLabel, setTrainLabel] = useState("");

  const toast = useToast();

  useEffect(() => {
    if (route.params?.photo) {
      setUpload({
        file: route.params.photo.uri,
        result: {},
        isUploading: false,
      });
      setModalVisible(true);
    }
  }, [route.params?.photo]);

  /**
   * Pick image from gallery
   */
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setUpload({ file: result.assets[0].uri, result: {}, isUploading: false });
      setModalVisible(true);
    }
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <AppBar navigation={navigation} />
      <View
        style={{
          flex: 6,
        }}
      >
        <View
          style={{
            width: "100%",
            flex: 1,
          }}
        >
          {headerMessage.show && (
            <Alert
              maxW="400"
              variant={headerMessage.varian}
              status={headerMessage.status}
              ml={2}
              mr={2}
              mt={2}
            >
              <VStack space={2} flexShrink={1} w="100%">
                <HStack
                  flexShrink={1}
                  space={2}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <HStack flexShrink={1} space={2} alignItems="center">
                    <Alert.Icon />
                    <Text
                      fontSize="md"
                      fontWeight="medium"
                      color="coolGray.800"
                    >
                      {headerMessage.title}
                    </Text>
                  </HStack>
                  <IconButton
                    variant="unstyled"
                    _focus={{
                      borderWidth: 0,
                    }}
                    icon={<CloseIcon size="3" />}
                    _icon={{
                      color: "coolGray.600",
                    }}
                    onPress={() => {
                      setHeaderMessage({
                        show: false,
                      });
                    }}
                  />
                </HStack>
                {headerMessage?.text && (
                  <Box
                    pl="6"
                    _text={{
                      color: "coolGray.600",
                    }}
                  >
                    {headerMessage.text}
                  </Box>
                )}
              </VStack>
            </Alert>
          )}
          <View
            style={{
              flex: 8,
              padding: 20,
              justifyContent: "center",
            }}
          >
            <TouchableWithoutFeedback
              onPress={() => {
                if (trainingModeClick === 2) {
                  const status = !trainingModeActive;
                  setTrainingModeActive(status);
                  if (status) {
                    toast.show({
                      title: "Mode latihan diaktifkan",
                      placement: "bottom",
                      variant: "subtle",
                    });
                  } else {
                    toast.show({
                      title: "Mode latihan dinon-aktifkan",
                      placement: "bottom",
                      variant: "subtle",
                    });
                  }
                } else {
                  settrainingModeClick(trainingModeClick + 1);
                  setTimeout(() => settrainingModeClick(0), 600);
                }
              }}
            >
              <Image
                style={{
                  height: 280,
                  width: 280,
                  alignSelf: "center",
                  borderWidth: trainingModeActive ? 2 : 0,
                  borderColor: "gray",
                  borderRadius: trainingModeActive ? 20 : 0,
                  marginBottom: 80,
                }}
                source={UINSULogo}
              />
            </TouchableWithoutFeedback>
          </View>
        </View>
        <Modal
          isOpen={modalVisible}
          onClose={() => setModalVisible(false)}
          bottom="4"
          size="full"
        >
          <Modal.Content>
            <Modal.CloseButton />
            <Modal.Header>Gunakan Gambar?</Modal.Header>
            <Modal.Body>
              {upload.file && (
                <Image
                  source={{
                    uri: upload.file,
                  }}
                  style={{ width: "100%", height: 300 }}
                />
              )}
              {trainingModeActive && (
                <View>
                  <FormControl>
                    <FormControl.Label>Label</FormControl.Label>
                    <Input onChangeText={(val) => setTrainLabel(val)} />
                  </FormControl>
                </View>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                flex="1"
                onPress={() => {
                  setModalVisible(false);
                  setTrainLabel("");
                  setUpload({ isUploading: true, result: {}, file: null });

                  setHeaderMessage({
                    show: true,
                    varian: "left-accent",
                    status: "warning",
                    title: "Mengunggah...",
                    text: "Mohon bersabar, berkas dalam proses pengunggahan",
                  });

                  const formData = new FormData();

                  formData.append("image", {
                    name: "image",
                    type: "image/jpg",
                    uri: upload.file,
                  });

                  if (trainingModeActive) {
                    formData.append("train", true);
                    formData.append("label", trainLabel);
                  }

                  API.post("/upload", formData, {
                    headers: {
                      "Content-Type": "multipart/form-data",
                    },
                  }).then(
                    ({ data }) => {
                      setHeaderMessage({
                        show: false,
                      });

                      toast.show({
                        title: "Unggah berkas berhasil",
                        placement: "bottom",
                        variant: "subtle",
                      });

                      setUpload({
                        isUploading: false,
                        file: null,
                        result: data.data,
                      });

                      navigation.navigate("ResultScreen", {
                        data: data.data,
                        API,
                        training: {
                          active: trainingModeActive,
                          label: trainLabel,
                        },
                      });
                    },
                    () => {
                      setUpload({ isUploading: false, result: {} });
                      setHeaderMessage({
                        show: true,
                        varian: "left-accent",
                        status: "error",
                        title: "Gagal!",
                        text: "Pastikan anda memiliki koneksi internet",
                      });
                      setModalVisible(false);
                      toast.show({
                        title: "Unggah berkas gagal",
                        placement: "bottom",
                        variant: "subtle",
                      });
                    }
                  );
                }}
              >
                {trainingModeActive
                  ? "Unggah Data Latih"
                  : "Proses Klasifikasi"}
              </Button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      </View>
      <View
        style={{
          flexDirection: "row",
          flex: 1,
          justifyContent: "space-around",
        }}
      >
        <Button
          style={{
            marginBottom: 10,
            alignSelf: "center",
          }}
          onPress={pickImage}
        >
          Pilih Berkas
        </Button>
        <Button
          style={{
            marginBottom: 10,
            alignSelf: "center",
          }}
          onPress={() => navigation.navigate("CameraScreen")}
        >
          Ambil Foto
        </Button>
      </View>
    </View>
  );
}
