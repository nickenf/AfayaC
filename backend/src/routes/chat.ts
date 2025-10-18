import { Router } from 'express'

const router = Router()

// TODO: Implement chat routes
router.get('/', (req, res) => {
  res.json({ message: 'Chat routes' })
})

export default router