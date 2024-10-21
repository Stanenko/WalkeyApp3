import { useState } from "react";
import { Text, ScrollView, View, TouchableOpacity, Alert } from "react-native";
import { icons } from "@/constants/svg";
import { useRouter } from "expo-router";
import { useSignUp } from "@clerk/clerk-expo";
import InputField from "@/components/InputField";
import { fetchAPI } from "@/lib/fetch";
import ModalDropdown from "react-native-modal-dropdown";

const SignUp = () => {
    const { isLoaded, signUp, setActive } = useSignUp();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        gender: "",
        birthDay: "",
        birthMonth: "",
        birthYear: "",
    });

    const getMonthNumber = (monthName) => {
        const months = {
            "Січень": "01",
            "Лютий": "02",
            "Березень": "03",
            "Квітень": "04",
            "Травень": "05",
            "Червень": "06",
            "Липень": "07",
            "Серпень": "08",
            "Вересень": "09",
            "Жовтень": "10",
            "Листопад": "11",
            "Грудень": "12"
        };
    
        return months[monthName] || "01";
    };

    const formatDate = () => {
        const day = form.birthDay.padStart(2, '0');
        const month = getMonthNumber(form.birthMonth); 
        const year = form.birthYear;
        
        return `${year}-${month}-${day}`; 
    };

    const [verification, setVerification] = useState({
        state: "default",
        error: "",
        code: "",
    });
    const [clerkId, setClerkId] = useState<string | null>(null); 

    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState({ type: "", visible: false });

    const onSignUpPress = async () => {
        if (!isLoaded) return;

        if (!form.email || !form.password) {
            Alert.alert("Помилка", "Будь ласка, введіть емейл та пароль.");
            return;
        }

        try {
            
            await signUp.create({
                emailAddress: form.email,
                password: form.password,
            });
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

            setVerification({ state: 'pending' });
            setStep(2); 
        } catch (err: any) {
            Alert.alert('Error', err.errors[0]?.longMessage || 'Something went wrong');
        }
    };

    const onPressVerify = async () => {
        if (!isLoaded) return;

        if (!verification.code.trim()) {
            Alert.alert("Помилка", "Будь ласка, введіть код підтвердження.");
            return;
        }

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code: verification.code,
            });

            if (completeSignUp.status === 'complete') {
                const userId = signUp.createdUserId; 
                if (userId) {
                    console.log("User ID from Clerk:", userId);
                    console.log("Session ID from Clerk:", completeSignUp.createdSessionId);
                    setClerkId(userId);
                    setStep(3);
                } else {
                    Alert.alert("Помилка", "Clerk ID не доступний. Спробуйте ще раз.");
                }
            } else {
                setVerification({
                    ...verification,
                    error: 'Verification failed.',
                    state: 'failed',
                });
            }
        } catch (err: any) {
            setVerification({
                ...verification,
                error: err.errors[0]?.longMessage || 'Verification failed',
                state: 'failed',
            });
        }
    };

    const onSubmitName = async () => {
        if (!form.name.trim()) {
            Alert.alert("Помилка", "Будь ласка, введіть своє ім'я.");
            return;
        }

        if (!clerkId || !form.email || !form.name || !form.birthDay || !form.birthMonth || !form.birthYear) {
            Alert.alert("Помилка", "Всі поля повинні бути заповнені.");
            return;
        }

        try {
            const formattedBirthDate = formatDate();
            console.log("Дата рождения:", formattedBirthDate);

            await fetchAPI("/(api)/user", {
                method: "POST",
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    clerkId: clerkId,
                    gender: form.gender,
                    birthDate: formattedBirthDate,
                }),
            });

            await setActive({ session: signUp.createdSessionId });
            Alert.alert('Успіх', 'Реєстрація завершена');
            router.push("/(root)/(tabs)/home");
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Something went wrong');
        }
    };

    const renderDatePicker = () => {
        return (
            <View className="flex-row justify-start ml-[30px] mb-[24px]"> 
                <View className="w-[80px] mr-[10px]"> 
                    <View className="flex-row items-center">
                        <ModalDropdown
                            options={Array.from({ length: 31 }, (_, i) => (i + 1).toString())}
                            defaultValue="День"
                            onSelect={(index, value) => setForm({ ...form, birthDay: value })}
                            textStyle={{
                                fontSize: 18,
                                color: 'black',
                                fontWeight: 'bold',
                                padding: 10,
                            }}
                            dropdownTextStyle={{
                                fontSize: 18,
                                fontWeight: 'bold',
                                paddingHorizontal: 10,
                            }}
                        />
                        <View className="ml-[10px]">
                            <icons.ArrowDown width={20} height={20} />
                        </View>
                    </View>
                </View>
    
                <View className="w-[120px] mx-[10px]"> 
                    <View className="flex-row items-center">
                        <ModalDropdown
                            options={[
                                'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 
                                'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
                            ]}
                            defaultValue="Місяць"
                            onSelect={(index, value) => setForm({ ...form, birthMonth: value })}
                            textStyle={{
                                fontSize: 18,
                                color: 'black',
                                fontWeight: 'bold',
                                padding: 10,
                            }}
                            dropdownTextStyle={{
                                fontSize: 18,
                                fontWeight: 'bold',
                                paddingHorizontal: 10,
                            }}
                        />
                        <View className="ml-[10px]">
                            <icons.ArrowDown width={20} height={20} />
                        </View>
                    </View>
                </View>
    
                <View className="w-[80px] ml-[10px]">
                    <View className="flex-row items-center">
                        <ModalDropdown
                            options={Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - i).toString())}
                            defaultValue="Рік"
                            onSelect={(index, value) => setForm({ ...form, birthYear: value })}
                            textStyle={{
                                fontSize: 18,
                                color: 'black',
                                fontWeight: 'bold',
                                padding: 10,
                            }}
                            dropdownTextStyle={{
                                fontSize: 18,
                                fontWeight: 'bold',
                                paddingHorizontal: 10,
                            }}
                        />
                        <View className="ml-[10px]">
                            <icons.ArrowDown width={20} height={20} />
                        </View>
                    </View>
                </View>
            </View>
        );
    };
    

    return (
        <View className="flex-1 bg-white justify-between">
            <ScrollView className="flex-1 bg-white">
               
            <TouchableOpacity
                onPress={() => {
                    if (step === 1) {
                        router.push('/(auth)/welcome'); 
                    } else if (step === 3) {
                        setStep(step - 2); 
                    } else{
                        setStep(step - 1); 
                    }
                }}
                className="absolute w-[36px] h-[64px] top-[68px] left-[45px] z-10"
            >
                <icons.ArrowLeft />
            </TouchableOpacity>
                  

                {step === 1 && (
                    <View className="p-5">
                        <View className="relative w-full h-[250px]">
                            <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
                                Email пет-перента
                            </Text>
                        </View>
                        <InputField
                            label="Email"
                            placeholder="Enter email"
                            icon={icons.email}
                            textContentType="emailAddress"
                            value={form.email}
                            onChangeText={(value) => setForm({ ...form, email: value })}
                        />
                        <InputField
                            label="Password"
                            placeholder="Enter password"
                            icon={icons.lock}
                            secureTextEntry={true}
                            textContentType="password"
                            value={form.password}
                            onChangeText={(value) => setForm({ ...form, password: value })}
                        />
                        <Text className="text-neutral-400 mt-2">
                            Чому у песиків все ще нема особистих...
                        </Text>
                    </View>
                )}
                {step === 2 && (
                    <View className="p-5">
                        <View className="relative w-full h-[250px]">
                            <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
                                Код із email
                            </Text>
                        </View>
            
                        <InputField
                            label={"Kод підтвердження"}
                            icon={icons.lock}
                            placeholder={"12345"}
                            value={verification.code}
                            keyboardType="numeric"
                            onChangeText={(code) => setVerification({ ...verification, code })}
                        />
                        <Text className="text-neutral-400 mt-2">
                            Будьте уважними, як ваш песик.
                        </Text>
                        {verification.error && (
                            <Text className="text-red-500 text-sm mt-1">{verification.error}</Text>
                        )}
                    </View>
                )}
                {step === 3 && (
                    <View className="flex-1 bg-white">
                        <View className="relative w-full h-[250px]">
                            <View className="absolute top-[129px] left-0 right-0 flex justify-center items-center">
                                <icons.LogoIcon />
                            </View>
                        </View>
                        <View className="absolute top-[235px] left-0 right-0 flex justify-center items-center">
                            <Text className="text-2xl text-black font-JakartaSemiBold absolute left-0 right-0 text-center px-5">
                                Ласкаво просимо до{"\n"}
                                <Text className="text-2xl text-black font-JakartaSemiBold">Walkey!</Text>
                            </Text>
                        </View>
                        <View className="mb-[33px]" />



                        <View className="p-5">
                        {[
                            { text: "Будьте собою!", description: "Переконайтеся, що інформація про вашу собаку (вік, фото, біографія) є точною." },
                            { text: "Турбуйтеся про безпеку!", description: "Не діліться особистою інформацією занадто швидко." },
                            { text: "Соціалізуйтеся з повагою!", description: "Поважайте інших власників собак і не забувайте про гарну поведінку." },
                            { text: "Будьте уважними!", description: "Звітуйте про будь-які інциденти або небезпеки під час прогулянки." },
                        ].map((item, index) => (
                            <View key={index} className="mb-8 pl-[30px] pr-[40px]">
                                <View className="flex-row items-center">
                                    <icons.PawIcon width={24} height={24} className="mr-2" />
                                    <Text className="text-lg font-JakartaSemiBold">{item.text}</Text>
                                </View>
                                <View className="pl-[32px]">
                                    <Text className="text-neutral-500 mt-2">{item.description}</Text>
                                </View>
                            </View>
                        ))}
                        </View>
                    </View>
                    )}
                {step === 4 && (
                    <View className="p-5">
                        <View className="relative w-full h-[250px]">
                            <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
                                Як звати вашого песика?
                            </Text>
                        </View>
                        <View className="px-2">
                        <InputField
                            label="Мого песика звати..."
                            placeholder="Байт"
                            icon={icons.person}
                            value={form.name}
                            onChangeText={(value) => setForm({ ...form, name: value })}
                        />
                        <Text className="text-neutral-400 mt-2">
                            Це ім'я буде видно іншим користувачам і його не можна буде змінити.
                        </Text>
                        </View>
                    </View>
                )}
                {step === 5 && (
                    <View className="p-5">
                    <View className="relative w-full h-[250px]">
                        <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
                            І {form.name} - це...
                        </Text>
                    </View>
                
                    <Text className="text-neutral-400 left-5 mt-2 mb-[84px]">
                        За біологічною інформацією в паспорті, не за гендероном.
                    </Text>
                
                    <View className="items-center"> 
                        <View className="flex-row justify-between mb-[84px]">
                            <View className="items-center">
                            <TouchableOpacity
                                onPress={() => setForm({ ...form, gender: 'male' })}
                                className="w-[93px] h-[93px] p-5 border rounded-lg justify-center items-center"
                                style={{
                                borderColor: form.gender === 'male' ? '#FF6C22' : '#9A9999',
                                backgroundColor: form.gender === 'male' ? '#FFE5D8' : 'transparent',
                                }}
                            >
                                <icons.MaleIcon 
                                width={37}
                                height={37}
                                color={form.gender === 'male' ? '#FF6C22' : '#9A9999'}
                                />
                            </TouchableOpacity>
                            <Text className="mt-2">Хлопчик</Text>
                            </View>

                            <View className="w-[53px]" />


                            <View className="items-center">
                            <TouchableOpacity
                                onPress={() => setForm({ ...form, gender: 'female' })}
                                className="w-[93px] h-[93px] p-5 border rounded-lg justify-center items-center"
                                style={{
                                borderColor: form.gender === 'female' ? '#FF6C22' : '#9A9999',
                                backgroundColor: form.gender === 'female' ? '#FFE5D8' : 'transparent',
                                }}
                            >
                                <icons.FemaleIcon
                                width={37}
                                height={37}
                                color={form.gender === 'female' ? '#FF6C22' : '#9A9999'}
                                />
                            </TouchableOpacity>
                            <Text className="mt-2">Дівчинка</Text>
                            </View>
                            </View>
                        </View>
                    </View>
                )}
                {step === 6 && (
                    <View className="p-5 mt-[183px] mb-[24px]">
                        <Text className="text-2xl text-black font-JakartaSemiBold">
                             {form.gender === 'male' ? `Коли ${form.name} народився?` : `Коли ${form.name} народилася?`}
                        </Text>
                        <View className="p-5"></View>
                        {renderDatePicker()}
                    </View>
                )}
            </ScrollView>

            {step === 1 && (
                <TouchableOpacity
                    onPress={onSignUpPress}
                    className="absolute bottom-[35px] left-0 right-0 mx-5 bg-[#FF6C22] rounded-full p-4 flex flex-row justify-center items-center"
                >
                    <Text className="text-white text-lg font-JakartaSemiBold">Продовжити</Text>
                    <View className="absolute right-[20px]">
                    <icons.ArrowRight
                        className="text-white" 
                        width={20} 
                        height={20}
                    />
                    </View>
                </TouchableOpacity>
            )}
            {step === 2 && (
                <TouchableOpacity
                    onPress={onPressVerify}
                    className="absolute bottom-[35px] left-0 right-0 mx-5 bg-[#FF6C22] rounded-full p-4 flex flex-row justify-center items-center"
                >
                    <Text className="text-white text-lg font-JakartaSemiBold">Продовжити</Text>
                    <View className="absolute right-[20px]">
                    <icons.ArrowRight
                        className="text-white" 
                        width={20} 
                        height={20}
                    />
                    </View>
                </TouchableOpacity>
            )}
            {step === 3 && (
                <TouchableOpacity
                    onPress={() => setStep(4)}
                    className="absolute bottom-[35px] left-0 right-0 mx-5 bg-[#FF6C22] rounded-full p-4 flex flex-row justify-center items-center"
                >
                    <Text className="text-white text-lg font-JakartaSemiBold">Продовжити</Text>
                    <View className="absolute right-[20px]">
                    <icons.ArrowRight
                        className="text-white" 
                        width={20} 
                        height={20}
                    />
                    </View>
                </TouchableOpacity>
            )}
            {step === 4 && (
                <TouchableOpacity
                    onPress={() => setStep(5)}
                    className="absolute bottom-[35px] left-0 right-0 mx-5 bg-[#FF6C22] rounded-full p-4 flex flex-row justify-center items-center"
                >
                    <Text className="text-white text-lg font-JakartaSemiBold">Продовжити</Text>
                    <View className="absolute right-[20px]">
                    <icons.ArrowRight
                        className="text-white" 
                        width={20} 
                        height={20}
                    />
                    </View>
                </TouchableOpacity>
            )}
            {step === 5 && (
                <TouchableOpacity
                onPress={() => setStep(6)}
                className="absolute bottom-[35px] left-0 right-0 mx-5 bg-[#FF6C22] rounded-full p-4 flex flex-row justify-center items-center"
            >
                <Text className="text-white text-lg font-JakartaSemiBold">Продовжити</Text>
                <View className="absolute right-[20px]">
                <icons.ArrowRight
                    className="text-white" 
                    width={20} 
                    height={20}
                />
                </View>
            </TouchableOpacity>
            )}
            {step === 6 && (
                <TouchableOpacity
                    onPress={onSubmitName}
                    className="absolute bottom-[35px] left-0 right-0 mx-5 bg-[#FF6C22] rounded-full p-4 flex flex-row justify-center items-center"
                >
                    <Text className="text-white text-lg font-JakartaSemiBold">Надіслати</Text>
                    <View className="absolute right-[20px]">
                    <icons.ArrowRight
                        className="text-white" 
                        width={20} 
                        height={20}
                    />
                    </View>
                </TouchableOpacity>
            )}
        </View>
    );
};

export default SignUp;
