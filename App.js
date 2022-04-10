import HomeScreen from "./src/screens/Homescreen";
import AudioTracks from "./src/screens/Audiotracks";
import History from "./src/screens/History";
import Bookshelf from "./src/screens/Bookshelf";
import Settings from "./src/screens/Settings";
import Downloads from "./src/screens/Downloads";
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";

import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons.js";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
const Stack = createNativeStackNavigator();

// const Tab = createMaterialBottomTabNavigator();
const Tab = createBottomTabNavigator();

const TabNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { height: 75 },
        tabBarIcon: ({ focused, color, size }) => {
          size = 40;
          let iconName;
          switch (route.name) {
            case "Explore":
              iconName = focused ? "book-search" : "book-search";
              break;
            case "Bookshelf":
              iconName = focused ? "bookshelf" : "bookshelf";
              break;
            case "History":
              iconName = focused ? "history" : "history";
              break;
            case "Settings":
              iconName = focused ? "account-cog" : "account-cog";
              break;
          }
          // You can return any component that you like here!
          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
          );
        },
        tabBarActiveTintColor: "#0062C8",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Explore"
        component={HomeScreen}
        options={{
          tabBarLabel: "Explore",
        }}
      />
      <Tab.Screen
        name="Bookshelf"
        component={Bookshelf}
        options={{
          tabBarLabel: "Bookshelf",
        }}
      />
      <Tab.Screen
        name="History"
        component={History}
        options={{
          tabBarLabel: "History",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarLabel: "Settings",
        }}
      />
    </Tab.Navigator>
  );
};

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="BottomTabs" component={TabNavigation} />
        <Stack.Screen name="Audio" component={AudioTracks} />
      </Stack.Navigator>
      <StatusBar style="light" backgroundColor="" translucent={true} />
    </NavigationContainer>
  );
}

// <Tab.Screen name="Audio" component={AudioTracks} />
// <Tab.Screen name="Downloads" component={Downloads} />
export default App;
