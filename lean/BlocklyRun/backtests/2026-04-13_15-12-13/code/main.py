from AlgorithmImports import *


class BlocklyStrategy(QCAlgorithm):

    def initialize(self):
        self.set_start_date(2020, 1, 1)
        self.set_end_date(2024, 12, 31)
        self.set_cash(100000)
        self.symbol = self.add_equity("AAPL", Resolution.DAILY).symbol
        self._bar_count = 0
        self._ind_1 = self.bb(self.symbol, 20, 2.0, resolution=Resolution.DAILY)
        self._prev_1 = None
        self._prev_2 = None
        self._entry_bar_1 = -1
        self._entry_price_1 = 0.0

    def on_data(self, data: Slice):
        if not data.contains_key(self.symbol):
            return
        self._bar_count += 1

        if self.portfolio[self.symbol].invested and self._entry_bar_1 > 0:
            if self._bar_count - self._entry_bar_1 >= 5:
                self.liquidate(self.symbol)
                self._entry_bar_1 = -1

        if (self._prev_1 is not None and self._prev_1 <= self._prev_2 and self.securities[self.symbol].price > (self._ind_1.upper_band.current.value if self._ind_1.is_ready else 0)):
            self.market_order(self.symbol, 100)
            self._entry_bar_1 = self._bar_count
            self._entry_price_1 = self.securities[self.symbol].price

        self._prev_1 = self.securities[self.symbol].price
        self._prev_2 = (self._ind_1.upper_band.current.value if self._ind_1.is_ready else 0)
