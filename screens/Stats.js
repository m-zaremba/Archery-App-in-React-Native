import React from 'react';
import {
  Text,
  View,
  Button,
  ImageBackground,
  StyleSheet,
  Modal,
  TouchableHighlight,
  ScrollView
} from 'react-native';
import firebase from 'react-native-firebase';
import Svg, { Rect, Circle } from 'react-native-svg';
import Icon from 'react-native-vector-icons/AntDesign';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';

export default class Stats extends React.Component {
  constructor(props) {
    super(props);
    this.ref = firebase.firestore().collection('series');
    this.state = {
      series: [],
      loading: true,
      modalVisible: false,
      upperLColor: 'rgba(0, 0, 0, 0)',
      upperRColor: 'rgba(0, 0, 0, 0)',
      lowerLColor: 'rgba(0, 0, 0, 0)',
      lowerRColor: 'rgba(0, 0, 0, 0)'
    };
  }

  onCollectionUpdate = querySnapshot => {
    const series = [];
    querySnapshot.forEach(doc => {
      const { accuracy, coordinates, errors } = doc.data();

      series.push({
        doc, // DocumentSnapshot
        accuracy,
        coordinates,
        errors
      });
    });

    this.setState({
      series: series,
      loading: false
    });
  };

  handleModal = () => {
    this.setState({
      modalVisible: true
    });

    let errQuart = []; // error tags 2D array
    let errList = []; // 1D error 'list'
    this.state.series.map((e, i) => {
      if (e.errors) {
        errQuart.push(e.errors);
      }
    });

    let upperL = [];
    let upperR = [];
    let lowerL = [];
    let lowerR = [];

    for (let i = 0; i < errQuart.length; i++) {
      for (let j = 0; j < errQuart[i].length; j++) {
        errList.push(errQuart[i][j]);
      }
    }

    errList.map(e => {
      if (e === 'UL') {
        upperL.push(e);
      } else if (e === 'UR') {
        upperR.push(e);
      } else if (e === 'LL') {
        lowerL.push(e);
      } else if (e === 'LR') {
        lowerR.push(e);
      }
    });

    if (upperL.length > upperR.length && upperL.length > lowerL.length && upperL.length > lowerR.length) {
      this.setState({
        upperLColor: 'rgba(255, 0, 0, 0.55)'
      });
    }

    if (upperR.length > upperL.length && upperR.length > lowerL.length && upperR.length > lowerR.length) {
      this.setState({
        upperRColor: 'rgba(255, 0, 0, 0.55)'
      });
    }
    if (lowerL.length > upperL.length && lowerL.length > upperR.length && lowerL.length > lowerR.length) {
      this.setState({
        lowerLColor: 'rgba(255, 0, 0, 0.55)'
      });
    }

    if (lowerR.length > upperL.length && lowerR.length > upperR.length && lowerR.length > lowerL.length) {
      this.setState({
        lowerRColor: 'rgba(255, 0, 0, 0.55)'
      });
    }
  };

  setModalVisible(visible) {
    this.setState({
      modalVisible: false
    });
  }

  componentDidMount() {
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate);
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    // All shots counter

    let seriesAcc = []; // All shots accuracy tags
    let sum = [];

    this.state.series.map((e, i) => {
      seriesAcc.push(e.accuracy);
      sum.push(e.accuracy.length * (i + 1));
    });

    let shots = sum[sum.length - 1]; // Number of fired shots

    // arrows hits coordinates

    let coordObj = [];
    let errQuart = []; // error tags 2D array
    let errList = []; // 1D error 'list'
    this.state.series.map((e, i) => {
      coordObj.push(e.coordinates);

      if (e.errors) {
        errQuart.push(e.errors);
      }
    });

    let upperL = [];
    let upperR = [];
    let lowerL = [];
    let lowerR = [];

    for (let i = 0; i < errQuart.length; i++) {
      for (let j = 0; j < errQuart[i].length; j++) {
        errList.push(errQuart[i][j]);
      }
    }

    errList.map(e => {
      if (e === 'UL') {
        upperL.push(e);
      } else if (e === 'UR') {
        upperR.push(e);
      } else if (e === 'LL') {
        lowerL.push(e);
      } else if (e === 'LR') {
        lowerR.push(e);
      }
    });

    let statCoords = []; // array of shot coordinates

