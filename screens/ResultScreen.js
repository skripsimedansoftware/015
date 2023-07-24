/* eslint-disable react/destructuring-assignment */
import React, { useEffect } from "react";
import { Pressable } from "react-native";
import {
  Box,
  Heading,
  Text,
  Spacer,
  FlatList,
  HStack,
  VStack,
  View,
  Image,
} from "native-base";

export default function ResultScreen({ navigation, route }) {
  useEffect(() => {
    navigation.setOptions({
      title: route.params.training.active
        ? `Data Latih ${route.params.training.label}`
        : `Hasil Klasifikasi : ${route.params.data.KNNGLCM.current.label}`,
    });
  }, []);

  const displayGLCM = (data) => (
    <Box
      style={{
        flex: 1,
      }}
    >
      <Heading fontSize="xl" p="4" pb="3">
        GLCM
        {" "}
        <Spacer />
        {" "}
        <Text fontSize="sm" color="pink.800">
          (Gray Color Co-occurrence Matrix)
        </Text>
      </Heading>
      <FlatList
        data={Object.keys(data)}
        scrollEnabled
        renderItem={({ item }) => {
          const list = ["contrast", "energy", "homogeneity"];
          if (list.indexOf(item.split("_")[0]) !== -1) {
            return (
              <Box borderBottomWidth="1" pl={["4", "4"]} pr={["4", "5"]} py="2">
                <HStack space={[2, 3]} justifyContent="space-between">
                  <VStack>
                    <Text fontSize="md">
                      {item.split("_")[0]}
                      {" "}
                      {item.split("_")[1]}
                    </Text>
                  </VStack>
                  <Text
                    fontSize="md"
                    _dark={{
                      color: "warmGray.50",
                    }}
                    color="coolGray.800"
                    alignSelf="flex-start"
                    dir
                  >
                    {data[item]}
                  </Text>
                </HStack>
              </Box>
            );
          }

          return false;
        }}
      />
    </Box>
  );

  const displayKNN = (data) => (
    <Box
      style={{
        flex: 1,
      }}
    >
      <Heading fontSize="xl" p="4" pb="3">
        KNN
        {" "}
        <Spacer />
        {" "}
        <Text fontSize="sm" color="pink.800">
          (K-Nearest Neighbors)
        </Text>
      </Heading>
      <Box borderBottomWidth="1" pl={["4", "4"]} pr={["4", "5"]} py="2">
        <HStack space={[2, 3]} justifyContent="space-between">
          <FlatList
            data={data.results}
            scrollEnabled
            renderItem={({ item }) => (
              <Box borderBottomWidth="0" pl={["4", "4"]} pr={["4", "5"]} py="2">
                <HStack space={[2, 3]} justifyContent="space-between">
                  <VStack>
                    <Text fontSize="lg" fontWeight="bold" color="green.800">
                      {item.label}
                    </Text>
                  </VStack>
                  <Text
                    fontSize="lg"
                    color="blue.800"
                    alignSelf="flex-start"
                    dir
                  >
                    {item.distance}
                  </Text>
                </HStack>
              </Box>
            )}
          />
        </HStack>
      </Box>
    </Box>
  );

  return (
    <View
      style={{
        flex: 1,
        paddingBottom: 20,
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-around",
        }}
      >
        <Pressable
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            navigation.navigate("ImageScreen", {
              uri: `${route.params.baseURL}/uploads/${route.params?.data?.images.grayscale}`,
            });
          }}
        >
          <Image
            alt="Grayscale"
            source={{
              uri: `${route.params.baseURL}/uploads/${route.params?.data?.images.grayscale}`,
            }}
            style={{
              height: "88%",
              width: "88%",
              borderColor: "black",
              borderWidth: 2,
              borderRadius: 20,
              marginTop: 2,
            }}
          />
        </Pressable>
        <Pressable
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            navigation.navigate("ImageScreen", {
              uri: `${route.params.baseURL}/uploads/${route.params?.data?.images.texture}`,
            });
          }}
        >
          <Image
            alt="Texture"
            source={{
              uri: `${route.params.baseURL}/uploads/${route.params?.data?.images.texture}`,
            }}
            style={{
              height: "88%",
              width: "88%",
              borderColor: "black",
              borderWidth: 2,
              borderRadius: 20,
              marginTop: 2,
            }}
          />
        </Pressable>
      </View>
      <View
        style={{
          flex: 4,
        }}
      >
        {route.params?.data?.GLCM && (
          <View
            style={{
              flex: route.params.training.active ? 4 : 1,
            }}
          >
            {displayGLCM(route.params.data.GLCM)}
          </View>
        )}
        {route.params?.data?.KNNGLCM && displayKNN(route.params.data.KNNGLCM)}
      </View>
    </View>
  );
}
