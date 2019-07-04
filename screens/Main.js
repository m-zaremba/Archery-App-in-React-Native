import React from 'react';
import firebase from 'react-native-firebase';

import {FlatList, ScrollView, View, Text, Image, ImageBackground, StyleSheet, Modal, ActivityIndicator} from 'react-native';
import {createBottomTabNavigator, createStackNavigator, createAppContainer} from 'react-navigation';
import {Button} from 'react-native-elements';
import CalendarModal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';

import AddSerie from './AddSerie';
import Stats from './Stats';
import Logout from './Logout';
import Serie from './Serie';



class Main extends React.Component {
  constructor(props) {
    super(props);
    this.uid = firebase.auth().currentUser.uid;
    this.ref = firebase.firestore().collection(this.uid).orderBy('timestamp', 'desc')
    this.unsubscribe = null;

    this.state = {
      series: [],
      loading: true,
      showModal: false,
      showCalendarModal: false,
      selectedStartDate: null,
      selectedEndDate: null,
      defaultStartDate: '',
      defaultEndDate: '',
    }
    this.onDateChange = this.onDateChange.bind(this);
  }

  onCollectionUpdate = querySnapshot => {
    const series = [];
    querySnapshot.forEach(doc => {
      const { date, accuracy, coordinates, note, timestamp, trainingDay } = doc.data();

      series.push({
        key: doc.id,
        doc,
        date,
        accuracy,
        coordinates,
        timestamp,
        note,
        trainingDay,
      });

    });

    this.setState({
      series: series,
      loading: false
    });


  };

  showModal = () => {
    this.setState({
      showModal: true
    })
  }

  hideModal = () => {
    this.setState({
      showModal: false
    })
  }

  onDateChange(date, type) {
    if (type === 'END_DATE') {
      this.setState({
        selectedEndDate: date,
      });
    } else {
      this.setState({
        selectedStartDate: date,
        selectedEndDate: null,
      });
    }
  }

  showCalendar = () => {
    this.setState({
      showCalendarModal: true
    })
  }


  componentDidMount() {
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);

    let now = new Date();
    let start = moment(now).startOf('day').valueOf();
    let end = moment(now).endOf('day').valueOf();

