import { KeyboardAvoidingView, TouchableWithoutFeedback, View, Text, Image, TextInput } from "react-native";
import { useState } from "react";

const InputField = ({ 
    label, 
    labelStyle, 
    icon, 
    secureTextEntry = false, 
    containerStyle, 
    inputStyle, 
    iconStyle, 
    ...props 
}) => {
    const [isFocused, setIsFocused] = useState(false); // Додаємо стан для фокусу

    return (
        <KeyboardAvoidingView>
            <TouchableWithoutFeedback>
                <View className="my-2 w-full">
                    <Text className={`text-lg font-JakartaSemiBold mb-3 ${labelStyle}`}>
                        {label}
                    </Text>
                    <View className={`flex flex-row justify-start items-center relative bg-neutral-100 rounded-md border ${isFocused ? 'border-black border-2' : 'border-neutral-100'} ${containerStyle}`}>
                        {icon && (
                            <Image source={icon} className={`w-6 h-6 ml-4 ${iconStyle}`} />
                        )}
                        <TextInput
                            className={`rounded-md p-4 font-JakartaSemiBold text-[15px] flex-1 ${inputStyle} text-left`}
                            secureTextEntry={secureTextEntry}
                            onFocus={() => setIsFocused(true)}  // Встановлюємо фокус
                            onBlur={() => setIsFocused(false)}  // Скидаємо фокус
                            selectionColor="black"  // Задаємо чорний колір курсора
                            style={{ fontWeight: 'bold' }} // Робимо текст жирним
                            {...props}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default InputField;
