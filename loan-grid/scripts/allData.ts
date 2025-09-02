import fs from 'fs'

function seedRandom(seed: number) {
  return function() {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }
}

const total = 50000
const statuses = ['Pending', 'Approved', 'Rejected'] as const
const random = seedRandom(12345)

const loans = Array.from({ length: total }, (_, i) => ({
  id: i + 1,
  borrowerName: `Name ${String(i + 1).padStart(5,'0')}`,
  amount: Math.floor(random() * 100000) + 1000,
  status: statuses[i % statuses.length],
  closeDate: new Date(2025, 0, (i % 30) + 1).toISOString().slice(0, 10)
}))

fs.writeFileSync('public/data/loans.json', JSON.stringify(loans, null, 2))

fs.writeFileSync('public/data/loans_100.json', JSON.stringify(loans.slice(0, 100), null, 2))

console.log('50,000 seeded loans generated, 100 loan sample saved')
