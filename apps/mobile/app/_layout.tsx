import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";

function TabIcon({ emoji }: { emoji: string }) {
  return <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#ea580c",
          headerTitleStyle: { fontWeight: "700" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Emergency",
            headerTitle: "🚨 Emergency Vet Care",
            tabBarIcon: () => <TabIcon emoji="🚨" />,
          }}
        />
        <Tabs.Screen
          name="shelters"
          options={{
            title: "Shelters",
            headerTitle: "🏠 Animal Shelters",
            tabBarIcon: () => <TabIcon emoji="🏠" />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerTitle: "Profile",
            tabBarIcon: () => <TabIcon emoji="👤" />,
          }}
        />
      </Tabs>
    </>
  );
}
