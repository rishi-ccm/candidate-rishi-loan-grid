<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useLoanStore } from '../stores/loanStore'

const store = useLoanStore()
const scrollContainer = ref<HTMLElement | null>(null)

function handleScroll() {
  const el = scrollContainer.value
  if (!el) return
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
    store.loadMore()
  }
}

function exportCSV() {
  const topLoans = store.loadedLoans.slice(0, store.pageSize)

  const headers = ['ID', 'Borrower Name', 'Amount', 'Status', 'Close Date']
  const rows = topLoans.map(l => [
    l.id,
    `"${l.borrowerName}"`,
    l.amount,
    l.status,
    new Date(l.closeDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  ])
  const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'loans_export.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}


onMounted(() => {
  store.resetAndLoad()
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <div class="controls">
    <label>
      <input placeholder="search name" v-model="store.searchQuery"/>
    </label>
    <label>
      <select data-testid="page-size" v-model="store.selectedStatus">
        <option>All</option>
        <option>Pending</option>
        <option>Approved</option>
        <option>Rejected</option>
      </select>
    </label>
    <label>
      <input placeholder="Min Amount" type="number" v-model.number="store.minAmount" />
    </label>
    <label>
      <input placeholder="Max Amount" type="number" v-model.number="store.maxAmount" />
    </label>
    <label>
      <input placeholder="Start Date" type="date" v-model="store.startDate" />
    </label>
    <label>
      <input placeholder="End Date" type="date" v-model="store.endDate" />
    </label>

    <label>
      <select v-model.number="store.pageSize" @change="store.updatePageSize(store.pageSize)">
        <option :value="25">25</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
    </label>
  <button class="export-btn" @click="exportCSV">Export CSV</button>

  </div>

  <div ref="scrollContainer" class="table-container">
    <table class="classic-table">
      <thead>
        <tr>
          <th :aria-sort="store.getAriaSort('id')" @click="store.toggleSort('id')">
            ID <span v-if="store.sortColumn==='id'">{{ store.sortDirection==='asc' ? '▲' : store.sortDirection==='desc' ? '▼' : '' }}</span>
          </th>
          <th :aria-sort="store.getAriaSort('borrowerName')" @click="store.toggleSort('borrowerName')">
            Borrower Name <span v-if="store.sortColumn==='borrowerName'">{{ store.sortDirection==='asc' ? '▲' : store.sortDirection==='desc' ? '▼' : '' }}</span>
          </th>
          <th :aria-sort="store.getAriaSort('amount')" @click="store.toggleSort('amount')">
            Amount <span v-if="store.sortColumn==='amount'">{{ store.sortDirection==='asc' ? '▲' : store.sortDirection==='desc' ? '▼' : '' }}</span>
          </th>
          <th :aria-sort="store.getAriaSort('status')" @click="store.toggleSort('status')">
            Status <span v-if="store.sortColumn==='status'">{{ store.sortDirection==='asc' ? '▲' : store.sortDirection==='desc' ? '▼' : '' }}</span>
          </th>
          <th :aria-sort="store.getAriaSort('closeDate')" @click="store.toggleSort('closeDate')">
            Close Date <span v-if="store.sortColumn==='closeDate'">{{ store.sortDirection==='asc' ? '▲' : store.sortDirection==='desc' ? '▼' : '' }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="loan in store.loadedLoans" :key="loan.id">
          <td>{{ loan.id }}</td>
          <td>{{ loan.borrowerName }}</td>
          <td>${{ loan.amount.toLocaleString() }}</td>
          <td>{{ loan.status.toUpperCase() }}</td>
          <td class="custom_date">{{ new Date(loan.closeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</td>
        </tr> 
        <tr v-if="store.isLoading" class="loading-row">
          <td colspan="5">
            <span class="spinner" aria-label="Loading"></span>
            <i class="fa fa-copy"></i>
            Loading more rows...
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!store.hasMore && store.loadedLoans.length > 0" class="end-message">
      No more loans
    </div>
    <div v-else-if="!store.isLoading && store.loadedLoans.length === 0" class="end-message">
      No matching loans
    </div>
  </div>
</template>


<style scoped>
.controls {
  margin-bottom: 10px;
  font-size: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.controls label {
  display: flex;
  flex-direction: column;
  font-size: 13px;
}
.controls input,
.controls select {
  margin-top: 2px;
  padding: 4px 6px;
  border: 1px solid #aaa;
  font-size: 13px;
}
.table-container {
  height: 400px;
  overflow-y: auto;
  border: 1px solid #ccc;
  background: #fff;
}
.classic-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.custom_date{
  color: rgb(103, 103, 103);
}
.classic-table th {
  border: 1px solid #ccc;  padding: 8px;
  text-align: left;
  cursor: pointer;
}
.classic-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
}
.classic-table th {
  background: #000;
  color: #fff;
  font-weight: bold;
  user-select: none;
}
.classic-table th span {
  margin-left: 5px;
  font-size: 12px;
}
.classic-table tr:nth-child(even) {
  background: #fafafa;
}
.classic-table tr:hover {
  background: #f1f1f1;
}
.loading-row td {
  text-align: center;
  font-style: italic;
  padding: 12px;
}
.end-message {
  text-align: center;
  padding: 10px;
  font-size: 13px;
  color: #555;
  background: #f9f9f9;
  border-top: 1px solid #ccc;
}
.spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid #ccc;
  border-top: 2px solid #333;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
  margin-right: 8px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.export-btn {
  padding: 6px 14px;
  font-size: 13px;
  border: 1px solid #aaa;
  background: #000000;
  color: #ffffff;
  border-radius: 4px;
  margin-top: 2px;
  cursor: pointer;
}
.export-btn:hover {
  opacity: 0.7;
}
</style>

