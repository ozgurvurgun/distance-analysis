### **Bootstrap Reaction Time Analysis**  

## **Overview**  
This project processes reaction time data from experimental participants, applies bootstrap resampling, and organizes the results in a structured format for further analysis.  

## **Pipeline**  
1. Reads participant data files.  
2. Processes reaction times.  
3. Runs bootstrap resampling.  
4. Saves detailed and summarized results in structured directories.  

## **File Structure**  
```
DISTANCE-ANALYSIS/
│── analysis_result/
│   ├── bootstrap_detail/
│   │   ├── congruent/
│   │   ├── incongruent/
│   ├── by_size/
│   ├── compatibility/
│── bin/
│   ├── run.js
│── participant_data/
│   ├── large/
│   ├── small/
│── src/
│   ├── processors/
│   │   ├── Bootstrapper.js
│   │   ├── ReactionTimeProcessor.js
│   ├── utils/
│   │   ├── utils.js
```  

## **Components**  

### 1. **Bootstrapper (`Bootstrapper.js`)**  
- Runs bootstrap resampling on reaction time data.  
- Selects random elements per distance to generate new datasets.  
- Stores results separately for congruent and incongruent conditions in `analysis_result/bootstrap_detail/`.  

### 2. **Reaction Time Processor (`ReactionTimeProcessor.js`)**  
- Loads and parses reaction time data from CSV files.  
- Computes average reaction times for different distance pairs.  
- Organizes data into congruent and incongruent conditions.  

### 3. **Utility Functions (`utils.js`)**  
- Reads directory contents.  
- Saves processed data as CSV.  
- Filters data based on specific criteria.  
- Computes averages for different response categories.  

### 4. **Main Execution (`run.js`)**  
- Reads participant data files from `participant_data/`.  
- Processes reaction times and applies bootstrap resampling.  
- Saves results in multiple structured directories:  
  - **`bootstrap_detail/`** → Stores congruent and incongruent bootstrap results.  
  - **`by_size/`** → Stores average reaction times categorized by size (small/large pairs).  
  - **`compatibility/`** → Stores summarized compatibility analysis results.  

## **How to Run**  
1. Place participant CSV files inside `participant_data/large/` or `participant_data/small/`.  
2. Execute the main script:  
   ```sh
   node bin/run.js
   ```  
3. Processed results will be saved inside `analysis_result/`.  

## **Output Structure**  
- **Detailed Bootstrap Results:** `analysis_result/bootstrap_detail/`  
- **Size-Based Averages:** `analysis_result/by_size/`  
- **Compatibility Analysis:** `analysis_result/compatibility/`  

## **Dependencies**  
- Node.js  
- `fs` (File system operations)  
- `papaparse` (CSV parsing)  

## **Notes**  
- Ensure CSV files have proper headers (`pairs`, `RT`, `size`, `Response`).  
- Bootstrap iterations can be adjusted in `Bootstrapper.js` (default = 5000).  
- Adjust paths if running in a different environment.  
