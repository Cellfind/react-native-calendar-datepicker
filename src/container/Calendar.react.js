/**
* Calendar container component.
* @flow
*/

import React, { Component } from 'react';
import {
  LayoutAnimation,
  View,
  Text,
  TouchableHighlight,
  StyleSheet,
} from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';
import Slider from '@react-native-community/slider';

// Component specific libraries.
import dayjs, { Dayjs } from 'dayjs';
import toDayjs from '../util/toDayjs';
// Pure components importing.
import YearSelector from '../pure/YearSelector.react';
import MonthSelector from '../pure/MonthSelector.react';
import DaySelector from '../pure/DaySelector.react';

type Stage = "day" | "month" | "year";
const DAY_SELECTOR : Stage = "day";
const MONTH_SELECTOR : Stage = "month";
const YEAR_SELECTOR : Stage = "year";

// Unicode characters
const LEFT_CHEVRON = '\u276E';
const RIGHT_CHEVRON = '\u276F';

type Props = {
  // The core properties.
  selected?: Dayjs,
  onChange?: (date: Dayjs) => void,
  slideThreshold?: number,
  // Minimum and maximum date.
  minDate: Dayjs,
  maxDate: Dayjs,
  // The starting stage for selection. Defaults to day.
  // Can be overwritten by finalStage.
  startStage: Stage,
  // The final stage for selection. Default to day. If month then the user will
  // not be able to select the month.
  finalStage: Stage,
  // General styling properties.
  style?: ViewStyle,
  barView?: ViewStyle,
  barText?: TextStyle,
  stageView?: ViewStyle,
  showArrows: boolean,
  // Styling properties for selecting the day.
  dayHeaderView?: ViewStyle,
  dayHeaderText?: TextStyle,
  dayRowView?: ViewStyle,
  dayView?: ViewStyle,
  daySelectedView?: ViewStyle,
  dayText?: TextStyle,
  dayTodayText?: TextStyle,
  daySelectedText?: TextStyle,
  dayDisabledText?: TextStyle,
  // Styling properties for selecting the month.
  monthText?: TextStyle,
  monthDisabledText?: TextStyle,
  monthSelectedText?: TextStyle,
  // Styling properties for selecting the year.
  yearMinTintColor?: string,
  yearMaxTintColor?: string,
  yearSlider?: ViewStyle,
  yearText?: TextStyle,
};
type State = {
  stage: Stage,
  // Focus points to the first day of the month that is in current focus.
  focus: Dayjs,
  monthOffset?: number,
};

export default class Calendar extends Component {
  props: Props;
  state: State;
  static defaultProps: Props;

  constructor(props: Props) {
    super(props);
    const stage = String(props.startStage) < String(props.finalStage) ?
                  props.finalStage : props.startStage;
    const selected = props.selected ? toDayjs(props.selected) : dayjs();
    this.state = {
      stage: stage,
      focus: toDayjs(selected).startOf('month'),
      monthOffset: 0,
    }
  }

  _stageText = () : string => {
    if (this.state.stage === DAY_SELECTOR) {
      return this.state.focus.format('MMMM YYYY');
    } else {
      return this.state.focus.format('YYYY');
    }
  }

  _previousStage = () : void => {
    if (this.state.stage === DAY_SELECTOR) {
      this.setState({stage: MONTH_SELECTOR})
    }
    if (this.state.stage === MONTH_SELECTOR) {
      this.setState({stage: YEAR_SELECTOR})
    }
    LayoutAnimation.easeInEaseOut();
  };

  _nextStage = () : void => {
    if (this.state.stage === MONTH_SELECTOR) {
      this.setState({stage: DAY_SELECTOR})
    }
    if (this.state.stage === YEAR_SELECTOR) {
      this.setState({stage: MONTH_SELECTOR})
    }
    LayoutAnimation.easeInEaseOut();
  };

  _previousMonth = () : void => {
    this.setState({monthOffset: -1});
  };

  _nextMonth = () : void => {
    this.setState({monthOffset: 1});
  };

  _changeFocus = (focus : Dayjs, nextStage?: Stage) : void => {
    if (this.props.finalStage != DAY_SELECTOR &&
        this.state.stage == this.props.finalStage) {
      this.setState({focus, monthOffset: 0});
      this.props.onChange && this.props.onChange(focus);
      return;
    }

    if (nextStage) {
      this.setState({focus, monthOffset: 0, stage: nextStage});
      return;
    }

    this.setState({focus, monthOffset: 0});
    this._nextStage();
  };

