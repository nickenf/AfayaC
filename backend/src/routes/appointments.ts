import { Router } from 'express'

const router = Router()

// TODO: Implement appointment routes
router.get('/', (req, res) => {
  res.json({ message: 'Appointments routes' })
})

export default router