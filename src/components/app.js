import React, { Component } from 'react';
import {
    StyleSheet, View, Text, TextInput, Dimensions, TouchableOpacity
} from 'react-native';
import MapView from 'react-native-maps';
import Polyline from '@mapbox/polyline';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const URL = "https://maps.googleapis.com/maps/api/directions/json?";
const MapAPIKey = "your Google Maps Directions API key";
const PlaceAPIKey = "your Google Places API key";

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
            let resp = await fetch(`${URL}origin=${originLoc}&destination=${destinationLoc}&key=${MapAPIKey}`);
            let respJson = await resp.json();
            if (respJson.status != "OK") return;
            let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
            let coords = points.map((point, index) => {
                return {
                    latitude: point[0],
                    longitude: point[1]
                }
            })
            this.setState({ coords });
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
                title: `Your marker in ${position.x},${position.y}`
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
    renderDestinationMarker(coords) {
        if (coords[0] === undefined) return;
        if (coords.length > 0) {
            var latLng = coords[coords.length - 1];
            return (
                <MapView.Marker
                    coordinate={latLng}
                    title={"your destination location."}
                />
            );
        }
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
    onSearch(place_id) {
        const { initialPosition } = this.state;
        if (initialPosition === null) return;
        let originLat = initialPosition.latLng.latitude;
        let orginLng = initialPosition.latLng.longitude;
        this.getDirections(`${originLat},${orginLng}`, `place_id:${place_id}`);
    }
    render() {
        const { region, markers, initialPosition, coords } = this.state;
        const { container, wrapMap, wrapButton, titleStyle, autocompleteContainer } = styles;
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
                <View style={autocompleteContainer}>
                    <GooglePlacesAutocomplete
                        placeholder='Where do you go?'
                        minLength={2}
                        autoFocus={false}
                        returnKeyType={'search'}
                        listViewDisplayed='auto'
                        fetchDetails={false}
                        renderDescription={(row) => row.description}
                        onPress={(data = null, details = null) => {
                            if (data != null) {
                                this.onSearch(data.place_id);
                            }
                        }}
                        getDefaultValue={() => {
                            return ''; // text input default value
                        }}
                        query={{
                            key: `${PlaceAPIKey}`,
                            language: 'en', // language of the results
                        }}
                        styles={{
                            textInputContainer: {
                                height: 45,
                                width: width - 14,
                                marginLeft: 7,
                                marginBottom: 0,
                                backgroundColor: 'rgba(0,0,0,0)',
                                borderTopWidth: 0,
                                borderBottomWidth: 0
                            },
                            textInput: {
                                marginLeft: 0,
                                marginRight: 0,
                                height: 38,
                                color: '#5d5d5d',
                                fontSize: 16
                            },
                            predefinedPlacesDescription: {
                                color: '#1faadb'
                            },
                            listView: {
                                width: width - 14,
                                marginLeft: 7,
                                backgroundColor: '#FAFAFA'
                            }
                        }}
                        debounce={200}
                    />
                </View>
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
                    {this.renderDestinationMarker(coords)}
                </MapView>
                <TouchableOpacity style={wrapButton} onPress={this.onPress.bind(this)}>
                    <Text style={titleStyle}>Let's go!</Text>
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
    autocompleteContainer: {
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1
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
    titleStyle: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'Avenir'
    }
})