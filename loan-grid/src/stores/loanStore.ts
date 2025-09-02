import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Loan } from '../types/loan'
import loansData_AllRaw from '../../public/data/loans.json'

const loansData_All: Loan[] = loansData_AllRaw as Loan[];

export const useLoanStore = defineStore('loanStore', () => {
  const loans_All = ref<Loan[]>(loansData_All)
  const loadedLoans = ref<Loan[]>([])

  const pageSize = ref(25)
  const isLoading = ref(false)
  const hasMore = ref(true)

  const searchQuery = ref('')
  const selectedStatus = ref('All')
  const minAmount = ref<number | null>(null)
  const maxAmount = ref<number | null>(null)
  const startDate = ref<string | null>(null)
  const endDate = ref<string | null>(null)

  const sortColumn = ref<keyof Loan | null>(null)
  const sortDirection = ref<'asc' | 'desc' | null>(null)

  function toggleSort(column: keyof Loan) {
    if (sortColumn.value !== column) {
      sortColumn.value = column
      sortDirection.value = 'asc'
    } else {
      if (sortDirection.value === 'asc') {
        sortDirection.value = 'desc'
      } else if (sortDirection.value === 'desc') {
        sortDirection.value = null
        sortColumn.value = null
      } else {
        sortDirection.value = 'asc'
      }
    }
    resetAndLoad()
  }

  function getAriaSort(column: keyof Loan) {
    if (sortColumn.value !== column) return 'none'
    return sortDirection.value === 'asc'
      ? 'ascending'
      : sortDirection.value === 'desc'
      ? 'descending'
      : 'none'
  }

  const filteredLoans = computed(() =>
    loans_All.value.filter((loan) => {
      if (
        searchQuery.value &&
        !loan.borrowerName.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
        return false
      if (selectedStatus.value !== 'All' && loan.status !== selectedStatus.value) return false
      if (minAmount.value !== null && loan.amount < minAmount.value) return false
      if (maxAmount.value !== null && loan.amount > maxAmount.value) return false
      if (startDate.value && loan.closeDate < startDate.value) return false
      if (endDate.value && loan.closeDate > endDate.value) return false
      return true
    })
  )

  const processedLoans = computed(() => {
    let arr = [...filteredLoans.value]
    if (sortColumn.value && sortDirection.value) {
      arr.sort((a, b) => {
        const col = sortColumn.value as keyof Loan
        let valA = a[col]
        let valB = b[col]

        if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase()
          valB = valB.toLowerCase()
        }

        if (valA < valB) return sortDirection.value === 'asc' ? -1 : 1
        if (valA > valB) return sortDirection.value === 'asc' ? 1 : -1
        return 0
      })
    }
    return arr
  })

  async function loadMore() {
    if (isLoading.value || !hasMore.value) return
    isLoading.value = true

    await new Promise((r) => setTimeout(r, 500)) 

    const nextIndex = loadedLoans.value.length
    const nextBatch = processedLoans.value.slice(nextIndex, nextIndex + pageSize.value)

    if (nextBatch.length > 0) {
      loadedLoans.value.push(...nextBatch)
    }
    if (loadedLoans.value.length >= processedLoans.value.length) {
      hasMore.value = false
    }

    isLoading.value = false
  }

  function resetAndLoad() {
    loadedLoans.value = []
    hasMore.value = true
    loadMore()
  }

  function updatePageSize(newSize: number) {
    pageSize.value = newSize
    resetAndLoad()
  }

  watch(
    [searchQuery, selectedStatus, minAmount, maxAmount, startDate, endDate, sortColumn, sortDirection],
    () => resetAndLoad()
  )

  return {
    loans_All,
    loadedLoans,
    pageSize,
    isLoading,
    hasMore,
    searchQuery,
    selectedStatus,
    minAmount,
    maxAmount,
    startDate,
    endDate,
    sortColumn,
    sortDirection,
    processedLoans,
    toggleSort,
    getAriaSort,
    loadMore,
    resetAndLoad,
    updatePageSize,
  }
})
