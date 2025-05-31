import { Router } from "express";
import { verifyJwt } from '../middleware/auth.middle.js'
import { getProjectandRole, authorizeProjectRoles } from '../middleware/project.middle.js'
import {
    createTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    addComment,
    deleteComment,
    addLink,
    deleteLink,
    addAttachment,
    deleteAttachment,
} from '../controllers/task.control.js'
import { upload } from "../middleware/multer.middle.js";
import { getOrgAndRole } from "../middleware/org.middle.js";


const taskRouter = Router();


taskRouter.route('/:orgId/:projectId/:sectionId/createTask').post(verifyJwt, getOrgAndRole, getProjectandRole, authorizeProjectRoles(['admin', 'moderator', 'leader', 'member']), upload.array('attachments'), createTask);    

taskRouter.route('/:orgId/:projectId/:sectionId/updateTask/:taskId').put(verifyJwt, getOrgAndRole, getProjectandRole, authorizeProjectRoles(['admin', 'moderator', 'leader', 'member']), updateTask);

taskRouter.route('/:orgId/:projectId/:sectionId/deleteTask/:taskId').delete(verifyJwt, getOrgAndRole, getProjectandRole, authorizeProjectRoles(['admin', 'moderator', 'leader', 'member']), deleteTask);

taskRouter.route('/:orgId/:projectId/:sectionId/addSubTask/:taskId').post(verifyJwt, getOrgAndRole, getProjectandRole, authorizeProjectRoles(['admin', 'moderator', 'leader', 'member']), addSubtask);

taskRouter.route('/:orgId/:projectId/:sectionId/updateSubTask/:taskId/:subTaskId').put(verifyJwt, getOrgAndRole, getProjectandRole, authorizeProjectRoles(['admin', 'moderator', 'leader', 'member']), updateSubtask);

taskRouter.route('/:orgId/:projectId/:sectionId/deleteSubTask/:taskId/:subTaskId').delete(verifyJwt, getOrgAndRole, getProjectandRole, authorizeProjectRoles(['admin', 'moderator', 'leader', 'member']), deleteSubtask);

taskRouter.route('/:orgId/:projectId/:sectionId/addComment/:taskId').post(verifyJwt, getOrgAndRole, getProjectandRole, authorizeProjectRoles(['admin', 'moderator', 'leader', 'member']), addComment);

taskRouter.route('/deleteComment/:taskId/:commentId').delete(verifyJwt, deleteComment);

taskRouter.route('/:orgId/:projectId/:sectionId/addLink/:taskId').post(verifyJwt, getOrgAndRole, getProjectandRole, authorizeProjectRoles(['admin', 'moderator', 'leader', 'member']), addLink);

taskRouter.route('/deleteLink/:taskId/:linkId').delete(verifyJwt, deleteLink);

taskRouter.route('/:orgId/:projectId/:sectionId/addAttachment/:taskId').post(verifyJwt, getOrgAndRole, getProjectandRole, authorizeProjectRoles(['admin', 'moderator', 'leader', 'member']),upload.single('attachments'),  addAttachment);

taskRouter.route('/deleteAttachment/:taskId/:attachmentId').delete(verifyJwt, deleteAttachment);


export default taskRouter;