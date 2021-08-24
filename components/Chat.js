import React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat'
import firebase from 'firebase';
import firestore from 'firebase';

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
      messages: []
    }
  }

  componentDidMount() {
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });

    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        await firebase.auth().signInAnonymously();
      } else {
        this.setState({
          uid: user.uid,
          messages: []
        });

        this.unsubscribe = referenceChatMessages
          .orderBy("createdAt", "desc")
          .onSnapshot(this.onCollectionUpdate);
      }
    });
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
  };

  componentDidUpdate() {
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({ title: name });
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.authUnsubscribe();
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))

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

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: this.props.route.params.backgroundColor }}>
        <GiftedChat
          messages={this.state.messages}
          renderUsernameOnMessage={true}
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
