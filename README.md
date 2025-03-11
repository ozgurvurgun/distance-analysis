# Bootstrap Reaction Time Analysis

## Overview
This project processes reaction time data from experimental participants, applies bootstrap resampling, and stores the results in CSV and JSON files for further analysis.

## Components

### 1. **Bootstrapper**
- Runs bootstrap resampling on reaction time data.
- Selects random elements per distance to generate new datasets.
- Stores results separately for congruent and incongruent conditions.

### 2. **ReactionTimeProcessor**
- Loads and parses reaction time data from CSV files.
- Computes average reaction times for different distance pairs.
- Organizes data into congruent and incongruent conditions.

### 3. **Utility Functions**
- Reads directory contents.
- Saves processed data as CSV.
- Filters data based on specific criteria.
- Adds key-value pairs to objects.

### 4. **Main Execution (Pipeline)**
- Reads participant data files.
- Processes reaction times.
- Runs bootstrap resampling.
- Saves detailed and summarized results as CSV and JSON files.

## File Structure
```
project_root/
│── src/
│   ├── Bootstrapper.js
│   ├── ReactionTimeProcessor.js
│   ├── utils.js
│── participant_data/
│   ├── large/
│   ├── small/
│── analysis_result/
│   ├── detail/
│   ├── large_results.csv
│   ├── small_results.csv
│── main.js
```

## How to Run
1. Place participant CSV files inside `participant_data/large/` or `participant_data/small/`.
2. Execute the main script:
   ```sh
   node main.js
   ```
3. Processed results will be saved inside the `analysis_result/` directory.

## Output
- **Detailed Results**: Individual bootstrap samples per participant (`analysis_result/detail/`)
- **Summarized Results**: Aggregated statistics (`analysis_result/large_results.csv`, `analysis_result/small_results.csv`)

## Dependencies
- Node.js
- `fs` (File system operations)
- `papaparse` (CSV parsing)

## Notes
- Ensure CSV files have proper headers (`pairs`, `RT`).
- Bootstrap iterations can be adjusted in `Bootstrapper.js` (default = 5000).
- Adjust paths if running in a different environment.

