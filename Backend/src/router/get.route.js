import { Router } from "express";
import { verifyJwt } from '../middleware/auth.middle.js';
import { getOrgAndRole } from "../middleware/org.middle.js";
import { getProjectandRole } from "../middleware/project.middle.js"
import { 
    getOrg, 
    getProject,
 } from "../controllers/get.js";


const getRouter = Router();


getRouter.route('/getOrg/:orgId').get(verifyJwt, getOrgAndRole, getOrg);

getRouter.route('/:orgId/getProject/:projectId').get(verifyJwt, getOrgAndRole, getProjectandRole, getProject)


export default getRouter;