import { Router } from 'express'
import { verifyJwt } from '../middleware/auth.middle.js'
import { authorizeOrgRoles, getOrgAndRole } from '../middleware/org.middle.js';
import { upload } from '../middleware/multer.middle.js';
import { 
    createOrg,
    updateOrg,
    deleteOrg,
    inviteMember,
    acceptInviteForOrg,
    declineInviteForOrg,
    removeMemberFromOrg,
    changeOrgMemberRole,
    leaveOrg,
    transferOwnershipOfOrg
} from '../controllers/org.control.js';



const orgRouter = Router();


orgRouter.route('/createOrg').post(verifyJwt,
  upload.single(
   'orgProfilePhoto'
  ),
  createOrg
);

orgRouter.route('/updateOrg/:orgId').put(verifyJwt, getOrgAndRole, authorizeOrgRoles(['admin','moderator']), 
  upload.single(
     'orgProfilePhoto'
    ),
  updateOrg
);

orgRouter.route('/deleteOrg/:orgId').delete(verifyJwt, getOrgAndRole, authorizeOrgRoles(['admin']), deleteOrg);

orgRouter.route('/inviteMember/:orgId').post(verifyJwt, getOrgAndRole, authorizeOrgRoles(['admin']), inviteMember);

orgRouter.route('/acceptInviteForOrg/:inviteId').patch(verifyJwt, acceptInviteForOrg);

orgRouter.route('/declineInviteForOrg/:inviteId').delete(verifyJwt, declineInviteForOrg);

orgRouter.route('/:orgId/removeMemberFromOrg/:memberId').delete(verifyJwt, getOrgAndRole, authorizeOrgRoles(['admin']), removeMemberFromOrg);

orgRouter.route('/:orgId/changeOrgMemberRole/:memberId').patch(verifyJwt, getOrgAndRole, authorizeOrgRoles(['admin','moderator']), changeOrgMemberRole);

orgRouter.route('/:orgId/leaveOrg/').post(verifyJwt, getOrgAndRole, leaveOrg);

orgRouter.route('/:orgId/transferOwnershipOfOrg/:memberId').patch(verifyJwt, getOrgAndRole, authorizeOrgRoles(['admin']), transferOwnershipOfOrg);


export default orgRouter;