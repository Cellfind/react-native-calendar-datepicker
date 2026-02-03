/**
* MonthSelector pure component.
* @flow
*/

import React, { Component } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';
import toDayjs from '../util/toDayjs';

// Component specific libraries.
import map from 'lodash/map';
import dayjs, { Dayjs } from 'dayjs';

type Props = {
  selected?: Dayjs,
  // Styling
  style?: ViewStyle,
  // Controls the focus of the calendar.
  focus: Dayjs,
  onFocus?: (date: Dayjs) => void,
  // Minimum and maximum valid dates.
  minDate: Dayjs,
  maxDate: Dayjs,
  // Styling properties.
  monthText?: TextStyle,
  monthDisabledText?: TextStyle,
  selectedText?: TextStyle,
};
export default class MonthSelector extends Component {
  props: Props;
  static defaultProps: Props;

  _computeMonths = (props: Props) : Array<Array<Object>> => {
    const months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
    let groups = [];
    let group = [];
    map(months, (month, index) => {
      if (index % 3 === 0) {
        group = [];
        groups.push(group);
      }
      // Check if the month is valid.
      let maxChoice = toDayjs(props.focus).month(index).endOf('month');
      let minChoice = toDayjs(props.focus).month(index).startOf('month');
      group.push({
        valid: toDayjs(props.maxDate).diff(minChoice, 'seconds') >= 0 &&
               toDayjs(props.minDate).diff(maxChoice, 'seconds') <= 0,
        name: month,
        index,
      });
    })
    return groups;
  }

  _onFocus = (index: number): void => {
    let focus = toDayjs(this.props.focus).month(index);
    this.props.onFocus && this.props.onFocus(focus);
  }
  

  render() {
    return (
      <View style={[{
        // Wrapper view default style.
      },this.props.style]}>
        {map(this._computeMonths(this.props), (group, i) =>
          <View key={i} style={[styles.group]}>
            {map(group, (month, j) =>
              <Pressable
                key={j}
                style={{flexGrow: 1}}
                android_ripple={{ color: 'rgba(255,255,255,0.15)' }}
                hitSlop={6}
                onPress={() => this._onFocus(month.index)}>
                <Text style={[
                  styles.monthText,
                  this.props.monthText,
                  month.valid ? null : styles.disabledText,
                  month.valid ? null : this.props.monthDisabledText,
                  month.index === (this.props.selected && toDayjs(this.props.selected).month()) ? this.props.selectedText : null,
                ]}>
                  {month.name}
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    );
  }
}
MonthSelector.defaultProps = {
  focus: dayjs(),
  minDate: dayjs(),
  maxDate: dayjs(),
};

const styles = StyleSheet.create({
  group: {
    //flexGrow: 1,
    flexDirection: 'row',
  },
  disabledText: {
    borderColor: 'grey',
    color: 'grey',
  },
  monthText: {
    borderRadius: 5,
    borderWidth: 1,
    flexGrow: 1,
    margin: 5,
    padding: 10,
    textAlign: 'center',
  },
});
