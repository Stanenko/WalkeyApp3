import { Tabs } from "expo-router";
import { View } from "react-native";
import { icons } from "@/constants/svg"; 
import { Svg, Path } from "react-native-svg"; 


const TabIcon = ({
  IconComponent, 
  focused,
}: {
  IconComponent: React.FC<{ fill: string }>;
  focused: boolean;
}) => (
    <View className="flex-1 justify-center items-center">
    <IconComponent
      className={`${focused ? 'translate-y--1' : 'translate-y-0'} w-10 h-10 ${focused ? 'text-black' : 'text-gray-400'}`}
      width={28}
      height={28}
    />
    {focused && <View className="w-2 h-2 bg-black rounded-full mt-1" />}
  </View>
);

const Layout = () => (
  <Tabs
    initialRouteName="index"
    screenOptions={{
      tabBarActiveTintColor: "#FBFBFB",
      tabBarShowLabel: false,
      
      tabBarStyle: {
        borderRadius: 50,
        paddingBottom: 10,
        height: 80,
        backgroundColor: "#FBFBFB",
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
      },
    }}
  >
    <Tabs.Screen
      name="home"
      options={{
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} IconComponent={icons.HomeIcon} />
        ),
        tabBarItemStyle: {
          paddingLeft: 20,
        },
      }}
    />
    <Tabs.Screen
      name="map"
      options={{
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} IconComponent={icons.MapIcon} />
        ),
      }}
    />
    <Tabs.Screen
      name="doctor"
      options={{
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} IconComponent={icons.DoctorIcon} />
        ),
      }}
    />
    <Tabs.Screen
      name="emotions"
      options={{
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon focused={focused} IconComponent={icons.EmotionsIcon} />
        ),
        tabBarItemStyle: {
          paddingRight: 20,
        },
      }}
    />
  </Tabs>
);

export default Layout;
