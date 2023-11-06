/**
* MonthSelector pure component.
* @flow
*/

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  LayoutAnimation,
  TouchableHighlight,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import ViewPropTypes from '../util/ViewPropTypes';

// Component specific libraries.
import map from 'lodash/map';
import dayjs, { Dayjs } from 'dayjs';

type Props = {
  selected?: Dayjs,
  // Styling
  style?: ViewPropTypes.style,
  // Controls the focus of the calendar.
  focus: Dayjs,
  onFocus?: (date: Dayjs) => void,
  // Minimum and maximum valid dates.
  minDate: Dayjs,
  maxDate: Dayjs,
  // Styling properties.
  monthText?: Text.propTypes.style,
  monthDisabledText?: Text.propTypes.style,
  selectedText?: Text.propTypes.style,
};
type State = {
  months: Array<Array<Object>>,
};

export default class MonthSelector extends Component {
  props: Props;
  state: State;
  static defaultProps: Props;

  constructor(props: Object) {
    super(props);

    const months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
    let groups = [];
    let group = [];
    map(months, (month, index) => {
      if (index % 3 === 0) {
        group = [];
        groups.push(group);
      }
      // Check if the month is valid.
      let maxChoice = dayjs(this.props.focus).month(index).endOf('month');
      let minChoice = dayjs(this.props.focus).month(index).startOf('month');
      group.push({
        valid: this.props.maxDate.diff(minChoice, 'seconds') >= 0 &&
               this.props.minDate.diff(maxChoice, 'seconds') <= 0,
        name: month,
        index,
      });
    })
    this.state = {
      months: groups,
    };
  }

  _onFocus = (index : number) : void => {
    let focus = dayjs(this.props.focus).month(index);
    // If `focus` is part of the state, it should be updated like this:
    this.setState({ focus: focus }, () => {
      // Call the onFocus prop, if it exists, after the state has been updated
      this.props.onFocus && this.props.onFocus(focus);
    });

  render() {
    return (
      <View style={[{
        // Wrapper view default style.
      },this.props.style]}>
        {map(this.state.months, (group, i) =>
          <View key={i} style={[styles.group]}>
            {map(group, (month, j) =>
              <TouchableHighlight
                key={j}
                style={{flexGrow: 1}}
                activeOpacity={1}
                underlayColor='transparent'
                onPress={() => month.valid && this._onFocus(month.index)}>
                <Text style={[
                  styles.monthText,
                  this.props.monthText,
                  month.valid ? null : styles.disabledText,
                  month.valid ? null : this.props.monthDisabledText,
                  month.index ===  (this.props.selected && this.props.selected.month()) ? this.props.selectedText : null,
                ]}>
                  {month.name}
                </Text>
              </TouchableHighlight>
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
