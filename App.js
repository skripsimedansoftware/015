import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NativeBaseProvider } from "native-base";
import React from "react";

import HomeScreen from "./screens/HomeScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import CameraScreen from "./screens/CameraScreen";
import ResultScreen from "./screens/ResultScreen";
import ImageScreen from "./screens/ImageScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="CameraScreen"
            component={CameraScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name="ResultScreen" component={ResultScreen} />
          <Stack.Screen
            name="ImageScreen"
            component={ImageScreen}
            options={{
              title: "Pratinjau",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
}
