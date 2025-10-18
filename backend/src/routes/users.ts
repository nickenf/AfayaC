import { Router } from 'express'

const router = Router()

// TODO: Implement user routes
router.get('/', (req, res) => {
  res.json({ message: 'Users routes' })
})

export default router