import React from 'react';
import { Text, View, Image, Modal, TextInput, Alert, StyleSheet } from 'react-native';
import firebase from 'react-native-firebase';
import {Button} from 'react-native-elements';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class Settings extends React.Component {
   constructor(props) {
   super(props);
   this.state = {
      currentPassword: '',
      newPassword: '',
      repeatPassword: '',
      modalVisible: false,
    };
   }

   handleLogout = () => {
     firebase.auth().signOut();
   }

   showModal = () => {
     this.setState({
       modalVisible: true
     })
   }

   hideModal = () => {
     this.setState({
       modalVisible: false,
       currentPassword: '',
       newPassword: '',
       repeatPassword: '',
     })
   }


  reauthenticate = (currentPassword) => {
    let user = firebase.auth().currentUser;
    let cred = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
    return user.reauthenticateWithCredential(cred);
  }


  onChangePasswordPress = () => {
    if (this.state.newPassword === this.state.repeatPassword) {
      this.reauthenticate(this.state.currentPassword).then(() => {
        let user = firebase.auth().currentUser;
        user.updatePassword(this.state.newPassword).then(() => {
          Alert.alert('Password changed successfully');
        }).catch((error) => { Alert.alert(error.message); });
      }).catch((error) => { Alert.alert(error.message) });
    } else {
      Alert.alert('Type new password again');
    }

  }


   render(){
     return (
       <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
       <Image
           style={{width: 300, height: 300}}
           source={require('../img/mon.png')}
         />
        <Button type='solid' containerStyle={{width: '90%', alignSelf: 'center'}} buttonStyle={{backgroundColor: 'rgb(245, 71, 71)', marginBottom: 15, marginTop: 15}} title='Change Password' onPress={this.showModal} containerStyle={{width: '90%', marginTop: 30}} buttonStyle={{backgroundColor: 'rgb(245, 71, 71)'}}/>
        <Button type='solid' containerStyle={{width: '90%', alignSelf: 'center'}} buttonStyle={{backgroundColor: 'rgb(245, 71, 71)'}} title='LOG OUT' onPress={this.handleLogout} containerStyle={{width: '90%', marginTop: 30}} buttonStyle={{backgroundColor: 'rgb(245, 71, 71)'}}/>


        <Modal transparent={true} visible={this.state.modalVisible} >
          <View style={styles.modalView}>

            <TextInput style={styles.textInput} value={this.state.currentPassword}
            placeholder='Type current password' autoCapitalize='none' secureTextEntry={true}
            onChangeText={(text) => { this.setState({currentPassword: text}) }}
            />

            <TextInput style={styles.textInput} value={this.state.newPassword}
            placeholder='Type new Password' autoCapitalize='none' secureTextEntry={true}
            onChangeText={(text) => { this.setState({newPassword: text}) }}
            />

            <TextInput style={styles.textInput} value={this.state.repetPassword}
            placeholder='Retype new Password' autoCapitalize='none' secureTextEntry={true}
            onChangeText={(text) => { this.setState({repeatPassword: text}) }}
            />

            <Button title='Change Password' type='solid' containerStyle={{width: '90%', alignSelf: 'center'}} buttonStyle={{backgroundColor: 'rgb(245, 71, 71)', marginBottom: 15, marginTop: 15}} onPress={this.onChangePasswordPress} />
            <Button title='Cancel' containerStyle={{width: '90%', alignSelf: 'center'}} buttonStyle={{backgroundColor: 'rgb(245, 71, 71)', marginBottom: 15, marginTop: 15}} onPress={() => {this.hideModal()}}d />
          </View>

        </Modal>

      </View>
     )
   }
 }

 const styles = StyleSheet.create({
   imgBackground: {
     width: '100%',
     height: '100%',
     flex: 1
   },
   modalView: {
     backgroundColor: '#FFF',
     paddingTop: 40,
     paddingBottom: 10,
     paddingLeft: 10,
     paddingRight: 10,
     height: '100%',
     width: '100%',
     justifyContent: 'flex-start',
     alignItems: 'center'
   },
   modalText: {
     fontSize: 20,
     color: 'white'
   },
   textInput: {
     borderWidth:1,
     borderColor:'gray',
     marginVertical: 20,
     padding:10,
     height:40,
     alignSelf: 'stretch',
     fontSize: 18,
   },


 });
