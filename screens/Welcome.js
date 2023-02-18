import { View, Text, Button } from "react-native";
import React from "react";

export default function Welcome({ navigation }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Welcome</Text>
      <Button title="Goto Home" onPress={() => navigation.navigate("Home")} />
    </View>
  );
}
