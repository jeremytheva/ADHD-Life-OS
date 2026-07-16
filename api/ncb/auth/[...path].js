import { createNcbHandler } from '../handler.js'

export const config = { api: { bodyParser: false } }

export default createNcbHandler('auth')
