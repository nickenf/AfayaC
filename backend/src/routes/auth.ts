import { Router } from 'express'

const router = Router()

// TODO: Implement authentication routes
router.get('/', (req, res) => {
  res.json({ message: 'Auth routes' })
})

export default router