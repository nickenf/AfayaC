import { Router } from 'express'

const router = Router()

// TODO: Implement services routes
router.get('/', (req, res) => {
  res.json({ message: 'Services routes' })
})

export default router