    for (let i = 0; i < coordObj.length; i++) {
      for (let j = 0; j < coordObj[i].length; j++) {
        statCoords.push(coordObj[i][j]);
      }
    }

    // Calculate number of missed shots via error messages

    let errors = [];
    for (let i = 0; i < errQuart.length; i++) {
      for (let j = 0; j < errQuart[i].length; j++) {
        errors.push(errQuart[i][j]);
      }
    }

    let misses = errors.length;

    // Shot stats per Arrow

    let firstAcc = []; // Accuracy of 1st Arrow in all series as 0/1 number necessary for following calculations
    let secondAcc = []; // Accuracy of 2nd Arrow in all series as 0/1 number necessary for following calculations
    let thirdAcc = []; // Accuracy of 3rd Arrow in all series as 0/1 number necessary for following calculations
    let fourthAcc = []; // Accuracy of 4th Arrow in all series as 0/1 number necessary for following calculations

    seriesAcc.map((e, i) => {
      if (e[0] === 'ios-radio-button-off') {
        firstAcc.push(1);
      } else {
        firstAcc.push(0);
      }

      if (e[1] === 'ios-radio-button-off') {
        secondAcc.push(1);
      } else {
        secondAcc.push(0);
      }

      if (e[2] === 'ios-radio-button-off') {
        thirdAcc.push(1);
      } else {
        thirdAcc.push(0);
      }

      if (e[3] === 'ios-radio-button-off') {
        fourthAcc.push(1);
      } else {
        fourthAcc.push(0);
      }
    });

    //Show all shots markers