  render() {
    const barStyle = StyleSheet.flatten([styles.barView, this.props.barView]);

    const minDate = toDayjs(this.props.minDate);
    const maxDate = toDayjs(this.props.maxDate);
    const selected = this.props.selected ? toDayjs(this.props.selected) : undefined;
    const focus = toDayjs(this.state.focus);
    const previousMonth = dayjs(focus).subtract(1, 'month');
    const previousMonthValid = minDate.diff(dayjs(previousMonth).endOf('month'), 'seconds') <= 0;
    const nextMonth = dayjs(focus).add(1, 'month');
    const nextMonthValid = maxDate.diff(dayjs(nextMonth).startOf('month'), 'seconds') >= 0;

    return (
      <View style={[{
        minWidth: 300,
        // Wrapper view default style.
      },this.props.style]}>
        <View style={{
          flexDirection: 'row',
        }}>
          <View style={[styles.barView, this.props.barView]}>
            { this.props.showArrows && this.state.stage === DAY_SELECTOR && previousMonthValid ?
              <TouchableHighlight
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                underlayColor={barStyle ? barStyle.backgroundColor : 'transparent'}
                onPress={this._previousMonth}
              >
                <Text style={this.props.barText}>{LEFT_CHEVRON}</Text>
              </TouchableHighlight> : <View/>
            }

            <TouchableHighlight
              activeOpacity={this.state.stage !== YEAR_SELECTOR ? 0.8 : 1}
              underlayColor={barStyle ? barStyle.backgroundColor : 'transparent'}
              onPress={this._previousStage}
              style={{ alignSelf: 'center' }}
            >
              <Text style={this.props.barText}>
                {this._stageText()}
              </Text>
            </TouchableHighlight>

            { this.props.showArrows && this.state.stage === DAY_SELECTOR && nextMonthValid ?
              <TouchableHighlight
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                underlayColor={barStyle ? barStyle.backgroundColor : 'transparent'}
                onPress={this._nextMonth}
              >
                <Text style={this.props.barText}>{RIGHT_CHEVRON}</Text>
              </TouchableHighlight> : <View/>
            }
          </View>
        </View>
        <View
          style={[styles.stageWrapper, this.props.stageView]}>
          {
            this.state.stage === DAY_SELECTOR ?
            <DaySelector
              focus={focus}
              selected={selected}
              onFocus={this._changeFocus}
              onChange={(date) => this.props.onChange && this.props.onChange(date)}
              monthOffset={this.state.monthOffset}
              minDate={minDate}
              maxDate={maxDate}
              // Control properties
              slideThreshold={this.props.slideThreshold}
              // Transfer the corresponding styling properties.
              dayHeaderView={this.props.dayHeaderView}
              dayHeaderText={this.props.dayHeaderText}
              dayRowView={this.props.dayRowView}
              dayView={this.props.dayView}
              daySelectedView={this.props.daySelectedView}
              dayText={this.props.dayText}
              dayTodayText={this.props.dayTodayText}
              daySelectedText={this.props.daySelectedText}
              dayDisabledText={this.props.dayDisabledText}
              /> :
            this.state.stage === MONTH_SELECTOR ?
            <MonthSelector
              focus={focus}
              selected={selected}
              onFocus={(date) => this._changeFocus(date, DAY_SELECTOR)}
              minDate={minDate}
              maxDate={maxDate}
              // Styling properties
              monthText={this.props.monthText}
              monthDisabledText={this.props.monthDisabledText}
              selectedText={this.props.monthSelectedText}
              /> :
            this.state.stage === YEAR_SELECTOR ?
            <YearSelector
              focus={focus}
              onFocus={(date) => this._changeFocus(date, MONTH_SELECTOR)}
              minDate={minDate}
              maxDate={maxDate}
              // Styling properties
              minimumTrackTintColor={this.props.yearMinTintColor}
              maximumTrackTintColor={this.props.yearMaxTintColor}
              yearSlider={this.props.yearSlider}
              yearText={this.props.yearText}
              /> :
            null
          }
        </View>
      </View>
    );
  }
}
Calendar.defaultProps = {
  minDate: dayjs(),
  maxDate: dayjs().add(10, 'years'),
  startStage: DAY_SELECTOR,
  finalStage: DAY_SELECTOR,
  showArrows: true,
};

const styles = StyleSheet.create({
  barView: {
    flexGrow: 1,
    flexDirection: 'row',
    padding: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextStage: {
    padding: 5,
    alignItems: 'center',
  },
  stageWrapper: {
    padding: 5,
    overflow: 'hidden',
  },
});
