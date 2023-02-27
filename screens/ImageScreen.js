import React from "react";
import { View, Image, Dimensions } from "react-native";

const { height, width } = Dimensions.get("screen");

export default function ImageScreen({ route }) {
  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <Image
        source={{
          uri: route.params.uri,
        }}
        style={{
          height,
          width,
        }}
      />
    </View>
  );
}
