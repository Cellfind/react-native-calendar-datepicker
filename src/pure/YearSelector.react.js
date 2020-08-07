/**
* YearSelector pure component.
* @flow
*/

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  Slider,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import ViewPropTypes from '../util/ViewPropTypes';

// Component specific libraries.
import dayjs, { Dayjs } from 'dayjs';

type Props = {
  style?: ViewPropTypes.style,
  // Focus and onFocus for managing the calendar.
  focus: Dayjs,
  onFocus?: (date : Dayjs) => void,
  // Minimum and maximum date allowed.
  minDate: Dayjs,
  maxDate: Dayjs,
  // Styling properties.
  minimumTrackTintColor?: string,
  maximumTrackTintColor?: string,
  yearSlider?: Slider.propTypes.style,
  yearText?: Text.propTypes.style,
};
type State = {
  year: Number,
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

  _onFocus = (year : number) : void => {
    let date = dayjs(this.props.focus);
    date.year(year);
    this.props.onFocus && this.props.onFocus(date);
  }

  render() {
    return (
      <View style={[{
        flexGrow: 1,
        // Wrapper view default style.
      },this.props.style]}>
        <Text style={[styles.yearText, this.props.yearText]}>
          {this.state.year}
        </Text>
        <Slider
          minimumValue={this.props.minDate.year()}
          maximumValue={this.props.maxDate.year()}
          // TODO: Add a property for this.
          minimumTrackTintColor={this.props.minimumTrackTintColor}
          maximumTrackTintColor={this.props.maximumTrackTintColor}
          step={1}
          value={this.props.focus.year()}
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
