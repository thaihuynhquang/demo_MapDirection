import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Dimensions
} from 'react-native';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            latitude: 0,
            longitude: 0,
        };
    }
    render() {
        const { container, wrapInput, wrapMap } = styles;
        return (
            <View style={container}>
                <TextInput
                    style={wrapInput}
                    underlineColorAndroid='transparent'
                    placeholder="Kinh độ"
                />
                <TextInput
                    style={wrapInput}
                    underlineColorAndroid='transparent'
                    placeholder="Vĩ độ"
                />
                <View style={wrapMap}></View>
            </View>
        )
    }
}
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        padding: 10
    },
    wrapInput: {
        flex: 1,
        width: width - 10,
        backgroundColor: '#FFF',
        paddingLeft: 10,
        marginBottom: 10,
    },
    wrapMap: {
        flex: 10,
        width: width - 10,
        backgroundColor: '#E0F6FF',
    }
})