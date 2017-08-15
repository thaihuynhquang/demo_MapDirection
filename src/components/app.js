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
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const homePlace = { description: 'Home', geometry: { location: { lat: 10.8154831, lng: 106.7650663 } } };
const workPlace = { description: 'Work', geometry: { location: { lat: 10.755639, lng: 106.1347037 } } };

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
            console.log("***********");
            console.log(respJson);
            if (respJson.status != "OK") return;
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
        const { container, wrapInput, wrapMap, wrapButton, titleStyle, autocompleteContainer } = styles;
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
                        placeholder='Search'
                        minLength={2}
                        autoFocus={false}
                        returnKeyType={'search'}
                        listViewDisplayed='auto'
                        fetchDetails={false}
                        renderDescription={(row) => row.description}
                        onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                            console.log(data);
                        }}
                        getDefaultValue={() => {
                            return ''; // text input default value
                        }}
                        query={{
                            key: 'AIzaSyDWCxpoQ3SXJG35Yguq0Lz2R7e_Htv4ZnE',
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
                </MapView>
                <TouchableOpacity style={wrapButton} onPress={this.onPress.bind(this)}>
                    <Text style={titleStyle}>Direction</Text>
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
    titleStyle: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'Avenir'
    }
})

/**
 * let place = 'place_id:EjND4bqndSBS4bqhY2ggQ2hp4bq_YywgQW4gUGjDuiwgSG8gQ2hpIE1pbmgsIFZpZXRuYW0';
        this.getDirections(`${originLat},${orginLng}`, `${place}`);
                    
 */