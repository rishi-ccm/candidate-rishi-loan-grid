# candidate-rishi-loan-grid
Day-2 Assessment

---

## Architecture

- **Framework**: Vue 3 with Composition API + TypeScript  
- **State Management**:  
  - Chose **Pinia** for centralized state management and persistence across components  
  - *Alternative*: A plain composable (e.g. `useLoanStore()`) could have been used instead of Pinia  
- **Filtering & Sorting**:  
  - **Search**: Borrower name 
  - **Status**: Pending / Approved / Rejected  
  - **Min/Max Amount**: Numeric range  
  - **Close Date Range**: Start → End date  
  - **Sorting**: Clickable column headers
- **Pagination**:  
  - “Rows per load” selector  
  - Incremental loading on scroll  

---

## 🔍 Filters

The **LoanTable** supports the following filters:

- **Search** → Matches borrower name or ID  
- **Status** → Filter by loan status (`Pending`, `Approved`, `Rejected`)  
- **Min/Max Amount** → Enter a minimum and/or maximum loan amount to filter results  
- **Close Date Range** → Pick start and end dates to restrict loans by close date  

**Example**:  
Setting *Min Amount = 1000* and *Max Amount = 5000* will only show loans between **$1,000 and $5,000**.  

## 🚀 Run Instructions

Clone the repo and install dependencies:

```sh
git clone <your-repo-url>
cd candidate-rishi-loan-grid
npm install

## 🧪 Test Instructions

npm run test 
OR 
npx vitest --config vitest.config.ts

