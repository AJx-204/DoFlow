import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middle.js";
import { authorizeProjectRoles, getProjectandRole } from "../middleware/project.middle.js";
import { getOrgAndRole } from "../middleware/org.middle.js";
import { 
    createSection,
    updateSection,
    deleteSection,
    transferOwnerShipOfSection
} from "../controllers/section.control.js";


const sectionRouter = Router();


sectionRouter.route('/:orgId/:projectId/createSection').post(verifyJwt, getOrgAndRole, getProjectandRole, authorizeProjectRoles(['admin', 'moderator', 'leader']), createSection)

sectionRouter.route('/:orgId/:projectId/updateSection/:sectionId').put(verifyJwt, getOrgAndRole, getProjectandRole, authorizeProjectRoles(['admin', 'moderator', 'leader']), updateSection);

sectionRouter.route('/:orgId/:projectId/deleteSection/:sectionId').delete(verifyJwt, getOrgAndRole, getProjectandRole, deleteSection);

sectionRouter.route('/:orgId/:projectId/transferOwnerShipOfSection/:sectionId/:memberId').patch(verifyJwt, getOrgAndRole, getProjectandRole, transferOwnerShipOfSection);


export default sectionRouter;