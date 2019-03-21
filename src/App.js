import React, { Component } from 'react';
import './App.css';
import {Provider,connect} from 'react-redux';
import {createStore} from 'redux';
import alarm from './analog.wav' // from https://freesound.org/people/bone666138/sounds/198841/

const STARTPAUSE = 'STARTPAUSE';
const RESETPAUSE = 'RESETPAUSE';

const startOrPause  = (isPause)=>{
  const pausing = (isPause===undefined)?false:!isPause
  return{
    type: STARTPAUSE,
    status: pausing,
  }
}

const pauseOnReset = ()=>{
  return{
    type: RESETPAUSE,
    status: true,
  }
}

const startPauseOrResetPauseReducer = (state = {},action)=>{
  switch(action.type){
    case STARTPAUSE:
      return {
        isPause : action.status
      };
    case RESETPAUSE:
      return{
        isPause: action.status
      }
    default:
      return state;
  }
}

const mapStateToProps = (state)=>{
  return{
    isPause : state.isPause
  }
  
}
const mapDispatchToProps = (dispatch) => {
  return {
    togglingStartPause: (isPause) => {
      dispatch(startOrPause(isPause))
    },
    resettingTimer:()=>{
      dispatch(pauseOnReset())
    }
  }
};
const store = createStore(startPauseOrResetPauseReducer)

const WORK_MINUTES = 25
const WORK_SECONDS = 0
const BREAK_MINUTES = 5
const BREAK_SECONDS = 0


//Stateless functional component for displaying minutes
const Minutes = props => {
  return (
  <div>
    <span >{props.minutes}</span>
  </div>
  )
};

//Stateless functional component for displaying seconds
const Seconds = (props) => {
  return (
    <div>
      <span >{props.seconds}</span>
    </div>
  );
};

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      minutes: WORK_MINUTES,
      seconds: WORK_SECONDS,
      workIsTrueBreakIsFalse: true, //work time is true, break time is false
    }
  }
  componentDidMount() {
    this.interval = setInterval(this.dec, 1000) //set interval to run the dec function once per second
  }

  componentWillUnmount() {
    clearInterval(this.interval) //clears the interval of running the dec function
  }

  //function that decrement the timer
  dec = () => {
    //when time is not paused, decrement seconds 
    if (this.props.isPause === false) {
      if (this.state.seconds !== 0) {
        this.setState(prevState => ({
          seconds: prevState.seconds - 1,
        }))
      //when seconds === 0 and minutes >0, decrement minute by 1, set seconds to 59
      } else if (this.state.seconds === 0 && this.state.minutes > 0) {
        this.setState(prevState => ({
          seconds: 59,
          minutes: prevState.minutes - 1,
        }))
      }
    }

  }
  //function  that starts and pauses the timer
  toggleStartPause = () => {
    this.props.togglingStartPause(this.props.isPause)
  }

  //function that resets the timer
  reset = () => {
    this.props.resettingTimer();
    if (this.state.workIsTrueBreakIsFalse) {
      this.setState({
        minutes: WORK_MINUTES,
        seconds: WORK_SECONDS,
      })
    } else {
      this.setState({
        minutes: BREAK_MINUTES,
        seconds: BREAK_SECONDS,
      })
    }
  }

  //function that toggles the interface to work time
  toggleWork = () => {
    this.props.resettingTimer();
    this.setState({
      minutes: WORK_MINUTES,
      seconds: WORK_SECONDS,
      workIsTrueBreakIsFalse: true,
    })
  }

  //function that toggles the interface to break time
  toggleBreak = () => {
    this.props.resettingTimer();
    this.setState({
      minutes: BREAK_MINUTES,
      seconds: BREAK_SECONDS,
      workIsTrueBreakIsFalse: false,
    })
  }

  //function that dismisses the vibration once timer reaches 0:00
  dismissSound = () => {
    this.interval = setInterval(this.dec, 1000)
    this.props.resettingTimer()
    if (this.state.workIsTrueBreakIsFalse) {
      this.setState({
        minutes: WORK_MINUTES,
        seconds: WORK_SECONDS,
      })
    } else {
      this.setState({
        minutes: BREAK_MINUTES,
        seconds: BREAK_SECONDS,
      })
    }
  }
  
  render() {
    let mode = (this.state.workIsTrueBreakIsFalse) ? "Work" : "Break" //determine whether it is currently work or break time
    let timeCenter = (this.state.seconds>9) ? ":" : ":0" //determine whether to display : or :0 depending on seconds in timer
    
    //when timer reaches 0:00, make sound
    if (this.state.seconds === 0 && this.state.minutes === 0) {
      clearInterval(this.interval)
      
      //return view containing button to dismiss the sound
      return (
        <div id="Container">
          <audio autoPlay loop><source src={alarm} type="audio/wav"/></audio >
          <button onClick={this.dismissSound} >Dismiss</button>
        </div>
      )
       } else {
    return (
      <div id="Container">
      
      <span style={{fontSize:"8vmin"}}>{mode}</span>
      <div id="TimeContainer">
        <Minutes minutes={this.state.minutes} />
        <span >{timeCenter}</span>
        <Seconds seconds={this.state.seconds} />
      </div>
      
      <div >
      <div >
        <button onClick={this.toggleStartPause} >Start / Pause</button>
      </div>
      <div >
        <button onClick={this.reset} >Reset</button>
      </div>
      {/*While timer is running don't display toggle buttons*/}
      {((this.props.isPause===undefined)||(this.props.isPause===true)) &&
        <div>
          <button  onClick={this.toggleWork} >Toggle Work</button>      
        </div>
      }
      {((this.props.isPause===undefined)||(this.props.isPause===true)) &&
        <div>
          <button onClick={this.toggleBreak} >Toggle Break</button>
        </div>          
      }
    </div>
    </div>
     
    );
      }
  }
}

const Container = connect(mapStateToProps, mapDispatchToProps)(App);
class AppWrapper extends Component {
  render() {
    return (
      <Provider store={store}>
        <Container/>
      </Provider>
    );
  }
};

export default AppWrapper;
