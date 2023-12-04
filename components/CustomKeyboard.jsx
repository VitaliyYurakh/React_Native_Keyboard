import React, { useCallback, useEffect, useRef, useState, memo } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";

import { KeyButton } from "./KeyButton";

import { keys } from "../helpers/constants";

import DeviceInfo from 'react-native-device-info';

const isOldModelIphone = () => {
    if (Platform.OS === 'ios') {
        const oldVersion = ['7', '8', 'SE']
        const model = DeviceInfo.getModel()

        const isOldVersion = oldVersion.some(dev => model.includes(dev))

        return isOldVersion
    }
}

export const CustomKeyboard = memo(({
    textValue,
    setSelection,
    setTextValue,
    inputRef,
    languageKeyboard,
    keyboardVisible
}) => {


    const [upperCase, setUpperCase] = useState(false);

    const slideAnim = useRef(new Animated.Value(150)).current; // 

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: keyboardVisible ? 0 : -400,
            duration: 150,
            easing: Easing.ease,
            useNativeDriver: false,
        }).start();
    }, [keyboardVisible, slideAnim]);

    const onPressKey = useCallback(
        (key) => {
            setSelection((prevSelection) => {
                setTextValue(
                    (prevVal) =>
                        `${prevVal.slice(0, prevSelection.start)}${key}${prevVal.slice(
                            prevSelection.start
                        )}`
                );
                return { start: prevSelection.start + 1, end: prevSelection.start + 1 };
            });
        },
        [setSelection, setTextValue]
    );

    const onPressSpace = useCallback(() => {
        setSelection((prevSelection) => {
            setTextValue(
                (prevVal) =>
                    `${prevVal.slice(0, prevSelection.start)} ${prevVal.slice(
                        prevSelection.start
                    )}`
            );
            return { start: prevSelection.start + 1, end: prevSelection.start + 1 };
        });

    }, [setSelection, setTextValue]);

    const onPressDelete = useCallback(() => {
        setSelection((prevSelection) => {
            if (prevSelection.end !== 0) {
                if (prevSelection.start < 0) return

                if (prevSelection.start !== prevSelection.end) {
                    setTextValue(
                        (prevVal) =>
                            `${prevVal.slice(0, prevSelection.start)}${prevVal.slice(
                                prevSelection.end,
                                prevVal.length
                            )}`
                    );
                    if (Platform.OS === "ios") {
                        inputRef.current.setNativeProps({
                            selection: { start: prevSelection.end, end: prevSelection.end },
                        });
                    }
                    return { start: prevSelection.start, end: prevSelection.start };
                } else {
                    setTextValue(
                        (prevVal) =>
                            `${prevVal.slice(0, prevSelection.start - 1)}${prevVal.slice(
                                prevSelection.start
                            )}`
                    );
                    return {
                        start: Math.max(prevSelection.start - 1, 0),
                        end: Math.max(prevSelection.start - 1, 0),
                    };
                }
            } else {
                return prevSelection;
            }
        });
    }, [inputRef, setSelection, setTextValue]);

    const onPressUppercase = useCallback(() => {
        setUpperCase((prevVal) => !prevVal);
    }, []);

    const onPress = useCallback(
        (key) => {
            switch (key) {
                case "space":
                    return onPressSpace();
                case "delete":
                    return onPressDelete();
                case "^":
                    return onPressUppercase();
                case "return":
                    return onPressKey('\n')
                default:
                    return onPressKey(key);
            }
        },
        [onPressDelete, onPressKey, onPressSpace, onPressUppercase]
    );

    return (
        <Animated.View
            style={[
                styles.keyboard,
                {
                    bottom: slideAnim,
                },
                isOldModelIphone() ? {
                    height: 257,
                } :
                    {
                        height: 313,
                        paddingBottom: 56
                    }
            ]}
        >
            {keys[languageKeyboard].map((row, rowIndex) => {
                return (
                    <View key={rowIndex} style={styles.row}>
                        {row.map((key, index) => (
                            <KeyButton
                                onPress={onPress}
                                upperCase={upperCase}
                                value={key}
                                key={`key_${index}`}
                            />
                        ))}
                    </View>
                );
            })}
        </Animated.View>
    );
})

const styles = StyleSheet.create({
    keyboard: {
        position: 'absolute',
        bottom: -400,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        backgroundColor: "#d1d4d9",
        paddingTop: 6,
    },
    row: {
        paddingHorizontal: 3,
        width: '100%',
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-end",
    },
});
