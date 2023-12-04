import React, { memo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { trigger } from 'react-native-haptic-feedback';
import Sound from 'react-native-sound';

import IconDelete from 'react-native-vector-icons/Feather';
import IconUpperCase from 'react-native-vector-icons/Entypo';


const options = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
};

const contentIcon = {
    'Delete': <IconDelete name="delete" size={20} color="#000" />,
    '^': <IconUpperCase name="arrow-bold-up" size={20} color="#000" />,
}

var sound = new Sound('sound.mp3', Sound.MAIN_BUNDLE)

let intervalId, longPressId;

export const KeyButton = memo(({ value, upperCase, onPress }) => {
    const [showBlockByPress, setShowBlockByPress] = useState(false)
    const [showBlockByLongPress, setShowBlockByLongPress] = useState(false)
    const [globalOffsetLeft, setGlobalOffsetLeft] = useState(0)
    const [textComponentOffsetLeft, setTextComponentOffsetLeft] = useState({})

    const [activeSymbolIndex, setActiveSymbolIndex] = useState(0)

    const { key, moreSymbol, style, isException, exeptionStyle } = value

    const handleLayout = (event, index) => {
        const pageX = event.nativeEvent.layout.x
        const width = event.nativeEvent.layout.width
        const shiftAxisX = -7
        const endOffsetLeft = globalOffsetLeft + pageX + width + shiftAxisX

        if (index !== 0) {
            setTextComponentOffsetLeft((state) => ({
                ...state, [index]: { start: textComponentOffsetLeft[index - 1].end, end: endOffsetLeft }
            }))
        } else {
            setTextComponentOffsetLeft((state) => ({
                ...state, [index]: { start: 0, end: endOffsetLeft }
            }))
        }
    }

    const renderKeySymbols = () => {
        return symbolValues.map((value, index) => {
            if (!showBlockByLongPress && index > 0) return
            return (
                <View
                    key={index}
                    style={[styles.textBlock, index === activeSymbolIndex && showBlockByLongPress ? { color: "#fff", backgroundColor: "#017afe", borderRadius: 5, paddingBottom: 3 } : {}]}
                    onLayout={(event) => handleLayout(event, index)}
                >
                    <Text
                        style={[{ fontSize: 24 }, index === activeSymbolIndex && showBlockByLongPress ? { color: "#fff" } : { color: "black" }]}
                    >
                        {value}
                    </Text>
                </View>
            )
        })
    }

    const touchStartHandler = () => {
        if (!isException) {
            setShowBlockByPress(true)
            sound.play()
        }

        trigger("impactMedium", options)

        longPressId = setTimeout(() => {
            if (key === 'Delete') {
                intervalId = setInterval(() => {
                    onPress(symbol)
                }, 120)
            }

            if (!isException) {
                setShowBlockByLongPress(true)
            }
        }, 500)
    }

    const touchCancel = () => {
        setShowBlockByPress(false)
        setShowBlockByLongPress(false)
        setActiveSymbolIndex(0)
        clearInterval(longPressId)
        clearInterval(intervalId)
    }

    const touchEnd = () => {
        clearInterval(longPressId)
        clearInterval(intervalId)
        onPress(symbolValues[activeSymbolIndex])
        setShowBlockByPress(false)
        setShowBlockByLongPress(false)
        setActiveSymbolIndex(0)
    }

    const touchMoveHandler = (event) => {
        const pageX = event.nativeEvent.pageX
        Object.entries(textComponentOffsetLeft).forEach(([index, { start, end }]) => {
            if (pageX >= start && pageX < end && activeSymbolIndex !== +index) {
                setActiveSymbolIndex(+index)
            }
        })
    }

    const symbol = (upperCase && !isException) ? key.toUpperCase() : key.toLowerCase()
    const symbolValues = [symbol, ...moreSymbol.map((value) => (upperCase && !isException) ? value.toUpperCase() : value.toLowerCase())]

    return (
        <View
            onLayout={(event) => {
                setGlobalOffsetLeft(event.nativeEvent.layout.x)
            }}
            style={[
                styles.key,
                styles[style],
                exeptionStyle,
                showBlockByPress &&
                {
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0
                }
            ]}
            onTouchStart={touchStartHandler}
            onTouchMove={touchMoveHandler}
            onTouchCancel={touchCancel}
            onTouchEnd={touchEnd}
        >
            {showBlockByPress && (
                <>
                    <View style={styles.pressBlock}>
                        {renderKeySymbols()}
                    </View>
                    <View style={styles.divider}></View>
                </>
            )}
            <Text
                style={[
                    styles.textButton,
                    key === '123' ||
                        key === 'space' ||
                        key === 'return' ?
                        {
                            fontSize: 16,
                            fontWeight: 400
                        } : null
                ]}
            >
                {
                    showBlockByPress || contentIcon[key] || symbol
                }
            </Text>
        </View>
    );
});

const styles = StyleSheet.create({
    key: {
        position: 'relative',
        height: 42,
        zIndex: 1,
        minWidth: 25,
        marginHorizontal: 3,
        marginVertical: 6,
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 2
    },
    textButton: {
        textAlign: 'center',
        color: '#0b0b0c',
        fontSize: 24,
        fontWeight: 300
    },
    keyException: {
        flexGrow: 1,
        flexShrink: 0,
        backgroundColor: '#aeb3be',
    },
    keyCommon: {
        flexShrink: 1,
        flexGrow: 0,
        width: 33,
        backgroundColor: '#fff',
    },
    pressBlock: {
        position: 'absolute',
        bottom: 45,
        left: -7,
        alignItems: 'center',
        flexDirection: 'row',
        height: 45,
        minWidth: 'auto',
        backgroundColor: 'rgba(255, 255, 255, .95)',
        borderRadius: 5,
        padding: 5,
    },
    textBlock: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        marginHorizontal: 3,
    },
    divider: {
        position: 'absolute',
        bottom: '100%',
        left: 0,
        backgroundColor: "rgba(255, 255, 255, .95)",
        height: 6,
        width: '100%'
    }
});