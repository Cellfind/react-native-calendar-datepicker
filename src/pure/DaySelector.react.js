/**
* DaySelector pure component.
* @flow
*/

import React, { Component } from 'react';
import {
  Dimensions,
  PanResponder,
  TouchableHighlight,
  LayoutAnimation,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';
import toDayjs from '../util/toDayjs';

// Component specific libraries.
import map from 'lodash/map';
import min from 'lodash/min';
import max from 'lodash/max';
import times from 'lodash/times';
import constant from 'lodash/constant';
import dayjs, { Dayjs } from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
dayjs.extend(weekday)

type Props = {
  // Focus and selection control.
  focus: Dayjs,
  selected?: Dayjs,
  onChange?: (date: Dayjs) => void,
  onFocus?: (date: Dayjs) => void,
  slideThreshold?: number,
  monthOffset?: number,
  // Minimum and maximum dates.
  minDate: Dayjs,
  maxDate: Dayjs,
  // Styling properties.
  dayHeaderView?: ViewStyle,
  dayHeaderText?: TextStyle,
  dayRowView?: ViewStyle,
  dayView?: ViewStyle,
  daySelectedView?: ViewStyle,
  dayText?: TextStyle,
  dayTodayText?: TextStyle,
  daySelectedText?: TextStyle,
  dayDisabledText?: TextStyle,
};
type State = {
  days: Array<Array<Object>>,
};

export default class DaySelector extends Component {
  props: Props;
  state: State;
  static defaultProps: Props;
  _panResponder: PanResponder;
  wrapperRef = React.createRef();

  constructor(props: Props) {
    super(props);
    this.state = {
      days: this._computeDays(props),
    }
    // Hook the pan responder to interpret gestures.
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => false,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
          return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (evt, gestureState) => {
        this._slide(gestureState.dx);
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded

        // Get the height, width and compute the threshold and offset for swipe.
        const {height, width} = Dimensions.get('window');
        const threshold = this.props.slideThreshold || min([width / 3, 250]);
        const maxOffset = max([height, width]);
        const dx = gestureState.dx;
        const newFocus = toDayjs(this.props.focus).add(dx < 0 ? 1 : -1, 'month');
        const valid =
          toDayjs(this.props.maxDate).diff(
            dayjs(newFocus).startOf('month'), 'seconds') >= 0 &&
          toDayjs(this.props.minDate).diff(
            dayjs(newFocus).endOf('month'), 'seconds') <= 0;

        // If the threshold is met perform the necessary animations and updates,
        // and there is at least one valid date in the new focus perform the
        // update.
        if (Math.abs(dx) > threshold && valid) {
          // Animate to the outside of the device the current scene.
          LayoutAnimation.linear(() => {
            // After that animation, update the focus date and then swipe in
            // the corresponding updated scene.
            this.props.onFocus && this.props.onFocus(newFocus);
            LayoutAnimation.easeInEaseOut();
            setTimeout(() => {
              this._slide(dx < 0 ? maxOffset : -maxOffset)
              setTimeout(() => {
                LayoutAnimation.easeInEaseOut();
                this._slide(0)
              }, 0)
            }, 0)
          });
          this._slide(dx > 0 ? maxOffset : -maxOffset);
          return;
        } else {
          // Otherwise cancel the animation.
          LayoutAnimation.spring();
          this._slide(0);
        }
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
        LayoutAnimation.spring();
        this._slide(0)
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
  }

  _slide = (dx : number) => {
    if (!this.wrapperRef.current) {
      return;
    }
    this.wrapperRef.current.setNativeProps({
      style: {
        left: dx,
      }
    })
  };

  componentDidUpdate(prevProps: Object) {
    const prevFocus = toDayjs(prevProps.focus);
    const nextFocus = toDayjs(this.props.focus);
    const prevSelected = prevProps.selected ? toDayjs(prevProps.selected) : null;
    const nextSelected = this.props.selected ? toDayjs(this.props.selected) : null;
    const focusChanged = !nextFocus.isSame(prevFocus, 'month');
    const selectedChanged = prevSelected
      ? !nextSelected || !nextSelected.isSame(prevSelected, 'day')
      : !!nextSelected;

    if (focusChanged || selectedChanged) {
      this.setState({
        days: this._computeDays(this.props),
      })
    }

    if (this.props.monthOffset != prevProps.monthOffset && this.props.monthOffset !== 0) {
      const newFocus = toDayjs(this.props.focus).add(this.props.monthOffset, 'month');
      this.props.onFocus && this.props.onFocus(newFocus);
    }
  }

  _computeDays = (props: Object) : Array<Array<Object>> => {
    let result = [];
    const focus = toDayjs(props.focus);
    const minDate = toDayjs(props.minDate);
    const maxDate = toDayjs(props.maxDate);
    const currentMonth = focus.month();
    let iterator = dayjs(focus);
    while (iterator.month() === currentMonth) {
      if (iterator.weekday() === 0 || result.length === 0) {
        result.push(times(7, constant({})));
      }
      let week = result[result.length - 1];
      week[iterator.weekday()] = {
        valid: maxDate.diff(iterator, 'seconds') >= 0 &&
               minDate.diff(iterator, 'seconds') <= 0,
        date: iterator.date(),
        selected: props.selected && iterator.isSame(toDayjs(props.selected), 'day'),
        today: iterator.isSame(dayjs(), 'day'),
      };
      // Add it to the result here.
      iterator = iterator.add(1, 'day');
    }
    LayoutAnimation.easeInEaseOut();
    return result;
  };

  _onChange = (day : Object) : void => {
    let date = toDayjs(this.props.focus).add(day.date - 1 , 'day');
    this.props.onChange && this.props.onChange(date);
  }

  render() {
    return (
      <View>
        <View style={[styles.headerView, this.props.dayHeaderView]}>
          {map(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], (day) =>
            <Text key={day} style={[styles.headerText, this.props.dayHeaderText]}>
              {day}
            </Text>
          )}
        </View>
        <View ref={this.wrapperRef} {...this._panResponder.panHandlers}>
          {map(this.state.days, (week, i) =>
            <View key={i} style={[
                styles.rowView,
                this.props.dayRowView,
                i === this.state.days.length - 1 ? {
                  borderBottomWidth: 0,
                } : null,
              ]}>
              {map(week, (day, j) =>
                <TouchableHighlight
                  key={j}
                  style={[
                    styles.dayView,
                    this.props.dayView,
                    day.selected ? this.props.daySelectedView : null
                  ]}
                  activeOpacity={day.valid ? 0.8 : 1}
                  underlayColor='transparent'
                  onPress={() => day.valid && this._onChange(day)}>
                  <Text style={[
                    styles.dayText,
                    this.props.dayText,
                    day.today ? this.props.dayTodayText : null,
                    day.selected ? styles.selectedText : null,
                    day.selected ? this.props.daySelectedText : null,
                    day.valid ? null : styles.disabledText,
                    day.valid ? null : this.props.dayDisabledText,
                  ]}>
                    {day.date}
                  </Text>
                </TouchableHighlight>
              )}
            </View>
          )}
        </View>
      </View>
    );
  }
}
DaySelector.defaultProps = {
  focus: dayjs().startOf('month'),
  minDate: dayjs(),
  maxDate: dayjs(),
};

const styles = StyleSheet.create({
  headerView: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexGrow: 1,
    flexDirection: 'row',
    height: 35,
  },
  headerText: {
    flexGrow: 1,
    minWidth: 40,
    textAlign: 'center',
  },
  rowView: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexGrow: 1,
    flexDirection: 'row',
    height: 35,
  },
  dayView: {
    flexGrow: 1,
    margin: 5,
  },
  dayText: {
    flexGrow: 1,
    minWidth: 30,
    padding: 5,
    textAlign: 'center',
  },
  selectedText: {
    borderRadius: 5,
    borderWidth: 1,
    fontWeight: 'bold',
  },
  disabledText: {
    borderColor: 'grey',
    color: 'grey',
  },
});
