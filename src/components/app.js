import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Dimensions
} from 'react-native';
import MapView from 'react-native-maps';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            region: {
                latitude: 10.8134343,
                longitude: 106.7547736,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            },
        };
    }
    render() {
        const { region } = this.state;
        const { container, wrapInput, wrapMap } = styles;
        return (
            <MapView
                style={{ flex: 1 }}
                region={region}
            >
            </MapView>
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
        width: width - 10
    }
})

/**
 * <View style={container}>
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
                <MapView
                    style={wrapMap}
                    region={region}
                >
                </MapView>
            </View>
 */