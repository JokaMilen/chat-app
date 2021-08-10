import React from 'react';
import { View, Button, StyleSheet } from 'react-native';


export default class Chat extends React.Component {

  componentDidMount() {
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });
  }

  componentDidUpdate() {
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });
  }

  render() {
    return (
      <View style={[styles.container, { backgroundColor: this.props.route.params.backgroundColor }]}>
        <Button
          title="Go to start"
          onPress={() => this.props.navigation.navigate("Start")}
        />
      </View>
    )
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});