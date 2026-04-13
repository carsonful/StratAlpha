import * as Blockly from 'blockly'

Blockly.Blocks.strategy_root = {
  init() {
    this.appendDummyInput()
      .appendField('on each bar of')
      .appendField(new Blockly.FieldTextInput('AAPL'), 'SYMBOL')
    this.appendStatementInput('STRATEGY')
      .appendField('strategy')
    this.setColour(35)
    this.setTooltip('Root block — defines which symbol this strategy trades')
    this.setDeletable(true)
  },
}
