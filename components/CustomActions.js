import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import firebase from 'firebase';
import firestore from 'firebase';
import * as ImagePicker from 'expo-image-picker';
import * as Location from "expo-location";
import * as Camera from "expo-camera";

export default class CustomActions extends React.Component {

  /**
   * Let the user pick an image from the device's image library
   * @function imagePicker
   * @async
   */
  async imagePicker() {
    // expo permission
    const { status } = await Camera.requestPermissionsAsync();
    try {
      if (status === "granted") {
        // pick image
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images, // only images are allowed
        }).catch((error) => console.log(error));
        // canceled process
        if (!result.cancelled) {
          const imageUrl = await this.uploadImageFetch(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * Let the user take a photo with device's camera
   * @function takePhoto
   * @async
   */
  async takePhoto() {
    const { status } = await Camera.requestPermissionsAsync();
    try {
      if (status === "granted") {
        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        }).catch((error) => console.log(error));

        if (!result.cancelled) {
          const imageUrl = await this.uploadImageFetch(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * get the location of the user by using GPS
   * @function getLocation
   * @async
   */
  async getLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const result = await Location.getCurrentPositionAsync(
          { accuracy: Location.Accuracy.High }
        ).catch((error) => console.log(error));
        // const longitude = JSON.stringify(result.coords.longitude);
        // const altitude = JSON.stringify(result.coords.latitude);
        if (result) {
          this.props.onSend({
            location: {
              longitude: result.coords.longitude,
              latitude: result.coords.latitude,
            },
          });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * Upload images to firebase
   * @function uploadImageFetch
   * @async
   */
  async uploadImageFetch(uri) {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const imageNameBefore = uri.split("/");
    const imageName = imageNameBefore[imageNameBefore.length - 1];

    const ref = firebase.storage().ref().child(`images/${imageName}`);

    const snapshot = await ref.put(blob);

    // blob.close(); // does not work!

    return await snapshot.ref.getDownloadURL();
  }

  /**
   * function that handles communication features
   * @function onActionPress
   */
  onActionPress = () => {
    const options = [
      "Choose From Library",
      "Take Picture",
      "Send Location",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            console.log("user wants to pick an image");
            return this.imagePicker();
          case 1:
            console.log("user wants to take a photo");
            return this.takePhoto();
          case 2:
            console.log("user wants to get their location");
            return this.getLocation();
        }
      }
    );
  }

  render() {
    return (
      <TouchableOpacity
        accessible={true}
        accessibilityLabel="More options"
        accessibilityHint="Let’s you choose to send an image or your geolocation."
        style={[styles.container]}
        onPress={this.onActionPress}
      >
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
});

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};