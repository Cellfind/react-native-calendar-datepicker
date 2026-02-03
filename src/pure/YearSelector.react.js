/**
* YearSelector pure component.
* @flow
*/

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';
import toDayjs from '../util/toDayjs';
import Slider from '@react-native-community/slider';

// Component specific libraries.
import dayjs, { Dayjs } from 'dayjs';

type Props = {
  style?: ViewStyle,
  // Focus and onFocus for managing the calendar.
  focus: Dayjs,
  onFocus?: (date : Dayjs) => void,
  // Minimum and maximum date allowed.
  minDate: Dayjs,
  maxDate: Dayjs,
  // Styling properties.
  minimumTrackTintColor?: string,
  maximumTrackTintColor?: string,
  yearSlider?: ViewStyle,
  yearText?: TextStyle,
};
type State = {
  year: number,
};

export default class YearSelector extends Component {
  props: Props;
  state: State;
  static defaultProps: Props;

  constructor(props: Object) {
    super(props);
    this.state = {
      year: props.focus.year(),
    }
  }

  componentDidUpdate(prevProps: Props) {
    const prevYear = toDayjs(prevProps.focus).year();
    const nextYear = toDayjs(this.props.focus).year();
    if (prevYear !== nextYear) {
      this.setState({ year: nextYear });
    }
  }

  _onFocus = (year : number) : void => {
    let date = toDayjs(this.props.focus).year(year);
    this.props.onFocus && this.props.onFocus(date);
  }

  render() {
    const minYear = toDayjs(this.props.minDate).year();
    const maxYear = toDayjs(this.props.maxDate).year();
    const focusYear = toDayjs(this.props.focus).year();
    return (
      <View style={[{
        flexGrow: 1,
        // Wrapper view default style.
      },this.props.style]}>
        <Text style={[styles.yearText, this.props.yearText]}>
          {this.state.year}
        </Text>
        <Slider
          minimumValue={minYear}
          maximumValue={maxYear}
          // TODO: Add a property for this.
          minimumTrackTintColor={this.props.minimumTrackTintColor}
          maximumTrackTintColor={this.props.maximumTrackTintColor}
          step={1}
          value={focusYear}
          onValueChange={(year) => this.setState({year})}
          onSlidingComplete={(year) => this._onFocus(year)}
          style={[this.props.yearSlider]}
          />
      </View>
    );
  }
}
YearSelector.defaultProps = {
  focus: dayjs().startOf('month'),
  minDate: dayjs(),
  maxDate: dayjs(),
};

const styles = StyleSheet.create({
  yearText: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  }
});
