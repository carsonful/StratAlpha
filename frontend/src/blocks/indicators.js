import * as Blockly from 'blockly'

const SOURCE_OPTIONS = [
  ['close', 'CLOSE'],
  ['open', 'OPEN'],
  ['high', 'HIGH'],
  ['low', 'LOW'],
]

Blockly.Blocks.ind_sma = {
  init() {
    this.appendDummyInput()
      .appendField('SMA')
      .appendField(new Blockly.FieldDropdown(SOURCE_OPTIONS), 'SOURCE')
      .appendField('period')
      .appendField(new Blockly.FieldNumber(20, 1, 9999, 1), 'PERIOD')
      .appendField('offset')
      .appendField(new Blockly.FieldNumber(0, 0, 999, 1), 'OFFSET')
    this.setOutput(true, 'Number')
    this.setColour(160)
    this.setTooltip('Simple Moving Average')
  },
}

Blockly.Blocks.ind_ema = {
  init() {
    this.appendDummyInput()
      .appendField('EMA')
      .appendField(new Blockly.FieldDropdown(SOURCE_OPTIONS), 'SOURCE')
      .appendField('period')
      .appendField(new Blockly.FieldNumber(20, 1, 9999, 1), 'PERIOD')
      .appendField('offset')
      .appendField(new Blockly.FieldNumber(0, 0, 999, 1), 'OFFSET')
    this.setOutput(true, 'Number')
    this.setColour(160)
    this.setTooltip('Exponential Moving Average')
  },
}

Blockly.Blocks.ind_rsi = {
  init() {
    this.appendDummyInput()
      .appendField('RSI')
      .appendField(new Blockly.FieldDropdown(SOURCE_OPTIONS), 'SOURCE')
      .appendField('period')
      .appendField(new Blockly.FieldNumber(14, 1, 9999, 1), 'PERIOD')
      .appendField('offset')
      .appendField(new Blockly.FieldNumber(0, 0, 999, 1), 'OFFSET')
    this.setOutput(true, 'Number')
    this.setColour(160)
    this.setTooltip('Relative Strength Index')
  },
}

Blockly.Blocks.ind_atr = {
  init() {
    this.appendDummyInput()
      .appendField('ATR')
      .appendField('period')
      .appendField(new Blockly.FieldNumber(14, 1, 9999, 1), 'PERIOD')
      .appendField('offset')
      .appendField(new Blockly.FieldNumber(0, 0, 999, 1), 'OFFSET')
    this.setOutput(true, 'Number')
    this.setColour(160)
    this.setTooltip('Average True Range')
  },
}

Blockly.Blocks.ind_boll_upper = {
  init() {
    this.appendDummyInput()
      .appendField('Boll Upper')
      .appendField(new Blockly.FieldDropdown(SOURCE_OPTIONS), 'SOURCE')
      .appendField('period')
      .appendField(new Blockly.FieldNumber(20, 1, 9999, 1), 'PERIOD')
      .appendField('std')
      .appendField(new Blockly.FieldNumber(2, 0.1, 10, 0.1), 'STDDEV')
      .appendField('offset')
      .appendField(new Blockly.FieldNumber(0, 0, 999, 1), 'OFFSET')
    this.setOutput(true, 'Number')
    this.setColour(160)
    this.setTooltip('Bollinger Band Upper')
  },
}

Blockly.Blocks.ind_boll_middle = {
  init() {
    this.appendDummyInput()
      .appendField('Boll Middle')
      .appendField(new Blockly.FieldDropdown(SOURCE_OPTIONS), 'SOURCE')
      .appendField('period')
      .appendField(new Blockly.FieldNumber(20, 1, 9999, 1), 'PERIOD')
      .appendField('std')
      .appendField(new Blockly.FieldNumber(2, 0.1, 10, 0.1), 'STDDEV')
      .appendField('offset')
      .appendField(new Blockly.FieldNumber(0, 0, 999, 1), 'OFFSET')
    this.setOutput(true, 'Number')
    this.setColour(160)
    this.setTooltip('Bollinger Band Middle')
  },
}

Blockly.Blocks.ind_boll_lower = {
  init() {
    this.appendDummyInput()
      .appendField('Boll Lower')
      .appendField(new Blockly.FieldDropdown(SOURCE_OPTIONS), 'SOURCE')
      .appendField('period')
      .appendField(new Blockly.FieldNumber(20, 1, 9999, 1), 'PERIOD')
      .appendField('std')
      .appendField(new Blockly.FieldNumber(2, 0.1, 10, 0.1), 'STDDEV')
      .appendField('offset')
      .appendField(new Blockly.FieldNumber(0, 0, 999, 1), 'OFFSET')
    this.setOutput(true, 'Number')
    this.setColour(160)
    this.setTooltip('Bollinger Band Lower')
  },
}
