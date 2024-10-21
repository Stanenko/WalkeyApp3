import { View, Switch, Image, Text, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from 'react';
import { icons } from "@/constants/svg";
import MapView, { PROVIDER_DEFAULT, Marker } from "react-native-maps";
import * as Location from 'expo-location';
import NetInfo from "@react-native-community/netinfo";
import { Linking } from 'react-native';
import { images } from "@/constants/index";
import { useLocationStore } from "@/store/index"; 
import { useUser } from '@clerk/clerk-expo';

const Map = () => {
    const { userLatitude, userLongitude, setUserLocation } = useLocationStore(); 
    const [isToggled, setIsToggled] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isConnected, setIsConnected] = useState(true);
    const { user } = useUser(); 
    const [userName, setUserName] = useState('Байт'); 
    const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !user.id) return; 

      try {
        const response = await fetch(`http://192.168.0.18:3000/api/user?clerkId=${user.id}`);
        const data = await response.json();
        if (response.ok) {
          setUserName(data.name); 
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

    const toggleSwitch = () => setIsToggled(!isToggled);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (!state.isConnected) {
                setErrorMsg('Немає підключення до інтернету');
                setIsConnected(false);
            } else {
                setIsConnected(true);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!isConnected) return;

        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Доступ до розташування було відхилено');
                    return;
                }

                const lastKnownLocation = await Location.getLastKnownPositionAsync();
                if (lastKnownLocation) {
                    setUserLocation({
                        latitude: lastKnownLocation.coords.latitude,
                        longitude: lastKnownLocation.coords.longitude,
                        address: "Последний известный адрес", 
                    });
                }

                let userLocation = await Location.getCurrentPositionAsync({});
                setUserLocation({
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                    address: "Ваша адреса",
                });

            } catch (error) {
                console.error('Помилка при отриманні розташування', error);
                setErrorMsg('Помилка при отриманні розташування');
            }
        })();
    }, [setUserLocation, isConnected]);

    if (errorMsg) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <Text>{errorMsg}</Text>
                <Button
                    title="Відкрити налаштування"
                    onPress={() => Linking.openSettings()} 
                />
            </SafeAreaView>
        );
    }

    const CustomMarker = () => {
        return (
            <View className="items-center">
                <View className="border-3 border-[#FF6C22] rounded-full p-2 bg-[#FF6C22]">
                    <Image
                        source={images.YourDog}
                        className="w-16 h-16 rounded-full"
                    />
                </View>
                <Text className="mt-2 font-bold">Байт</Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">

            <View className="flex-row justify-between items-center p-5">
                <icons.WalkeyIcon />
                <View className="flex-row items-center ml-auto">
            <Text className="ml-2 text-sm font-semibold">
              {userName} зараз{' '}
            </Text>
            <View className="relative">
              <Text className="text-sm font-semibold">{isToggled ? 'гуляє' : 'вдома'}</Text>
              <View className="absolute left-0 right-0 bg-black" style={{ height: 2, bottom: -1 }} />
            </View>
            <Switch
              value={isToggled}
              onValueChange={toggleSwitch}
              thumbColor={isToggled ? '#F15F15' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#FED9C6' }}
              className="ml-2"
              style={{ marginRight: 12, transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} 
            />
            <icons.BellIcon />
          </View>
            </View>

            {userLatitude && userLongitude ? (
                <View className="flex-1 mt-4 overflow-hidden rounded-t-[30px]">
                    <MapView
                        provider={PROVIDER_DEFAULT}
                        className="flex-1"
                        mapType="mutedStandard"
                        showsPointsOfInterest={false}
                        showsCompass={false}
                        initialRegion={{
                            latitude: userLatitude,
                            longitude: userLongitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                          }}
                    >
                        <Marker
                          coordinate={{
                            latitude: userLatitude,
                            longitude: userLongitude,
                          }}
                        >
                            <CustomMarker />
                        </Marker>
                    </MapView>
                </View>
            ) : (
                <View className="flex-1 justify-center items-center">
                    <Text>{errorMsg || 'Одержання розташування...'}</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

export default Map;
