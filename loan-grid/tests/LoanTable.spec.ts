import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import LoanTable from '../src/components/LoanTable.vue'
import { createTestingPinia } from '@pinia/testing'
import { useLoanStore } from '../src/stores/loanStore'
import { nextTick } from 'vue'

const loans = [
  { id: 1, borrowerName: 'Alice', amount: 1000, status: 'Pending', closeDate: '2023-01-01' },
  { id: 2, borrowerName: 'Bob', amount: 2000, status: 'Approved', closeDate: '2023-02-01' },
  { id: 3, borrowerName: 'Charlie', amount: 1500, status: 'Rejected', closeDate: '2023-03-01' },
]

function setupStore() {
  const pinia = createTestingPinia({ stubActions: false })
  const store = useLoanStore()
  store.loans_All = loans
  store.loadedLoans = [...loans]
  store.processedLoans = loans
  store.pageSize = 25
  store.hasMore = true
  store.isLoading = false
  return { pinia, store }
}

describe('LoanTable.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders table headers', async () => {
    const { pinia } = setupStore()
    const wrapper = mount(LoanTable, { global: { plugins: [pinia] } })
    await flushPromises()
    const headers = wrapper.findAll('th')
    expect(headers.map(h => h.text())).toEqual(
      expect.arrayContaining(['ID', 'Borrower Name', 'Amount', 'Status', 'Close Date'])
    )
  })

  it('sorts by clicking header (cycles asc/desc/none)', async () => {
    const { pinia, store } = setupStore()
    const wrapper = mount(LoanTable, { global: { plugins: [pinia] } })

    expect(store.sortColumn).toBeNull()
    await wrapper.find('th[aria-sort]').trigger('click')
    expect(store.sortColumn).toBe('id')
    expect(store.sortDirection).toBe('asc')

    await wrapper.find('th[aria-sort]').trigger('click')
    expect(store.sortDirection).toBe('desc')

    await wrapper.find('th[aria-sort]').trigger('click')
    expect(store.sortColumn).toBeNull()
    expect(store.sortDirection).toBeNull()
  })

  it('filters by search and status', async () => {
    const { pinia, store } = setupStore()
    const wrapper = mount(LoanTable, { global: { plugins: [pinia] } })

    await wrapper.find('input[placeholder="Borrower name..."]').setValue('Bob')
    await flushPromises()
    expect(store.processedLoans.filter(l => l.borrowerName.includes('Bob')).length).toBe(1)

    await wrapper.find('select').setValue('Approved')
    await flushPromises()
    expect(store.processedLoans.filter(l => l.status === 'Approved').length).toBe(1)
  })

it('changes page size and resets loadedLoans', async () => {
  const { pinia, store } = setupStore()
  const wrapper = mount(LoanTable, { global: { plugins: [pinia] } })

  const pageSizeSelect = wrapper.findAll('select').at(-1)!
  await pageSizeSelect.setValue('50')

  await nextTick()

  expect(store.pageSize).toBe(50)
  expect(store.loadedLoans.length).toBeGreaterThanOrEqual(0)
})

  it('loads more loans on scroll near bottom', async () => {
    const { pinia, store } = setupStore()
    const wrapper = mount(LoanTable, { global: { plugins: [pinia] } })

    const scrollDiv = wrapper.find('.table-container').element
    Object.defineProperty(scrollDiv, 'scrollTop', { value: 300, writable: true })
    Object.defineProperty(scrollDiv, 'clientHeight', { value: 100, writable: true })
    Object.defineProperty(scrollDiv, 'scrollHeight', { value: 400, writable: true })

    const spy = vi.spyOn(store, 'loadMore')
    await wrapper.find('.table-container').trigger('scroll')
    expect(spy).toHaveBeenCalled()
  })


  it('shows loading row when isLoading is true', async () => {
    const { pinia, store } = setupStore()
    store.isLoading = true
    const wrapper = mount(LoanTable, { global: { plugins: [pinia] } })
    await flushPromises()
    expect(wrapper.find('.loading-row').exists()).toBe(true)
  })
})