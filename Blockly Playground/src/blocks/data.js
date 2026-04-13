import * as Blockly from 'blockly'

const SOURCE_OPTIONS = [
  ['close', 'CLOSE'],
  ['open', 'OPEN'],
  ['high', 'HIGH'],
  ['low', 'LOW'],
  ['volume', 'VOLUME'],
]

Blockly.Blocks.data_price = {
  init() {
    this.appendDummyInput()
      .appendField('price')
      .appendField(new Blockly.FieldDropdown(SOURCE_OPTIONS), 'SOURCE')
      .appendField('offset')
      .appendField(new Blockly.FieldNumber(0, 0, 999, 1), 'OFFSET')
    this.setOutput(true, 'Number')
    this.setColour(45)
    this.setTooltip('Get a price value (open/high/low/close/volume) with bar offset')
  },
}
