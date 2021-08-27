import React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, InputToolbar } from 'react-native-gifted-chat'
import firebase from 'firebase';
import firestore from 'firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

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
    let name = this.props.route.params.name;

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
            this.setState({
              uid: user.uid,
              messages: []
            });

            await AsyncStorage.setItem('uid', JSON.stringify(user.uid));

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
      var message = doc.data();
      messages.push({
        _id: message._id,
        text: message.text,
        createdAt: message.createdAt.toDate(),
        user: message.user
      });
    });
    this.setState({
      messages
    });
    this.saveMessages();
  };

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

  addMessage = (message) => {
    referenceChatMessages.add({
      _id: message._id,
      text: message.text,
      createdAt: message.createdAt,
      user: message.user
    });
  };

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

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: this.props.route.params.backgroundColor }}>
        <GiftedChat
          messages={this.state.messages}
          renderUsernameOnMessage={true}
          renderInputToolbar={this.renderInputToolbar.bind(this)}
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
