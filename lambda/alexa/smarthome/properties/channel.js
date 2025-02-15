/**
 * Copyright (c) 2010-2021 Contributors to the openHAB project
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const { ItemType } = require('@openhab/constants');
const { Parameter, ParameterType } = require('../metadata');
const AlexaProperty = require('./property');

/**
 * Defines channel property class
 * @extends AlexaProperty
 */
class Channel extends AlexaProperty {
  /**
   * Returns supported item types
   * @return {Array}
   */
  get supportedItemTypes() {
    return [ItemType.NUMBER, ItemType.STRING];
  }

  /**
   * Returns supported parameters and their type
   * @return {Object}
   */
  get supportedParameters() {
    return {
      [Parameter.CHANNEL_MAPPINGS]: ParameterType.MAP,
      [Parameter.RANGE]: ParameterType.RANGE
    };
  }

  /**
   * Returns channel mappings list
   * @return {Object}
   */
  get channelMappings() {
    return this.parameters[Parameter.CHANNEL_MAPPINGS] || {};
  }

  /**
   * Returns range based on parameter
   * @return {Array}
   */
  get range() {
    return this.parameters[Parameter.RANGE] || [1, 9999];
  }

  /**
   * Returns alexa state
   * @param  {String} value
   * @return {Object}
   */
  getState(value) {
    // Return formatted state if value defined
    if (typeof value !== 'undefined') {
      return { number: value.toString() };
    }
  }

  /**
   * Updates parameters
   * @param {Object} item
   * @param {Object} metadata
   * @param {Object} settings
   */
  updateParameters(item, metadata, settings) {
    const parameters = this.parameters;
    // Update parameters from parent method
    super.updateParameters(item, metadata, settings);

    // Define channel mappings as follow:
    //  1) using parameter if defined
    //  2) using item state description options if available
    //  3) empty object
    const channels = parameters[Parameter.CHANNEL_MAPPINGS]
      ? parameters[Parameter.CHANNEL_MAPPINGS]
      : item.stateDescription && item.stateDescription.options
      ? Object.fromEntries(item.stateDescription.options.map((option) => [option.value, option.label]))
      : {};
    // Update channel mappings parameter removing invalid mappings if defined
    parameters[Parameter.CHANNEL_MAPPINGS] = Object.entries(channels)
      .filter(([number]) => !isNaN(number))
      .reduce((channels, [number, name]) => ({ ...channels, [number]: name }), undefined);

    const range = parameters[Parameter.RANGE] || [];
    // Update range parameter if valid (min < max), otherwise set to undefined
    parameters[Parameter.RANGE] = range[0] < range[1] ? range.map((value) => Math.round(value)) : undefined;
  }
}

module.exports = Channel;
