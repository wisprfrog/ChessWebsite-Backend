import router from "express"
import getPruebaQuery from "../controllers/prueba_query.controller.js"

const pruebaQueryRouter = router.Router()
pruebaQueryRouter.get("/todos", getPruebaQuery)

export default pruebaQueryRouter