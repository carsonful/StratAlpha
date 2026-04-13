const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Conditions',
      colour: '210',
      contents: [
        { kind: 'block', type: 'when' },
        { kind: 'block', type: 'compare' },
        { kind: 'block', type: 'crosses_above' },
        { kind: 'block', type: 'crosses_below' },
        { kind: 'block', type: 'logic_and' },
        { kind: 'block', type: 'logic_or' },
        { kind: 'block', type: 'logic_not' },
      ],
    },
    {
      kind: 'category',
      name: 'Data',
      colour: '45',
      contents: [{ kind: 'block', type: 'data_price' }],
    },
    {
      kind: 'category',
      name: 'Indicators',
      colour: '160',
      contents: [
        { kind: 'block', type: 'ind_sma' },
        { kind: 'block', type: 'ind_ema' },
        { kind: 'block', type: 'ind_rsi' },
        { kind: 'block', type: 'ind_atr' },
        { kind: 'block', type: 'ind_boll_upper' },
        { kind: 'block', type: 'ind_boll_middle' },
        { kind: 'block', type: 'ind_boll_lower' },
      ],
    },
    {
      kind: 'category',
      name: 'Orders',
      colour: '330',
      contents: [
        { kind: 'block', type: 'order' },
        { kind: 'block', type: 'liquidate' },
      ],
    },
    {
      kind: 'category',
      name: 'Position',
      colour: '260',
      contents: [
        { kind: 'block', type: 'pos_is_invested' },
        { kind: 'block', type: 'pos_quantity' },
        { kind: 'block', type: 'pos_avg_price' },
        { kind: 'block', type: 'portfolio_cash' },
        { kind: 'block', type: 'portfolio_equity' },
      ],
    },
    {
      kind: 'category',
      name: 'Math',
      colour: '230',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_arithmetic' },
      ],
    },
  ],
}

export default toolbox
