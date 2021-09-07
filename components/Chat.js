import React from 'react';
import { View, KeyboardAvoidingView, Platform, LogBox } from 'react-native';
import { GiftedChat, InputToolbar } from 'react-native-gifted-chat'
import firebase from 'firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import MapView from 'react-native-maps';
import CustomActions from './CustomActions';

const firebaseConfig = {
  apiKey: "AIzaSyAcLUfQmtcWoVQkOKCm7_h9sjDEKBXQKVc",
  authDomain: "chat-app-9ed2f.firebaseapp.com",
  projectId: "chat-app-9ed2f",
  storageBucket: "chat-app-9ed2f.appspot.com",
  messagingSenderId: "849583700132"
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const referenceChatMessages = firebase.firestore().collection('messages');

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      uid: null,
      messages: [],
      isConnected: false
    }
  }

  componentDidMount() {
    LogBox.ignoreLogs(['Animated: `useNativeDriver`', 'Setting a timer/', 'Animated.event now requires a second argument']);

    let name = this.props.route.params.name;
    // Checks is user is online/offline
    NetInfo.fetch().then(connection => {
      this.setState({
        isConnected: connection.isConnected
      });

      if (connection.isConnected) {
        this.props.navigation.setOptions({ title: name });
        this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
          if (!user) {
            await firebase.auth().signInAnonymously();
          } else {
            //update user state with currently active user data
            this.setState({
              uid: user.uid,
              messages: []
            });

            await AsyncStorage.setItem('uid', JSON.stringify(user.uid));
            // listen for collection changes for current user
            this.unsubscribe = referenceChatMessages
              .orderBy("createdAt", "desc")
              .onSnapshot(this.onCollectionUpdate);
          }
        });
      } else {
        this.props.navigation.setOptions({ title: name + " - Offline" });
        this.getMessages();
      }
    });
  }

  async getMessages() {
    let uid = '';
    let messages = '';
    try {
      uid = await AsyncStorage.getItem('uid') || [];
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        uid: JSON.parse(uid),
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  }

  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }

  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('uid');
      await AsyncStorage.removeItem('messages');
      this.setState({
        uid: null,
        messages: []
      })
    } catch (error) {
      console.log(error.message);
    }
  }

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      var message = doc.data();
      messages.push({
        _id: message._id,
        text: message.text || "",
        createdAt: message.createdAt.toDate(),
        user: message.user,
        image: message.image || null,
        location: message.location || null
      });
    });
    this.setState({
      messages
    });
    this.saveMessages();
  }

  componentDidUpdate() {
    let name = this.props.route.params.name;
    if (this.state.isConnected === true) {
      this.props.navigation.setOptions({ title: name });
    } else {
      this.props.navigation.setOptions({ title: name + " - Offline" });
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
    //stop listening to authentication
    this.authUnsubscribe();
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }), () => {
      this.saveMessages();
    });

    this.addMessage(messages[0]);
  }

  addMessage(message) {
    referenceChatMessages.add({
      _id: message._id,
      text: message.text || "",
      createdAt: message.createdAt,
      user: message.user,
      image: message.image || null,
      location: message.location || null
    });
  }

  //If offline, dont render the input toolbar
  renderInputToolbar(props) {
    if (this.state.isConnected === true) {
      return (
        <InputToolbar
          {...props}
        />
      );
    }
  }

  renderCustomActions(props) {
    return <CustomActions {...props} />;
  }

  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{
            width: 150,
            height: 100,
            borderRadius: 13,
            margin: 3
          }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: this.props.route.params.backgroundColor }}>
        <GiftedChat
          messages={this.state.messages}
          renderUsernameOnMessage={true}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
          renderActions={this.renderCustomActions}
          renderCustomView={this.renderCustomView}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: this.state.uid,
            name: this.props.route.params.name
          }}
        />
        {Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null}
      </View>
    )
  };
}