    let statShots = statCoords.map((e, i) => {
      if (i === 0 || i % 4 === 0) {
        return (
          <View key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              position: 'absolute',
              top: e.posY + 36,
              left: e.posX + 16,
              backgroundColor: 'red',
              zIndex: 2
            }}
          />
        );
      } else if (i === 1 || i % 4 === 1) {
        return (
          <View
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              position: 'absolute',
              top: e.posY + 36,
              left: e.posX + 16,
              backgroundColor: 'green',
              zIndex: 2
            }}
          />
        );
      } else if (i === 2 || i % 4 === 2) {
        return (
          <View
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              position: 'absolute',
              top: e.posY + 36,
              left: e.posX + 16,
              backgroundColor: 'blue',
              zIndex: 2
            }}
          />
        );
      } else {
        return (
          <View
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              position: 'absolute',
              top: e.posY + 36,
              left: e.posX + 16,
              backgroundColor: 'violet',
              zIndex: 2
            }}
          />
        );
      }
    });

    //Shots error cause list

    let errMessage = '';

    if (this.state.upperLColor === 'rgba(255, 0, 0, 0.55)') {
      errMessage = `Reasons why You hit mostly Upper Left quarter of azuchi:\n1)Reason One\n2)Reason Two\n3)Reason Three\n4)Reason Four\n5)Reason Five\n6)Reason Six\n7)Reason Seven\n8)Reason Eight\n9)Reason Nine\n10)Reason Ten\n11)Reason Eleven\n12)Reason Twelve\n13)Reason Thireen\n14)Reason Fourteen\n15)Reason Fifteen\n16)Reason Sixteen\n17)Reason Seventeen\n18)Reason Eighteen\n19)Reason Nineteen\n20)Reason Twenty`;
    } else if (this.state.upperRColor === 'rgba(255, 0, 0, 0.55)') {
      errMessage = `Reasons why You hit mostly Upper Right quarter of azuchi:\n1)Reason One\n2)Reason Two\n3)Reason Three\n4)Reason Four\n5)Reason Five\n6)Reason Six\n7)Reason Seven\n8)Reason Eight\n9)Reason Nine\n10)Reason Ten\n11)Reason Eleven\n12)Reason Twelve\n13)Reason Thireen\n14)Reason Fourteen\n15)Reason Fifteen\n16)Reason Sixteen\n17)Reason Seventeen\n18)Reason Eighteen\n19)Reason Nineteen\n20)Reason Twenty\n`;
    } else if (this.state.lowerLColor === 'rgba(255, 0, 0, 0.55)') {
      errMessage = `Reasons why You hit mostly Lower Left quarter of azuchi:\n1)Reason One\n2)Reason Two\n3)Reason Three\n4)Reason Four\n5)Reason Five\n6)Reason Six\n7)Reason Seven\n8)Reason Eight\n9)Reason Nine\n10)Reason Ten\n11)Reason Eleven\n12)Reason Twelve\n13)Reason Thireen\n14)Reason Fourteen\n15)Reason Fifteen\n16)Reason Sixteen\n17)Reason Seventeen\n18)Reason Eighteen\n19)Reason Nineteen\n20)Reason Twenty\n`;
    } else if (this.state.lowerRColor === 'rgba(255, 0, 0, 0.55)') {
      errMessage = `Reasons why You hit mostly Lower Right quarter of azuchi:\n1)Reason One\n2)Reason Two\n3)Reason Three\n4)Reason Four\n5)Reason Five\n6)Reason Six\n7)Reason Seven\n8)Reason Eight\n9)Reason Nine\n10)Reason Ten\n11)Reason Eleven\n12)Reason Twelve\n13)Reason Thireen\n14)Reason Fourteen\n15)Reason Fifteen\n16)Reason Sixteen\n17)Reason Seventeen\n18)Reason Eighteen\n19)Reason Nineteen\n20)Reason Twenty\n`;
    }

    return (
      <>
        <View
          style={{
            flex: 6,
            alignItems: 'center',
            zIndex: 1,
            justifyContent: 'flex-end',
            paddingBottom: 24
          }}
        >
          {statShots}

          <Svg width='90%' height='90%' viewBox='0 0 100 100'>
            <Rect
              disabled='true'
              width={100}
              height={100}
              fill='rgb(49, 50, 47)'
            />
            <Circle
              disabled='true'
              x={23}
              y={23}
              r={23}
              cx={27}
              cy={40}
              fill='black'
            />
            <Circle
              disabled='true'
              x={18}
              y={18}
              r={18}
              cx={32}
              cy={45}
              fill='white'
            />
            <Circle
              disabled='true'
              x={14}
              y={14}
              r={14}
              cx={36}
              cy={49}
              fill='black'
            />
            <Circle
              disabled='true'
              x={12}
              y={12}
              r={12}
              cx={38}
              cy={51}
              fill='white'
            />
            <Circle
              disabled='true'
              x={8}
              y={8}
              r={8}
              cx={42}
              cy={55}
              fill='black'
            />
            <Circle
              disabled='true'
              x={4}
              y={4}
              r={4}
              cx={46}
              cy={59}
              fill='white'
            />
          </Svg>
        </View>
        <View
          style={{
            flex: 4
          }}
        >
          <View style={styles.statsView}>
            <Text style={styles.statText}>{typeof shots === 'number' ? `${`Shots:\n${shots}`}` : `${`Shots:\n0`}`}</Text>
            <Text style={styles.statText}>{typeof shots === 'number' ? `Hits:\n${shots - misses}`: `Hits:\n0`}</Text>
            <Text style={styles.statText}> {`Misses:\n${misses}`}</Text>
            <Text style={styles.statText}>{typeof shots === 'number' ? `Accuracy:\n${(((shots - Number(errors.length)) / shots) *100).toFixed(0)}%` : `Accuracy:\n0%`}</Text>
          </View>
          <View style={styles.statsView}>
            <Text style={{...styles.statText, color: 'red' }}>{`1st\narrow\naccuracy`}</Text>
            <Text style={{...styles.statText, color: 'green'}}>{`2nd\narrow\naccuracy`}</Text>
            <Text style={{...styles.statText, color: 'blue'}}>{`3rd\narrow\naccuracy`}</Text>
            <Text style={{...styles.statText, color: 'violet'}}>{`4th\narrow\naccuracy`}</Text>
          </View>
          <View style={styles.statsView}>
          <Text style={{...styles.statText, color: 'red'}}>{firstAcc.length > 0 ? `${(((firstAcc.reduce(function(a, b) { return a + b; }, 0)) / firstAcc.length) * 100).toFixed(0)}` : '0'}%</Text>
          <Text style={{...styles.statText, color: 'green'}}>{firstAcc.length > 0 ? `${(((secondAcc.reduce(function(a, b) { return a + b; }, 0)) / secondAcc.length) * 100).toFixed(0)}` : '0'}%</Text>
          <Text style={{...styles.statText, color: 'blue'}}>{firstAcc.length > 0 ? `${(((thirdAcc.reduce(function(a, b) { return a + b; }, 0)) / thirdAcc.length) * 100).toFixed(0)}` : '0'}%</Text>
          <Text style={{...styles.statText, color: 'violet'}}>{firstAcc.length > 0 ? `${(((fourthAcc.reduce(function(a, b) { return a + b; }, 0)) / fourthAcc.length) * 100).toFixed(0)}` : '0'}%</Text>
          </View>
        </View>
        <Modal
          animationType='slide'
          transparent={true}
          visible={this.state.modalVisible}
        >
          <View
            style={{
              marginTop: 22,
              width: '92%',
              height: '95%',
              backgroundColor: 'rgba(85, 85, 85, 0.98)',
              marginLeft: '4%',
              paddingTop: 10,
              paddingLeft: 10,
              paddingRight: 10,
              paddingBottom: 10
            }}
          >
            <View
              style={{
                flex: 2,
                alignItems: 'center'
              }}
            >
              <Svg width='90%' height='90%' viewBox='0 0 100 100'>
                <Rect
                  disabled='true'
                  width={100}
                  height={100}
                  fill='rgb(49, 50, 47)'
                />
                <Circle
                  disabled='true'
                  x={23}
                  y={23}
                  r={23}
                  cx={27}
                  cy={40}
                  fill='black'
                />
                <Circle
                  disabled='true'
                  x={18}
                  y={18}
                  r={18}
                  cx={32}
                  cy={45}
                  fill='white'
                />
                <Circle
                  disabled='true'
                  x={14}
                  y={14}
                  r={14}
                  cx={36}
                  cy={49}
                  fill='black'
                />
                <Circle
                  disabled='true'
                  x={12}
                  y={12}
                  r={12}
                  cx={38}
                  cy={51}
                  fill='white'
                />
                <Circle
                  disabled='true'
                  x={8}
                  y={8}
                  r={8}
                  cx={42}
                  cy={55}
                  fill='black'
                />
                <Circle
                  disabled='true'
                  x={4}
                  y={4}
                  r={4}
                  cx={46}
                  cy={59}
                  fill='white'
                />
                <Rect
                  disabled='true'
                  width={50}
                  height={64}
                  fill={this.state.upperLColor}
                />
                <Rect
                  disabled='true'
                  width={51}
                  height={64}
                  x={49}
                  fill={this.state.upperRColor}
                />
                <Rect
                  disabled='true'
                  width={50}
                  height={37}
                  y={63}
                  fill={this.state.lowerLColor}
                />
                <Rect
                  disabled='true'
                  width={51}
                  height={37}
                  y={63}
                  x={49}
                  fill={this.state.lowerRColor}
                />
              </Svg>
            </View>
            <View
              style={{
                flex: 8,
                alignItems: 'center'
              }}
            >
              <View
                style={{
                  flexDirection: 'row'
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    color: 'white',
                    marginBottom: 20
                  }}
                >
                  {`Upper Left Qurter hits:\nUpper Right Qurter hits:\nLower Left Qurter hits:\nLower Right Qurter hits:`}
                </Text>
                <Text
                  style={{
                    fontSize: 20,
                    color: 'white',
                    marginBottom: 20,
                    paddingLeft: 10
                  }}
                >
                  {`${upperL.length} \n${upperR.length} \n${lowerL.length} \n${lowerR.length}`}
                </Text>
              </View>
              <ScrollView>
                <Text
                  style={{
                    fontSize: 20,
                    color: 'white',
                    lineHeight: 50
                  }}
                >
                  {errMessage}
                </Text>
              </ScrollView>
            </View>
            <Icon
              onPress={() => {
                this.setModalVisible(!this.state.modalVisible);
              }}
              name='close'
              size={40}
              color='black'
              style={{
                position: 'absolute',
                top: 6,
                right: 10
              }}
            />
          </View>
        </Modal>
        {upperL.length > 10 ||
        upperR.length > 10 ||
        lowerL.length > 10 ||
        lowerR > 10 ? (
          <Icon
            style={styles.teacherIcon}
            onPress={() => {
              this.handleModal();
            }}
            name='message1'
            size={50}
            color='white'
          />
        ) : null}
      </>
    );
  }
}

const styles = StyleSheet.create({
  statText: {
    flex: 1,
    fontSize: 20,
    textAlign: 'center'
  },
  statsView: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 4,
    paddingRight: 4,
    justifyContent: 'space-around'
  },
  teacherIcon: {
    position: 'absolute',
    bottom: '44%',
    right: 35,
    zIndex: 3
  }
});
