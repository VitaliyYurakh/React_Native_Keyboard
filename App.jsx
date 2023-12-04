import React from 'react';
import { useState, useRef, useCallback } from 'react'
import { View, TextInput, TouchableWithoutFeedback, Platform, Keyboard, Text, StyleSheet } from 'react-native'

import { CustomKeyboard } from './components/CustomKeyboard'

import SelectDropdown from 'react-native-select-dropdown'

const App = () => {

    const [textValue, setTextValue] = useState('')
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const [keyboardVisible, setKeyboardVisible] = useState(false)
    const [languageKeyboard, setLanguageKeyboard] = useState('en')

    const inputRef = useRef(null);

    const handlePress = useCallback(() => {
        Keyboard.dismiss();
        setKeyboardVisible(false)
    })

    const handleSelectionChange = useCallback((event) => {
        setSelection(event.nativeEvent.selection);
    })

    return (
        <>
            <TouchableWithoutFeedback onPress={handlePress}>
                <View style={styles.container}>
                    <View style={styles.textInputWrap}>
                        <TextInput
                            ref={inputRef}
                            multiline
                            autoCorrect={false}
                            spellCheck={false}
                            showSoftInputOnFocus={false}
                            keyboardType={undefined}
                            onFocus={() => setKeyboardVisible(true)}
                            onSelectionChange={handleSelectionChange}
                            selection={Platform.OS === 'android' ? selection : undefined}
                            style={styles.textInput}
                            value={textValue}
                            onChangeText={(value) => setTextValue(value)}
                        />
                    </View>
                    <View style={styles.selectWrap}>
                        <Text>Change keyboard lang:</Text>
                        <SelectDropdown
                            defaultValue={languageKeyboard}
                            data={['en', 'uk']}
                            onSelect={selectItem => {
                                setLanguageKeyboard(selectItem)
                            }}
                            buttonStyle={styles.dropdown3BtnStyle}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
            <CustomKeyboard
                textValue={textValue}
                setSelection={setSelection}
                setTextValue={setTextValue}
                inputRef={inputRef}
                keyboardVisible={keyboardVisible}
                languageKeyboard={languageKeyboard}
            />
        </>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        padding: 5
    },
    textInput: {
        height: 100,
        borderColor: '#3949ab',
        borderWidth: 1,
        padding: 5,
        textAlignVertical: 'top',
        fontSize: 18,
    },
    textInputWrap: {
        position: 'relative'
    },
    selectWrap: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    dropdown3BtnStyle: {
        backgroundColor: '#c0c0c0'
    },
});

export default App;
