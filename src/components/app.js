import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Dimensions, TouchableOpacity
} from 'react-native';
import MapView from 'react-native-maps';
import Polyline from '@mapbox/polyline';

const URL = "https://maps.googleapis.com/maps/api/directions/json?";
const APIKey = "AIzaSyCUe40uGa-K0XGKgj70EgEJOvukiz3Rc24";

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
            markers: [],
            coords: []
        };
        this.newMarkers = [];
    }
    componentDidMount() {
        this.getCurrentLocation();
    }
    getCurrentLocation() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let initialPosition = {
                    id: position.timestamp,
                    latLng: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    },
                    title: "your current location."
                };
                let region = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                };
                this.setState({ initialPosition, region });
            },
            (error) => console.log(`Error: ${error}`),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
    }
    async getDirections(originLoc, destinationLoc) {
        try {
            let resp = await fetch(`${URL}origin=${originLoc}&destination=${destinationLoc}&key=${APIKey}`);
            let respJson = await resp.json();
            if(respJson.status != "OK") return;
            let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
            let coords = points.map((point, index) => {
                return {
                    latitude: point[0],
                    longitude: point[1]
                }
            })
            this.setState({ coords });
            return coords
        } catch (error) {
            console.log(`Error: ${error}`);
        }
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
    onPress() {
        const { initialPosition, markers } = this.state;
        if (initialPosition === null || markers[0] === undefined) return;
        let originLat = initialPosition.latLng.latitude;
        let orginLng = initialPosition.latLng.longitude;
        let destinationLat = markers[0].latLng.latitude;
        let destinationLng = markers[0].latLng.longitude;
        this.getDirections(`${originLat},${orginLng}`, `${destinationLat},${destinationLng}`);
    }
    render() {
        const { region, markers, initialPosition, coords } = this.state;
        const { container, wrapInput, wrapMap, wrapButton, wrapText } = styles;
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
                pinColor='#FFC107'
            />
        ) : null;
        return (
            <View style={container}>
                <MapView
                    style={wrapMap}
                    region={region}
                    onPress={this.addMarker.bind(this)}
                >
                    {initMarkerJSX}
                    {MarkersJSX}
                    <MapView.Polyline
                        coordinates={coords}
                        strokeWidth={2}
                        strokeColor="red"
                    />
                </MapView>
                <TouchableOpacity style={wrapButton} onPress={this.onPress.bind(this)}>
                    <Text style={wrapText}>Direction</Text>
                </TouchableOpacity>
            </View>

        )
    }
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    wrapInput: {
        flex: 1,
        width: width - 10,
        backgroundColor: '#FFF',
        paddingLeft: 10,
        marginBottom: 10,
    },
    wrapMap: {
        flex: 11,
        width: width
    },
    wrapButton: {
        flex: 1,
        width: width,
        backgroundColor: '#2ABB9C',
        borderRadius: 2,
        alignItems: 'center',
        justifyContent: 'center'
    },
    wrapText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'Avenir'
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