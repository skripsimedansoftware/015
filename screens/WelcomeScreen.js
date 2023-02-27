import { View, Text, Image } from "react-native";
import React from "react";
import { Button } from "native-base";
import logo from "../assets/logo.png";

export default function WelcomeScreen({ navigation }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          marginBottom: 20,
          fontWeight: "bold",
        }}
      >
        SKRIPSI
      </Text>
      <Image
        source={logo}
        style={{
          height: 200,
          width: 200,
          marginBottom: 40,
        }}
      />
      <Text
        style={{
          marginBottom: 40,
          textAlign: "center",
          width: "80%",
          fontWeight: "bold",
        }}
      >
        Klasifikasi Telur Ayam Menggunakan Metode Color Histogram dan Gray Level
        Co-occurrence Matrix dengan K-Nearest Neighbors
      </Text>
      <Button onPress={() => navigation.navigate("HomeScreen")}>
        Lanjutkan
      </Button>
    </View>
  );
}