    this.setState({
      defaultStartDate: start,
      defaultEndDate: end,
    })

  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {

    let data = [];

    this.state.series.forEach((e,i) => {
      if((this.state.selectedStartDate === null && e.timestamp >= this.state.defaultStartDate) && (this.state.selectedEndDate === null && e.timestamp <= this.state.defaultEndDate)) {
        data.push(e);
      } else if((this.state.selectedStartDate != null && e.timestamp >= this.state.selectedStartDate) && (this.state.selectedEndDate != null && e.timestamp <= this.state.selectedEndDate)) {
        data.push(e);
      }
    })

    const { selectedStartDate, selectedEndDate } = this.state;
    const minDate = new Date(2019, 1, 1);
    const maxDate = new Date(2021, 6, 3);
    const startDate  =  selectedStartDate ? selectedStartDate.startOf('day').valueOf() : '';
    const endDate = selectedEndDate ? selectedEndDate.endOf('day').valueOf() : '';


    let listMessage = '';

    if (this.state.selectedStartDate === null) {
      listMessage = 'No shots today.'
    } else {
      listMessage = 'No shots on selected day(s)'
    }

    let headerMessage = '';

    if (this.state.selectedStartDate === null) {
      headerMessage = `Shots from: ${moment(this.state.defaultStartDate).format('DD.MM.YYYY')}`
    } else {
      headerMessage = `Shots from: ${moment(this.state.selectedStartDate).format('DD.MM.YYYY')} to: ${moment(this.state.selectedEndDate).format('DD.MM.YYYY')}`
    }


    let trainingMarkers = [];
    let uniqueTrainingDays = [...new Set(this.state.series.map(e => e.trainingDay))];

    uniqueTrainingDays.forEach((e,i) => {
      if(e != moment().format('DD.MM.YYYY')){
        trainingMarkers.push({date: moment(e, 'DD.MM.YYYY'), textStyle: {color: 'black'}, style: {backgroundColor: 'rgb(247, 211, 211)'}});
      }
    });


    if (this.state.loading) {
      return (
        <View style={styles.loadingView}>
        <Text style={{fontSize: 30}}>Loading</Text>
        <ActivityIndicator size={60} color='rgb(255, 57, 57)' />
        </View>
      )
    }

    return (
      <>
        <ImageBackground
          style={styles.imgBackground}
          resizeMode='contain'
          source={require('../img/background_mon.png')}
        >
          <View style={styles.mainWindow}>
            <View style={styles.dateChoice}>
              <Text style={{fontSize: 18, alignSelf: 'center'}}>{headerMessage}</Text>
            </View>
            <FlatList
              data={data}
              renderItem={({ item }) => <Serie{...item} /> }
              ListEmptyComponent={() =>
                <View style={styles.emptyInfo}>
                  <Text style={styles.emptyInfoText}> {listMessage} </Text>
                </View>
              }
            />
            <MaterialIcon
              style={{ position: 'absolute', bottom: 20, right: 20, backgroundColor: 'rgba(255, 255, 255, 0.75)', borderRadius: 50, padding: 10}}
              name='bullseye-arrow'
              size={60}
              color='rgb(255, 57, 57)'
              onPress={() => this.props.navigation.navigate('AddSerie')}
            />
            <MaterialIcon style={{position: 'absolute', top: 5, right: 5}} name='help-circle' size={35} color='gray' onPress={() => {this.showModal()}}/>
            <MaterialIcon name='calendar-range-outline' style={{position: 'absolute', top: 5, left: 5}} size={35} color={this.state.selectedStartDate === null ? 'gray' : 'rgb(255, 57, 57)'} onPress={() => {
              this.showCalendar()
            }} />
          </View>
        </ImageBackground>

        <Modal animationType='slide' transparent={true} visible={this.state.showModal} >
          <View style={styles.modalView}>
            <ScrollView style={{width: '100%', height: '100%'}}>
              <Text style={{...styles.modalText, textAlign: 'center', marginBottom: 5, fontWeight: 'bold'}}>MAIN SCREEN INFO</Text>
              <View style={styles.calendarInfo}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View style={{flexDirection: 'column'}}>
                    <MaterialIcon name='calendar-range-outline' size={45} color='white'/>
                    <MaterialIcon name='calendar-range-outline' size={45} color='rgb(255, 57, 57)'/>
                  </View>
                  <Text style={{...styles.modalText, flexShrink: 1, marginLeft: 5}}>By default, shots are displayed only for the present day. To filter data by date/date range tap calendar icon. When data filtering is active the colour of calendar icon turns from grey to red.</Text>
                </View>
                <View>
                  <Image
                    style={{width: 300, height: 250, alignSelf: 'center'}}
                    resizeMode='contain'
                    source={require('../img/pr_day.jpg')}
                  />
                  <Text style={styles.modalText}>The calendar opens to the present month showing present day (indicated by red circular background).</Text>
                  <Image
                    style={{width: 300, height: 250, alignSelf: 'center'}}
                    resizeMode='contain'
                    source={require('../img/tr_day.jpg')}
                  />
                  <Text style={styles.modalText}>Dates marked by the lightest shade of red are your previous training days.</Text>
                  <Image
                    style={{width: 300, height: 250, alignSelf: 'center'}}
                    resizeMode='contain'
                    source={require('../img/d_range.jpg')}
                  />
                  <Text style={styles.modalText}>To filter data by date range tap the first and last day of the range. The chosen range will be displayed as a dark-red band. To set a single-day-range simply tap the same date twice.</Text>
                </View>
              </View>
              <View style={styles.addSerieInfo}>
                <MaterialIcon name='bullseye-arrow' color='rgb(255, 57, 57)' size={60} />
                <Text style={styles.modalText}>Tap to start adding the series</Text>
              </View>
              <View style={styles.serieInfo}>
                <View style={styles.serieRow}>
                  <Text style={{fontSize: 22, color: 'black'}}>12.05.2019 12:00</Text>
                  <View style={{flexDirection: 'row'}}>
                    <Icon name='ios-radio-button-off' size={30} style={styles.listIcon} />
                    <Icon name='ios-radio-button-off' size={30} style={styles.listIcon} />
                    <Icon name='ios-radio-button-off' size={30} style={styles.listIcon} />
                    <Icon name='ios-radio-button-off' size={30} style={styles.listIcon} />
                  </View>
                </View>
                <View style={{flexDirection:'row', alignItems: 'flex-end'}}>
                  <MaterialIcon name='gesture-tap' size={40} color='rgb(255, 57, 57)'/>
                  <Text style={styles.modalText}>Tap to view details</Text>
                </View>
                <View style={{...styles.serieRow, marginTop: 60}}>
                  <Text style={{fontSize: 22, color: 'black'}}>12.05.2019 12:00</Text>
                  <View style={{flexDirection: 'row'}}>
                    <Icon name='ios-radio-button-off' size={30} style={styles.listIcon} />
                    <Icon name='ios-radio-button-off' size={30} style={styles.listIcon} />
                    <Icon name='ios-radio-button-off' size={30} style={styles.listIcon} />
                    <Icon name='ios-radio-button-off' size={30} style={styles.listIcon} />
                  </View>
                </View>
                <View style={{flexDirection:'row', alignItems: 'flex-end'}}>
                  <MaterialIcon name='gesture-tap-hold' size={40} color='rgb(255, 57, 57)'/>
                  <Text style={styles.modalText}>Tap and hold to delete serie</Text>
                </View>
              </View>
            </ScrollView>
          </View>
          <MaterialIcon onPress={() => {this.hideModal()}} name='close' size={40} color='black' style={{ position: 'absolute', top: 3, right: 3}} />
        </Modal>

        <CalendarModal animationType='slide' visible={this.state.showCalendarModal} style={styles.calendarModal} >
            <View >
              <CalendarPicker
                startFromMonday={true}
                allowRangeSelection={true}
                minDate={minDate}
                maxDate={maxDate}
                customDatesStyles={trainingMarkers}
                todayBackgroundColor="rgb(254, 109, 109)"
                selectedDayColor="rgb(255, 57, 57)"
                selectedDayTextColor="#FFF"
                onDateChange={this.onDateChange}
              />
            </View>
            <Button title='ACCEPT' type='solid' containerStyle={{width: '90%', alignSelf: 'center'}} buttonStyle={{backgroundColor: 'rgb(245, 71, 71)', marginBottom: 15, marginTop: 15}} onPress={() => {
              this.setState({
                showCalendarModal: false
              })
            }}/>
            <Button title='RESET' type='solid' containerStyle={{width: '90%', alignSelf: 'center'}} buttonStyle={{backgroundColor: 'rgb(245, 71, 71)'}} onPress={() => {
              this.setState({
                selectedStartDate: null,
                selectedEndDate: null,
                showCalendarModal: false,
              })
            }}/>
        </CalendarModal>
      </>
    );
  }
}

