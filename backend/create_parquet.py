import pandas as pd
import numpy as np
import os

# Function to create a parquet file of approx target size in MB in order to test upload limits in uploader.py

def create_parquet_file(filename: str, target_size_mb: int):
    # Estimate rows needed for approx target size
    # 10 columns of float64 ~ 80 bytes per row
    rows = int(target_size_mb * 1024 * 1024 / 80)

    # Create DataFrame with random floats
    df = pd.DataFrame(np.random.rand(rows, 10), columns=[f"col{i}" for i in range(10)])

    # Save as parquet (requires pyarrow or fastparquet)
    df.to_parquet(filename, engine='pyarrow', compression=None)

        # Measure actual size
    size_mb = os.path.getsize(filename) / (1024 * 1024)
    print(f"Target: {target_size_mb} MB → Actual: {size_mb:.2f} MB")

if __name__ == "__main__":
    create_parquet_file("test_under_50mb.parquet", 40)# ~40MB
    create_parquet_file("test_over_50mb.parquet", 80)   # ~80MB
