import pandas as pd

def getBack(df: pd.DataFrame) -> float:
    df.columns = df.columns.str.strip().str.lower()

    if "open" not in df.columns:
        raise ValueError(f"!!CSV must contain an 'open' column. Found columns: {list(df.columns)}")

    return float(df["open"].max())