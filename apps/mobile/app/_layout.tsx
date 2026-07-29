import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#54704B",
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Emergency",
            headerTitle: "Emergency Vet Care",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="medkit" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="shelters"
          options={{
            title: "Shelters",
            headerTitle: "Animal Shelters",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerTitle: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
