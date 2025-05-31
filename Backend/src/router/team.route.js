import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middle.js";
import { authorizeOrgRoles, getOrgAndRole } from "../middleware/org.middle.js";
import { getTeamAndRole, authorizeTeamRoles } from "../middleware/team.middle.js";
import { 
    createTeam,
    updateTeam,
    deleteTeam,
    inviteMemberForTeam,
    acceptInviteForTeam,
    declineInviteForTeam,
    removeMemberFromTeam,
    changeTeamMemberRole,
    leaveTeam,
    transferOwnershipOfTeam
} from "../controllers/team.control.js";


const teamRouter = Router();


teamRouter.route('/:orgId/createTeam').post(verifyJwt, getOrgAndRole, authorizeOrgRoles(['admin','moderator','leader']), createTeam);

teamRouter.route('/:orgId/updateTeam/:teamId').put(verifyJwt, getOrgAndRole, getTeamAndRole, authorizeTeamRoles(['admin', 'moderator', 'leader']), updateTeam);

teamRouter.route('/:orgId/deleteTeam/:teamId').delete(verifyJwt, getOrgAndRole, getTeamAndRole, authorizeTeamRoles(['admin']), deleteTeam);

teamRouter.route('/:orgId/inviteMemberForTeam/:teamId').post(verifyJwt, getOrgAndRole, getTeamAndRole, authorizeTeamRoles(['admin']), inviteMemberForTeam);

teamRouter.route('/acceptInviteForTeam/:inviteId').patch(verifyJwt, acceptInviteForTeam)

teamRouter.route('/declineInviteForTeam/:inviteId').delete(verifyJwt, declineInviteForTeam)

teamRouter.route('/:orgId/removeMemberFromTeam/:teamId/:memberId').delete(verifyJwt, getOrgAndRole, getTeamAndRole, authorizeTeamRoles(['admin']), removeMemberFromTeam);

teamRouter.route('/:orgId/changeTeamMemberRole/:teamId/:memberId').patch(verifyJwt, getOrgAndRole, getTeamAndRole, authorizeTeamRoles(['admin','moderator']), changeTeamMemberRole);

teamRouter.route('/:orgId/leaveTeam/:teamId').post(verifyJwt, getOrgAndRole, getTeamAndRole, leaveTeam);

teamRouter.route('/:orgId/transferOwnershipOfTeam/:teamId/:memberId').patch(verifyJwt, getOrgAndRole, getTeamAndRole, authorizeTeamRoles(['admin']), transferOwnershipOfTeam);


export default teamRouter;