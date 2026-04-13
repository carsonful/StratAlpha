from AlgorithmImports import *


class BlocklyStrategy(QCAlgorithm):

    def initialize(self):
        self.set_start_date(2020, 1, 1)
        self.set_end_date(2024, 12, 31)
        self.set_cash(100000)
        self.symbol = self.add_equity("AAPL", Resolution.DAILY).symbol
        self._ind_1 = self.bb(self.symbol, 20, 3.0, resolution=Resolution.DAILY)
        self._prev_1 = None
        self._prev_2 = None

    def on_data(self, data: Slice):
        if not data.contains_key(self.symbol):
            return
        if (self._prev_1 is not None and self._prev_1 <= self._prev_2 and self.securities[self.symbol].price > (self._ind_1.upper_band.current.value if self._ind_1.is_ready else 0)):
            self.market_order(self.symbol, 100)

        self._prev_1 = self.securities[self.symbol].price
        self._prev_2 = (self._ind_1.upper_band.current.value if self._ind_1.is_ready else 0)
