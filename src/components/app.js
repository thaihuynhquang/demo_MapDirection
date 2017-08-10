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
            initialPosition: null,
            markers: []
        };
        this.newMarkers = [];
    }
    componentDidMount() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    initialPosition: {
                        id: position.timestamp,
                        latLng: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        },
                        title: "your current location."
                    },
                    region: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01
                    }
                });
            },
            (error) => console.log(`Error: ${error}`),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    }
    addMarker(data) {
        const { position, coordinate } = data.nativeEvent;
        this.newMarkers.push(
            {
                id: coordinate.latitude + position.x,
                latLng: coordinate,
                title: `Marker in ${position.x} and ${position.y}`
            }
        );
        this.setState({
            markers: this.newMarkers,
            region: {
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01
            }
        });
    }
    render() {
        const { region, markers, initialPosition } = this.state;
        const { container, wrapInput, wrapMap } = styles;
        const MarkersJSX = markers.map(marker => (
            <MapView.Marker
                key={marker.id}
                coordinate={marker.latLng}
                title={marker.title}
            />
        ));
        const initMarkerJSX = initialPosition != null ? (
            <MapView.Marker
                key={initialPosition.id}
                coordinate={initialPosition.latLng}
                title={initialPosition.title}
            />
        ) : null;
        return (
            <MapView
                style={{ flex: 1 }}
                region={region}
                onPress={this.addMarker.bind(this)}
            >
                {initMarkerJSX}
                {MarkersJSX}
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