const TabNavigator = createBottomTabNavigator(
  {
    Main: Main,
    Stats: Stats,
    Logout: Logout
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        let IconComponent = Icon;
        let iconName;
        if (routeName === 'Main') {
          iconName = `${focused ? 'ios-list-box' : 'ios-list'}`;
        } else if (routeName === 'Stats') {
          iconName = `${focused ? 'ios-stats' : 'md-stats'}`;
        } else if (routeName === 'Logout') {
          iconName = `${focused ? 'ios-exit' : 'ios-log-in'}`;
        }
        return <IconComponent name={iconName} size={40} color={tintColor} />;
      }
    }),
    tabBarOptions: {
      activeTintColor: 'rgb(245, 71, 71)',
      inactiveTintColor: 'rgb(190, 134, 134)',
      showLabel: false
    }
  }
);

export default createAppContainer(TabNavigator);

const styles = StyleSheet.create({
  imgBackground: {
    width: '100%',
    height: '100%',
    flex: 1
  },
  mainWindow: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.4)'
  },
  modalView: {
    backgroundColor: 'rgba(75, 75, 75, 0.95)',
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
  serieRow: {
    height: 60,
    marginTop: 3,
    marginLeft: 5,
    paddingLeft: 15,
    paddingRight: 15,
    marginRight: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    width: '98%'
  },
  listIcon: {
    color: 'black',
    textAlign: 'center',
    width: 30
  },
  emptyInfo: {
    alignItems: 'center',
    height: '100%'
  },
  emptyInfoText: {
    fontSize: 30,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: '68%',
    color: 'black'
  },
  addSerieInfo: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 100,
    marginBottom: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.25)'
  },
  serieInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    width: '100%',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 5,
    paddingRight: 5
  },
  loadingView: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarModal: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    width: '100%',
    marginLeft: 0,
    marginTop: 0,
    marginBottom: 0
  },
  dateChoice: {
    textAlign: 'center'
  },
  calendarInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    width: '100%',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 5,
    paddingRight: 5,
    marginBottom: 60,
  },
});
