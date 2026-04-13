import * as Blockly from 'blockly'

// ── WHEN (trigger block) ──────────────────────────────

Blockly.Blocks.when = {
  init() {
    this.appendValueInput('CONDITION')
      .setCheck('Boolean')
      .appendField('when')
    this.appendStatementInput('DO')
      .appendField('do')
    this.setPreviousStatement(true)
    this.setNextStatement(true)
    this.setColour(210)
    this.setTooltip('Execute actions when a condition is true')
  },
}

// ── Comparison (single block, operator dropdown) ──────

Blockly.Blocks.compare = {
  init() {
    this.appendValueInput('LEFT').setCheck('Number')
    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        ['>', 'GT'],
        ['<', 'LT'],
        ['>=', 'GTE'],
        ['<=', 'LTE'],
        ['=', 'EQ'],
      ]), 'OP')
    this.appendValueInput('RIGHT').setCheck('Number')
    this.setInputsInline(true)
    this.setOutput(true, 'Boolean')
    this.setColour(210)
    this.setTooltip('Compare two numbers')
  },
}

// ── Crosses (above / below dropdown) ─────────────────

Blockly.Blocks.crosses = {
  init() {
    this.appendValueInput('A').setCheck('Number')
    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown([
        ['crosses above', 'ABOVE'],
        ['crosses below', 'BELOW'],
      ]), 'DIR')
    this.appendValueInput('B').setCheck('Number')
    this.setInputsInline(true)
    this.setOutput(true, 'Boolean')
    this.setColour(210)
    this.setTooltip('True when A crosses above/below B')
  },
}

// ── Logic: AND / OR / NOT ─────────────────────────────

Blockly.Blocks.logic_and = {
  init() {
    this.appendValueInput('A').setCheck('Boolean')
    this.appendDummyInput().appendField('and')
    this.appendValueInput('B').setCheck('Boolean')
    this.setInputsInline(true)
    this.setOutput(true, 'Boolean')
    this.setColour(210)
    this.setTooltip('True when both conditions are true')
  },
}

Blockly.Blocks.logic_or = {
  init() {
    this.appendValueInput('A').setCheck('Boolean')
    this.appendDummyInput().appendField('or')
    this.appendValueInput('B').setCheck('Boolean')
    this.setInputsInline(true)
    this.setOutput(true, 'Boolean')
    this.setColour(210)
    this.setTooltip('True when either condition is true')
  },
}

Blockly.Blocks.logic_not = {
  init() {
    this.appendValueInput('A').setCheck('Boolean')
      .appendField('not')
    this.setOutput(true, 'Boolean')
    this.setColour(210)
    this.setTooltip('Inverts a condition')
  },
}
