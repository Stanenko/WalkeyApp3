import { create } from 'zustand';
import { LocationStore } from '@/types/type';

export const useLocationStore = create<LocationStore>((set) => ({
    userLatitude: null,
    userLongitude: null,
    userAddress: null,
    destinationLatitude: null,
    destinationLongitude: null,
    destinationAddress: null,
    
    // Метод для установки местоположения пользователя
    setUserLocation: ({ latitude, longitude, address }) =>
        set({
            userLatitude: latitude,
            userLongitude: longitude,
            userAddress: address,
        }),

    // Метод для установки местоположения назначения
    setDestinationLocation: ({ latitude, longitude, address }) =>
        set({
            destinationLatitude: latitude,
            destinationLongitude: longitude,
            destinationAddress: address,
        }),
}));
