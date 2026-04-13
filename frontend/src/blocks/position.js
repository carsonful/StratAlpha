import * as Blockly from 'blockly'

Blockly.Blocks.pos_is_invested = {
  init() {
    this.appendDummyInput().appendField('is invested')
    this.setOutput(true, 'Boolean')
    this.setColour(260)
    this.setTooltip('True if currently holding a position')
  },
}

Blockly.Blocks.pos_quantity = {
  init() {
    this.appendDummyInput().appendField('position qty')
    this.setOutput(true, 'Number')
    this.setColour(260)
    this.setTooltip('Current position size (negative = short)')
  },
}

Blockly.Blocks.pos_avg_price = {
  init() {
    this.appendDummyInput().appendField('avg entry price')
    this.setOutput(true, 'Number')
    this.setColour(260)
    this.setTooltip('Average entry price of current position')
  },
}

Blockly.Blocks.portfolio_cash = {
  init() {
    this.appendDummyInput().appendField('cash')
    this.setOutput(true, 'Number')
    this.setColour(260)
    this.setTooltip('Available cash in portfolio')
  },
}

Blockly.Blocks.portfolio_equity = {
  init() {
    this.appendDummyInput().appendField('total equity')
    this.setOutput(true, 'Number')
    this.setColour(260)
    this.setTooltip('Total portfolio equity')
  },
}
