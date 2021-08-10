import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ImageBackground, StyleSheet } from 'react-native';

const chatBackgroundColors = ["#090C08", "#474056", "#8A95A5", "#B9C6AE"];

export default class Start extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      text: '',
      selectedColorIndex: 0
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <ImageBackground source={require('../assets/Background-Image.png')} style={styles.background} imageStyle={styles.backgroundImage}>
          <View style={styles.titleBox}>
            <Text style={styles.title}>Chat App</Text>
          </View>
          <View style={styles.contentBox}>
            <TextInput
              style={styles.textInput}
              onChangeText={(text) => this.setState({ text })}
              value={this.state.text}
              placeholder='Your Name'
            />
            <View style={styles.colorSelectBox}>
              <Text style={styles.colorSelectText}>Choose Background Color</Text>
              <View style={styles.colorBox}>
                {chatBackgroundColors.map((color, index) => (
                  <TouchableOpacity
                    key={"color" + index}
                    style={[
                      dynamicStyles.circleStyle(color),
                      index === this.state.selectedColorIndex ? dynamicStyles.borderSelected(color) : null,
                    ]}
                    activeOpacity={0.5}
                    onPress={() => this.setState({ selectedColorIndex: index })}
                  />
                ))}
              </View>
            </View>
            <TouchableOpacity
              style={styles.chatButton}
              onPress={() => this.props.navigation.navigate('Chat', { name: this.state.text, backgroundColor: chatBackgroundColors[this.state.selectedColorIndex] })}
            >
              <Text style={styles.chatButtonText}>Start Chatting</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    )
  }
}

const dynamicStyles = {

  circleStyle: (color) => ({
    backgroundColor: color,
    width: 40,
    height: 40,
    borderRadius: 40 / 2,
    marginRight: 10,
  }),
  borderSelected: (color) => ({
    borderWidth: 5,
    borderColor: "#FFF",
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5
  })

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  background: {
    width: "100%",
    height: "100%",
    justifyContent: "space-around",
    alignItems: "center"
  },
  backgroundImage: {
    resizeMode: "cover"
  },
  titleBox: {
    justifyContent: "center",
    alignItems: "center",
    height: 50,
    width: "88%"
  },
  title: {
    fontSize: 45,
    fontWeight: "600",
    color: "#FFFFFF"
  },
  contentBox: {
    justifyContent: "space-around",
    alignItems: "center",
    height: "44%",
    width: "88%",
    backgroundColor: "white"
  },
  textInput: {
    height: 40,
    width: "88%",
    borderColor: "#757083",
    borderWidth: 2,
    color: "#757083",
    padding: 5
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF"
  },
  chatButton: {
    backgroundColor: "#757083",
    height: 40,
    width: "88%",
    alignItems: "center",
    justifyContent: "center"
  },
  colorBox: {
    flexDirection: "row",
    marginTop: 5
  },
  colorSelectBox: {
    flexDirection: "column",
    justifyContent: "space-around",
    width: "88%"
  },
  colorSelectText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#757083"
  }
});