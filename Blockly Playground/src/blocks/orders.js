import * as Blockly from 'blockly'

Blockly.Blocks.order = {
  init() {
    this.orderType_ = 'MARKET'
    this.slMode_ = 'PCT'
    this.tpMode_ = 'PCT'
    const block = this

    this.appendDummyInput('HEADER')
      .appendField(
        new Blockly.FieldDropdown([
          ['buy', 'BUY'],
          ['sell', 'SELL'],
        ]),
        'DIRECTION',
      )
      .appendField(
        new Blockly.FieldDropdown(
          [
            ['market', 'MARKET'],
            ['limit', 'LIMIT'],
            ['stop', 'STOP'],
          ],
          function (val) {
            block.updateOrderType_(val)
            return val
          },
        ),
        'ORDER_TYPE',
      )

    this.appendDummyInput('SIZE_ROW')
      .appendField(
        new Blockly.FieldDropdown([
          ['qty', 'QTY'],
          ['$ amount', 'USD'],
          ['% equity', 'PCT'],
        ]),
        'SIZE_MODE',
      )
      .appendField(new Blockly.FieldNumber(100, 0.01, 9999999, 1), 'SIZE')

    this.appendDummyInput('SL_TOGGLE')
      .appendField(
        new Blockly.FieldCheckbox('FALSE', function (val) {
          block.toggleSL_(val === 'TRUE')
          return val
        }),
        'HAS_SL',
      )
      .appendField('stop loss')

    this.appendDummyInput('TP_TOGGLE')
      .appendField(
        new Blockly.FieldCheckbox('FALSE', function (val) {
          block.toggleTP_(val === 'TRUE')
          return val
        }),
        'HAS_TP',
      )
      .appendField('take profit')

    this.appendDummyInput('EXIT_AFTER_TOGGLE')
      .appendField(
        new Blockly.FieldCheckbox('FALSE', function (val) {
          block.toggleExitAfter_(val === 'TRUE')
          return val
        }),
        'HAS_EXIT_AFTER',
      )
      .appendField('exit after')

    this.appendDummyInput('EXIT_WHEN_TOGGLE')
      .appendField(
        new Blockly.FieldCheckbox('FALSE', function (val) {
          block.toggleExitWhen_(val === 'TRUE')
          return val
        }),
        'HAS_EXIT_WHEN',
      )
      .appendField('exit when')

    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour(330)
    this.setTooltip('Place an order — toggle options with checkboxes')
  },

  // ── Order type (market / limit / stop) ────────────

  updateOrderType_(type) {
    if (type === this.orderType_) return
    if (this.getInput('LIMIT_PRICE')) this.removeInput('LIMIT_PRICE')
    if (this.getInput('STOP_PRICE')) this.removeInput('STOP_PRICE')

    if (type === 'LIMIT') {
      this.appendValueInput('LIMIT_PRICE')
        .setCheck('Number')
        .appendField('  limit price')
      this.moveInputBefore('LIMIT_PRICE', 'SL_TOGGLE')
    } else if (type === 'STOP') {
      this.appendValueInput('STOP_PRICE')
        .setCheck('Number')
        .appendField('  stop price')
      this.moveInputBefore('STOP_PRICE', 'SL_TOGGLE')
    }
    this.orderType_ = type
  },

  // ── Stop Loss toggle + mode switching ─────────────

  toggleSL_(on) {
    if (on && !this.getInput('SL_CONFIG')) {
      const block = this
      this.slMode_ = 'PCT'
      this.appendDummyInput('SL_CONFIG')
        .appendField('  ')
        .appendField(
          new Blockly.FieldDropdown(
            [
              ['%', 'PCT'],
              ['ATR', 'ATR'],
              ['price', 'PRICE'],
            ],
            function (val) {
              block.updateSLMode_(val)
              return val
            },
          ),
          'SL_MODE',
        )
      this.moveInputBefore('SL_CONFIG', 'TP_TOGGLE')
      this.buildSLValue_('PCT')
    } else if (!on) {
      if (this.getInput('SL_VALUE')) this.removeInput('SL_VALUE')
      if (this.getInput('SL_CONFIG')) this.removeInput('SL_CONFIG')
    }
  },

  updateSLMode_(mode) {
    if (mode === this.slMode_) return
    if (this.getInput('SL_VALUE')) this.removeInput('SL_VALUE')
    this.buildSLValue_(mode)
    this.slMode_ = mode
  },

  buildSLValue_(mode) {
    if (mode === 'PCT') {
      this.appendDummyInput('SL_VALUE')
        .appendField('    ')
        .appendField(new Blockly.FieldNumber(5, 0.01, 100, 0.01), 'SL_PCT')
        .appendField('%')
    } else if (mode === 'ATR') {
      this.appendDummyInput('SL_VALUE')
        .appendField('    ')
        .appendField(
          new Blockly.FieldNumber(1.5, 0.1, 100, 0.1),
          'SL_ATR_MULT',
        )
        .appendField('× ATR(')
        .appendField(
          new Blockly.FieldNumber(14, 1, 9999, 1),
          'SL_ATR_PERIOD',
        )
        .appendField(')')
    } else if (mode === 'PRICE') {
      this.appendValueInput('SL_VALUE')
        .setCheck('Number')
        .appendField('   ')
    }
    this.moveInputBefore('SL_VALUE', 'TP_TOGGLE')
  },

  // ── Take Profit toggle + mode switching ───────────

  toggleTP_(on) {
    if (on && !this.getInput('TP_CONFIG')) {
      const block = this
      this.tpMode_ = 'PCT'
      this.appendDummyInput('TP_CONFIG')
        .appendField('  ')
        .appendField(
          new Blockly.FieldDropdown(
            [
              ['%', 'PCT'],
              ['ATR', 'ATR'],
              ['price', 'PRICE'],
            ],
            function (val) {
              block.updateTPMode_(val)
              return val
            },
          ),
          'TP_MODE',
        )
      this.moveInputBefore('TP_CONFIG', 'EXIT_AFTER_TOGGLE')
      this.buildTPValue_('PCT')
    } else if (!on) {
      if (this.getInput('TP_VALUE')) this.removeInput('TP_VALUE')
      if (this.getInput('TP_CONFIG')) this.removeInput('TP_CONFIG')
    }
  },

  updateTPMode_(mode) {
    if (mode === this.tpMode_) return
    if (this.getInput('TP_VALUE')) this.removeInput('TP_VALUE')
    this.buildTPValue_(mode)
    this.tpMode_ = mode
  },

  buildTPValue_(mode) {
    if (mode === 'PCT') {
      this.appendDummyInput('TP_VALUE')
        .appendField('    ')
        .appendField(
          new Blockly.FieldNumber(10, 0.01, 100, 0.01),
          'TP_PCT',
        )
        .appendField('%')
    } else if (mode === 'ATR') {
      this.appendDummyInput('TP_VALUE')
        .appendField('    ')
        .appendField(
          new Blockly.FieldNumber(2, 0.1, 100, 0.1),
          'TP_ATR_MULT',
        )
        .appendField('× ATR(')
        .appendField(
          new Blockly.FieldNumber(14, 1, 9999, 1),
          'TP_ATR_PERIOD',
        )
        .appendField(')')
    } else if (mode === 'PRICE') {
      this.appendValueInput('TP_VALUE')
        .setCheck('Number')
        .appendField('   ')
    }
    this.moveInputBefore('TP_VALUE', 'EXIT_AFTER_TOGGLE')
  },

  // ── Exit After / Exit When toggles ────────────────

  toggleExitAfter_(on) {
    if (on && !this.getInput('EXIT_AFTER_CONFIG')) {
      this.appendDummyInput('EXIT_AFTER_CONFIG')
        .appendField('  ')
        .appendField(
          new Blockly.FieldNumber(10, 1, 99999, 1),
          'EXIT_AFTER_BARS',
        )
        .appendField('bars')
      this.moveInputBefore('EXIT_AFTER_CONFIG', 'EXIT_WHEN_TOGGLE')
    } else if (!on && this.getInput('EXIT_AFTER_CONFIG')) {
      this.removeInput('EXIT_AFTER_CONFIG')
    }
  },

  toggleExitWhen_(on) {
    if (on && !this.getInput('EXIT_WHEN_CONFIG')) {
      this.appendValueInput('EXIT_WHEN_CONFIG')
        .setCheck('Boolean')
        .appendField('  condition')
    } else if (!on && this.getInput('EXIT_WHEN_CONFIG')) {
      this.removeInput('EXIT_WHEN_CONFIG')
    }
  },

  // ── Serialization ─────────────────────────────────

  saveExtraState() {
    return {
      orderType: this.orderType_,
      sl: this.getFieldValue('HAS_SL') === 'TRUE',
      slMode: this.slMode_,
      tp: this.getFieldValue('HAS_TP') === 'TRUE',
      tpMode: this.tpMode_,
      exitAfter: this.getFieldValue('HAS_EXIT_AFTER') === 'TRUE',
      exitWhen: this.getFieldValue('HAS_EXIT_WHEN') === 'TRUE',
    }
  },

  loadExtraState(state) {
    this.orderType_ = state.orderType || 'MARKET'
    if (this.getInput('LIMIT_PRICE')) this.removeInput('LIMIT_PRICE')
    if (this.getInput('STOP_PRICE')) this.removeInput('STOP_PRICE')
    if (this.orderType_ === 'LIMIT') {
      this.appendValueInput('LIMIT_PRICE')
        .setCheck('Number')
        .appendField('  limit price')
      this.moveInputBefore('LIMIT_PRICE', 'SL_TOGGLE')
    } else if (this.orderType_ === 'STOP') {
      this.appendValueInput('STOP_PRICE')
        .setCheck('Number')
        .appendField('  stop price')
      this.moveInputBefore('STOP_PRICE', 'SL_TOGGLE')
    }
    if (state.sl) {
      this.toggleSL_(true)
      if (state.slMode && state.slMode !== 'PCT') {
        this.updateSLMode_(state.slMode)
      }
    }
    if (state.tp) {
      this.toggleTP_(true)
      if (state.tpMode && state.tpMode !== 'PCT') {
        this.updateTPMode_(state.tpMode)
      }
    }
    if (state.exitAfter) this.toggleExitAfter_(true)
    if (state.exitWhen) this.toggleExitWhen_(true)
  },
}

Blockly.Blocks.liquidate = {
  init() {
    this.appendDummyInput().appendField('liquidate position')
    this.setPreviousStatement(true, null)
    this.setNextStatement(true, null)
    this.setColour(330)
    this.setTooltip('Close entire position')
  },
}
