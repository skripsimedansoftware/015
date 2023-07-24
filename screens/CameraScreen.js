import { View } from "react-native";
import { Button } from "native-base";
import React, { useEffect, useRef, useState } from "react";
import { Camera } from "expo-camera";

export default function CameraScreen({ navigation }) {
  const [text, setText] = useState("Ganti Kamera");
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!permission) {
      (async () => {
        await requestPermission();
      })();
    }

    return () => {
      // second
    };
  }, []);

  return (
    <Camera
      type={type}
      ref={cameraRef}
      ratio="16:9"
      style={{
        flex: 1,
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <View
        style={{
          flex: 4,
          backgroundColor: "rgba(52, 52, 52, 0.0)",
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
        }}
      >
        <View
          style={{
            marginLeft: 10,
          }}
        >
          <Button onPress={() => navigation.goBack()}>Kembali</Button>
        </View>
        <View
          style={{
            marginRight: 10,
          }}
        >
          <Button
            onPress={() => {
              setText(
                `Ganti Kamera ${
                  type === Camera.Constants.Type.back ? "Belakang" : "Depan"
                }`,
              );
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back,
              );
            }}
          >
            {text}
          </Button>
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          width: "100%",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Button
          style={{
            alignSelf: "flex-start",
          }}
          onPress={async () => {
            const photo = await cameraRef.current.takePictureAsync();
            navigation.navigate({
              name: "HomeScreen",
              params: { photo },
              merge: true,
            });
          }}
        >
          Ambil Gambar
        </Button>
      </View>
    </Camera>
  );
}
